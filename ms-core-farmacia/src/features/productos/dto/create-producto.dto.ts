import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

@InputType()
export class CreateProductoDto {
  @ApiProperty({ example: 'PROD-001' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  codigo!: string;

  @ApiProperty({ example: 'Paracetamol 500mg' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  nombre!: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock_actual?: number;

  @ApiProperty({ example: 12.5 })
  @Field(() => Float)
  @IsNumber()
  @Min(0)
  precio_venta!: number;

  @ApiProperty({ example: 1, description: 'ID de la categoria; la sucursal se infiere de ella' })
  @Field(() => Int)
  @IsInt()
  @Min(1)
  categoriaId!: number;
}
