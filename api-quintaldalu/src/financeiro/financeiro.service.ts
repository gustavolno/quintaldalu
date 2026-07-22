import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransacaoDto } from './dto/create-transacao.dto';

@Injectable()
export class FinanceiroService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTransacaoDto) {
    return this.prisma.transacao.create({
      data: {
        tipo: dto.tipo,
        descricao: dto.descricao,
        valor: dto.valor,
        categoria: dto.categoria,
        data: dto.data ? new Date(dto.data) : new Date(),
      },
    });
  }

  async findAll(inicio?: string, fim?: string) {
    const where: any = {};

    if (inicio || fim) {
      where.data = {};
      if (inicio) where.data.gte = new Date(inicio);
      if (fim) {
        const fimDate = new Date(fim);
        fimDate.setHours(23, 59, 59, 999);
        where.data.lte = fimDate;
      }
    }

    const transacoes = await this.prisma.transacao.findMany({
      where,
      orderBy: { data: 'desc' },
    });

    const receitas = transacoes
      .filter((t) => t.tipo === 'RECEITA')
      .reduce((acc, t) => acc + t.valor, 0);

    const despesas = transacoes
      .filter((t) => t.tipo === 'DESPESA')
      .reduce((acc, t) => acc + t.valor, 0);

    return {
      transacoes,
      resumo: {
        receitas,
        despesas,
        lucro: receitas - despesas,
      },
    };
  }

  async remove(id: number) {
    return this.prisma.transacao.delete({ where: { id } });
  }
}
