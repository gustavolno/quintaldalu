import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Lista exata baseada na planilha do usuário
  const produtosParaInativar = [
    'Pizza Quatro Queijos',
    'Lombo com Catupiry',
    'Carne seca com cream cheese',
    'Calzone Quatro Queijos',
    'Água Mineral',
    'Suco Natural',
  ];

  try {
    const resultado = await prisma.product.updateMany({
      where: {
        OR: [
          // Correspondências exatas
          { nome: { in: produtosParaInativar } },
          // Correspondências parciais e insensíveis a maiúsculas/minúsculas para garantir a inativação
          { nome: { contains: 'Quatro Queijos', mode: 'insensitive' } },
          { nome: { contains: 'Carne Seca', mode: 'insensitive' } },
          { nome: { contains: 'Água Mineral', mode: 'insensitive' } },
          { nome: { contains: 'Suco Natural', mode: 'insensitive' } },
        ],
      },
      data: {
        ativo: false,
      },
    });

    console.log(`Sucesso! ${resultado.count} produtos foram inativados no cardápio.`);
  } catch (error) {
    console.error('Erro ao inativar produtos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();