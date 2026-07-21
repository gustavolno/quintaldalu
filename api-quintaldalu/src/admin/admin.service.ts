import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async create(createAdminDto: CreateAdminDto) {
    // 1. Criptografa a senha com 10 salt rounds (padrão seguro)
    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

    // 2. Salva no banco e retorna os dados ocultando o campo de senha
    const admin = await this.prisma.admin.create({
      data: {
        name: createAdminDto.name,
        email: createAdminDto.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        // Ocultamos a senha aqui por segurança!
      },
    });

    return admin;
  }

  async findAll() {
    // Retorna todos os admins (também sem a senha)
    return this.prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      throw new NotFoundException(`Administrador com ID ${id} não encontrado.`);
    }

    return admin;
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    // Se o admin estiver atualizando a senha, precisamos fazer o hash dela também
    let dataToUpdate = { ...updateAdminDto };

    if (updateAdminDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateAdminDto.password, 10);
    }

    try {
      return await this.prisma.admin.update({
        where: { id },
        data: dataToUpdate,
        select: {
          id: true,
          name: true,
          email: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Não foi possível atualizar. Admin com ID ${id} não encontrado.`);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.admin.delete({
        where: { id },
      });
      return { message: `Administrador com ID ${id} removido com sucesso.` };
    } catch (error) {
      throw new NotFoundException(`Não foi possível deletar. Admin com ID ${id} não encontrado.`);
    }
  }
}