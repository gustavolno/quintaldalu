import { IsString, IsNumber, IsPositive, IsIn, IsOptional } from 'class-validator';

export class CreateTransacaoDto {
  @IsIn(['RECEITA', 'DESPESA'])
  tipo: string;

  @IsString()
  descricao: string;

  @IsNumber()
  @IsPositive()
  valor: number;

  @IsString()
  categoria: string;

  @IsOptional()
  @IsString()
  data?: string;
}
