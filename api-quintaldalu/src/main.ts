import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ativa o ValidationPipe globalmente para validar todos os DTOs
  app.useGlobalPipes(new ValidationPipe());

  // Habilita o CORS para permitir que aplicações frontend/mobile consumam a API
  app.enableCors();

  // Aumenta o limite do payload para 10mb para permitir envio de imagens em Base64
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();