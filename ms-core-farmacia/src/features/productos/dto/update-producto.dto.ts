import { ApiPropertyOptional } from '@nestjs/swagger';
import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

@InputType()
export class UpdateProductoDto {
  @ApiPropertyOptional({ example: 'Paracetamol 500mg' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  nombre?: string;

  @ApiPropertyOptional({ example: 50 })
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock_actual?: number;

  @ApiPropertyOptional({ example: 13.5 })
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  precio_venta?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Nueva categoria; cambiarla tambien puede cambiar la sucursal',
  })
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  categoriaId?: number;
}
