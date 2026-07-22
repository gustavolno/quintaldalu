import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import * as QRCode from 'qrcode';
import pino from 'pino';
import * as path from 'path';
import { Boom } from '@hapi/boom';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private socket: any;
  private qrCodeData: string | null = null;
  private connectionStatus: 'DISCONNECTED' | 'WAITING_QR' | 'CONNECTED' = 'DISCONNECTED';
  private readonly logger = new Logger(WhatsappService.name);
  
  // Cache para não mandar mensagem duplicada (limite de 2 horas)
  private replyCache = new Map<string, number>();

  async onModuleInit() {
    this.logger.log('Iniciando módulo do WhatsApp...');
    await this.connectToWhatsApp();
  }

  async connectToWhatsApp() {
    const authFolder = path.join(process.cwd(), 'baileys_auth_info');
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion();

    this.socket = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }) as any,
    });

    this.socket.ev.on('creds.update', saveCreds);

    this.socket.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.connectionStatus = 'WAITING_QR';
        this.qrCodeData = await QRCode.toDataURL(qr);
        this.logger.log('Novo QR Code gerado! Aguardando leitura.');
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        this.logger.warn(`Conexão fechada. Motivo: ${lastDisconnect?.error?.message}. Reconectando: ${shouldReconnect}`);
        
        this.connectionStatus = 'DISCONNECTED';
        this.qrCodeData = null;

        if (shouldReconnect) {
          setTimeout(() => this.connectToWhatsApp(), 5000);
        } else {
          this.logger.error('WhatsApp foi desconectado pelo usuário no celular. Delete a pasta baileys_auth_info para conectar novamente.');
        }
      } else if (connection === 'open') {
        this.logger.log('✅ WhatsApp Conectado com Sucesso!');
        this.connectionStatus = 'CONNECTED';
        this.qrCodeData = null;
      }
    });

    this.socket.ev.on('messages.upsert', async (m: any) => {
      if (m.type !== 'notify') return;
      
      const msg = m.messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const senderJid = msg.key.remoteJid;
      if (!senderJid || senderJid.includes('@g.us')) return; // ignora grupos

      const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
      if (!text) return;

      const lowerText = text.toLowerCase();
      const triggers = ['boa noite', 'bom dia', 'boa tarde', 'oi', 'olá', 'ola', 'cardapio', 'cardápio', 'menu', 'pedido', 'pedir'];
      
      const isGreeting = triggers.some(t => lowerText.includes(t));
      
      if (isGreeting) {
        const now = Date.now();
        const lastReply = this.replyCache.get(senderJid);
        
        // Se respondeu nas últimas 2 horas (2 * 60 * 60 * 1000 = 7200000 ms), não manda de novo
        if (lastReply && (now - lastReply) < 7200000) {
          return;
        }

        this.logger.log(`Respondendo automaticamente para: ${senderJid}`);
        this.replyCache.set(senderJid, now);

        const replyMessage = `Olá! 🍕 Bem-vindo(a) ao Quintal da Lu!

Acesse nosso cardápio completo com preços e faça seu pedido direto pelo site:
👉 https://quintaldalu.vercel.app

Já escolheu? É só mandar o pedido que respondemos rapidinho! 😊`;

        await this.socket.sendMessage(senderJid, { text: replyMessage });
      }
    });
  }

  getStatus() {
    return {
      status: this.connectionStatus,
      qr: this.qrCodeData,
    };
  }

  async sendOrderConfirmation(phone: string, message: string) {
    if (this.connectionStatus !== 'CONNECTED' || !this.socket) {
      this.logger.error('Não é possível enviar mensagem: WhatsApp não conectado.');
      return false;
    }
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const jid = `55${cleanPhone}@s.whatsapp.net`;
      await this.socket.sendMessage(jid, { text: message });
      this.logger.log(`Mensagem de confirmação enviada para ${jid}`);
      return true;
    } catch (err) {
      this.logger.error('Erro ao enviar mensagem de confirmação: ' + err.message);
      return false;
    }
  }

  async logout() {
    if (this.socket) {
      await this.socket.logout();
      this.connectionStatus = 'DISCONNECTED';
      this.qrCodeData = null;
    }
  }
}
