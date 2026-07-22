import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // Recebe o DTO e o ID do admin que veio do Controller
  async create(createProductDto: CreateProductDto, adminId: number) {
    return this.prisma.product.create({
      data: {
        nome: createProductDto.nome,
        price: createProductDto.price,
        description: createProductDto.description,
        category: createProductDto.category,
        image: createProductDto.image,
      }, 
    });
  }

  findAll() {
    return this.prisma.product.findMany();
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  remove(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}