import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config'; // <--- O segredo para ler o .env a tempo!

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. O dotenv já garantiu que o process.env.DATABASE_URL existe
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // 2. Cria o adaptador
    const adapter = new PrismaPg(pool);

    // 3. Entrega para o Prisma 7
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}