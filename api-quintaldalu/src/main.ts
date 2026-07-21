import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ativa o ValidationPipe globalmente para validar todos os DTOs
  app.useGlobalPipes(new ValidationPipe());

  // Habilita o CORS para permitir que aplicações frontend/mobile consumam a API
  app.enableCors();

  await app.listen(3000);
}
bootstrap();