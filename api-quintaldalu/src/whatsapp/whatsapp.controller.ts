import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @UseGuards(AuthGuard)
  @Get('status')
  getStatus() {
    return this.whatsappService.getStatus();
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout() {
    await this.whatsappService.logout();
    return { message: 'WhatsApp desconectado com sucesso.' };
  }

  // Rota pública para o site enviar a confirmação
  @Post('send-order')
  async sendOrder(@Body() body: { phone: string; message: string }) {
    if (!body.phone || !body.message) {
      return { success: false, error: 'Telefone e mensagem são obrigatórios' };
    }
    const sent = await this.whatsappService.sendOrderConfirmation(body.phone, body.message);
    return { success: sent };
  }
}
