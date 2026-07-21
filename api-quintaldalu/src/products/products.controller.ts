import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AuthGuard) // 🔒 TRANCA ESTA ROTA!
  @Post()
  create(@Body() createProductDto: CreateProductDto, @Request() req) {
    const adminId = req.user.sub; 
    return this.productsService.create(createProductDto, adminId); 
  }

  // 📖 Rota pública: Qualquer um pode ver o cardápio
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // 📖 Rota pública: Qualquer um pode ver detalhes de um produto específico
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id); 
  }

  @UseGuards(AuthGuard) // 🔒 TRANCA ESTA ROTA! Só Admin altera.
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @UseGuards(AuthGuard) // 🔒 TRANCA ESTA ROTA! Só Admin deleta.
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}