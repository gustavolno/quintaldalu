import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'A categoria deve ser um texto válido' })
  @IsNotEmpty({ message: 'A categoria é obrigatória' })
  category: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber({}, { message: 'O preço deve ser um número' })
  @Min(0, { message: 'O preço não pode ser negativo' })
  price: number;

  @IsString()
  @IsOptional() // Campo opcional (a Lu pode não ter a foto na hora de cadastrar)
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}