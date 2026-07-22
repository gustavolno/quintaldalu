import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreateTransacaoDto) {
    return this.financeiroService.create(dto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query('inicio') inicio?: string, @Query('fim') fim?: string) {
    return this.financeiroService.findAll(inicio, fim);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.financeiroService.remove(id);
  }
}
