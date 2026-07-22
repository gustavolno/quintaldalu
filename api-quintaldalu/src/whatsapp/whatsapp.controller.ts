import { Controller, Get, Post, UseGuards } from '@nestjs/common';
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
}
