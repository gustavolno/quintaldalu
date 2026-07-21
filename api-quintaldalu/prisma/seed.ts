import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

// Configura o adaptador do PostgreSQL exigido pelo Prisma 7
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando o plantio do cardápio completo...');

  // Limpa os produtos antigos para não duplicar
  await prisma.product.deleteMany();

  const cardapio = [
    // ==========================================
    //         SABORES TRADICIONAIS
    // ==========================================
    {
      name: 'Calabresa',
      description: 'Molho de tomate, muçarela, calabresa fatiada, cebola e orégano.',
      price: 45.90,
      category: 'Sabores Tradicionais',
      image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Frango com Catupiry',
      description: 'Molho de tomate, frango desfiado temperado, Catupiry original e orégano.',
      price: 48.90,
      category: 'Sabores Tradicionais',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Portuguesa',
      description: 'Molho de tomate, muçarela, presunto, ovos cozidos, cebola, pimentão, azeitonas e orégano.',
      price: 49.90,
      category: 'Sabores Tradicionais',
      image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Marguerita',
      description: 'Molho de tomate, muçarela, rodelas de tomate fresco, manjericão fresco e orégano.',
      price: 42.90,
      category: 'Sabores Tradicionais',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Bacon',
      description: 'Molho de tomate, muçarela, bacon crocante, cebola e orégano.',
      price: 47.90,
      category: 'Sabores Tradicionais',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Calabresa Especial',
      description: 'Molho de tomate, muçarela, calabresa fatiada, cream cheese/catupiry, bacon em cubos, cebola e orégano.',
      price: 52.90,
      category: 'Sabores Tradicionais',
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Atum',
      description: 'Molho de tomate, atum ralado premium, cebola fatiada, azeitonas e orégano.',
      price: 54.90,
      category: 'Sabores Tradicionais',
      image: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Milho',
      description: 'Molho de tomate, muçarela, milho verde selecionado e orégano.',
      price: 40.90,
      category: 'Sabores Tradicionais',
      image: 'https://images.unsplash.com/photo-1593504049359-74330189a345?w=500&auto=format&fit=crop&q=60'
    },

    // ==========================================
    //         SUGESTÕES FAMOSAS
    // ==========================================
    {
      name: 'Moda da Casa',
      description: 'Molho de tomate, atum, muçarela, cebola caramelizada e tomate-cereja.',
      price: 56.90,
      category: 'Sugestões Famosas',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Mussarela Clássica',
      description: 'Molho de tomate, generosa camada de muçarela, rodelas de tomate e orégano.',
      price: 39.90,
      category: 'Sugestões Famosas',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Lombo com Catupiry',
      description: 'Molho de tomate, muçarela, lombo canadense fatiado, Catupiry e orégano.',
      price: 54.90,
      category: 'Sugestões Famosas',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Quatro Queijos',
      description: 'Molho de tomate, muçarela, provolone, gorgonzola e Catupiry.',
      price: 52.90,
      category: 'Sugestões Famosas',
      image: 'https://images.unsplash.com/photo-1579684947550-22e945225d9a?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Carne Seca com Cream Cheese',
      description: 'Molho de tomate, muçarela, carne seca desfiada e temperada, cream cheese e cebola.',
      price: 58.90,
      category: 'Sugestões Famosas',
      image: 'https://images.unsplash.com/photo-1593504049359-74330189a345?w=500&auto=format&fit=crop&q=60'
    },

    // ==========================================
    //              PIZZAS DOCES
    // ==========================================
    {
      name: 'Chocolate com Morango',
      description: 'Base de chocolate ao leite cremoso, coberta com morangos frescos ou granulado.',
      price: 45.90,
      category: 'Pizzas Doces',
      image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Prestigio / Chocolate com Coco',
      description: 'Base de chocolate ao leite cremoso coberta com coco ralado.',
      price: 44.90,
      category: 'Pizzas Doces',
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Romeu e Julieta',
      description: 'Muçarela (ou requeijão) com goiabada cremosa.',
      price: 42.90,
      category: 'Pizzas Doces',
      image: 'https://images.unsplash.com/photo-1551024506-0cb9842f65a1?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Banana com Canela',
      description: 'Base de creme, muçarela, rodelas de banana, açúcar e canela polvilhada.',
      price: 38.90,
      category: 'Pizzas Doces',
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=60'
    },

    // ==========================================
    //               CALZONES
    // ==========================================
    {
      name: 'Calzone de Frango com Catupiry',
      description: 'Massa fechada recheada com frango desfiado temperado, muçarela, Catupiry original, molho e orégano.',
      price: 48.90,
      category: 'Calzones',
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Calzone Português',
      description: 'Massa fechada recheada com presunto, muçarela, ovos, cebola, pimentão, azeitonas e molho.',
      price: 50.90,
      category: 'Calzones',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Calzone Quatro Queijos',
      description: 'Massa fechada cremosa de muçarela, provolone, gorgonzola e Catupiry.',
      price: 52.90,
      category: 'Calzones',
      image: 'https://images.unsplash.com/photo-1579684947550-22e945225d9a?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Calzone de Calabresa com Bacon',
      description: 'Massa fechada recheada com calabresa fatiada, bacon crocante, muçarela, cebola e molho.',
      price: 51.90,
      category: 'Calzones',
      image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Calzone Doce de Chocolate',
      description: 'Massa fechada recheada com generosa camada de chocolate ao leite e morangos.',
      price: 49.90,
      category: 'Calzones',
      image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=60'
    },

    // ==========================================
    //               BEBIDAS
    // ==========================================
    {
      name: 'Refrigerante 2 Litros',
      description: 'Guaraná Antarctica, Coca-Cola, Fanta, Sprite (Escolha no WhatsApp)',
      price: 14.00,
      category: 'Bebidas',
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Refrigerante 1L / 1,5L',
      description: 'Guaraná Antarctica, Coca-Cola (Escolha no WhatsApp)',
      price: 10.00,
      category: 'Bebidas',
      image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Refrigerante Lata 350ml',
      description: 'Coca-Cola, Guaraná, Sprite, Fanta (Escolha no WhatsApp)',
      price: 6.00,
      category: 'Bebidas',
      image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Suco Del Valle Lata 300ml',
      description: 'Uva, Pêssego, Maracujá, Goiaba (Escolha no WhatsApp)',
      price: 7.00,
      category: 'Bebidas',
      image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Suco Natural Integral 900ml',
      description: 'Laranja, Uva (Escolha no WhatsApp)',
      price: 15.00,
      category: 'Bebidas',
      image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Água Mineral 500ml',
      description: 'Com ou Sem gás',
      price: 4.00,
      category: 'Bebidas',
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=60'
    }
  ];

  await prisma.product.createMany({
    data: cardapio,
  });

  console.log(`✅ Sucesso! ${cardapio.length} produtos foram adicionados ao cardápio.`);
}

main()
  .catch((e) => {
    console.error('Erro ao popular o banco:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });