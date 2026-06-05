import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

@InputType()
export class VentaDetalleInput {
  @ApiProperty({ example: 1 })
  @Field(() => Int)
  @IsInt()
  @Min(1)
  productoId!: number;

  @ApiProperty({ example: 2, description: 'Cantidad a vender' })
  @Field(() => Int)
  @IsInt()
  @Min(1)
  cantidad!: number;

  @ApiPropertyOptional({
    example: 12.5,
    description: 'Si se omite, se usa el precio_venta actual del producto',
  })
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  precioUnitario?: number;
}
