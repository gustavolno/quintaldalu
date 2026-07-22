import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const produtosAtualizados = [
    { nome: 'Calabresa', price: 40.00 },
    { nome: 'Frango com catupiry', price: 42.00 },
    { nome: 'Portuguesa', price: 42.00 },
    { nome: 'Marguerita', price: 39.90 },
    { nome: 'Bacon', price: 40.00 },
    { nome: 'Calabresa Especial', price: 48.00 },
    { nome: 'Atum', price: 42.00 },
    { nome: 'Milho', price: 38.90 },
    { nome: 'Moda da Casa', price: 48.00 },
    { nome: 'Mussarela Clássica', price: 38.90 },
    { nome: 'Chocolate com Morango', price: 43.00 },
    { nome: 'Prestigio / Chocolate com Coco', price: 43.00 },
    { nome: 'Romeu e Julieta', price: 39.90 },
    { nome: 'Banana com Canela', price: 39.90 },
    { nome: 'Calzone de Calabresa com Bacon', price: 29.90 },
    { nome: 'Calzone de Frango com Catupiry', price: 29.90 },
    { nome: 'Calzone Português', price: 29.90 },
    { nome: 'Calzone Doce de Chocolate', price: 29.90 },
    { nome: 'Refrigerante 2L', price: 13.00 },
    { nome: 'Refrigerante 1L/1,5L', price: 10.00 },
    { nome: 'Refrigerante Lata 350ml', price: 6.00 },
    { nome: 'Suco Del Valle Lata 300ml', price: 7.00 },
  ];

  console.log('Iniciando atualização de preços...');

  for (const produto of produtosAtualizados) {
    try {
      await prisma.product.updateMany({
        where: {
          nome: produto.nome,
        },
        data: {
          price: produto.price,
        },
      });
      console.log(`Preço atualizado: ${produto.nome} -> R$ ${produto.price}`);
    } catch (error) {
      console.error(`Erro ao atualizar ${produto.nome}:`, error);
    }
  }

  console.log('Atualização concluída!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });