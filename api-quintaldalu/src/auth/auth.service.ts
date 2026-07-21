import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(email: string, pass: string) {
    // 1. Procura o Admin no banco pelo email
    const admin = await this.prisma.admin.findUnique({ where: { email } });

    // 2. Se não achar, devolve erro 401 (Não autorizado)
    if (!admin) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    // 3. Compara a senha digitada com a criptografada
    const isPasswordValid = await bcrypt.compare(pass, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    // 4. Se passou, cria o payload (dados que vão dentro do crachá) e gera o token
    const payload = { sub: admin.id, name: admin.name, email: admin.email };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}