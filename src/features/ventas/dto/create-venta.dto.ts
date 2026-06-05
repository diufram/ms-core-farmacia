import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { VentaDetalleInput } from './venta-detalle-input';

@InputType()
export class CreateVentaDto {
  @ApiProperty({ example: 1 })
  @Field(() => Int)
  @IsInt()
  @Min(1)
  sucursalId!: number;

  @ApiPropertyOptional({ example: 1 })
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  clienteId?: number;

  @ApiProperty({ type: [VentaDetalleInput] })
  @Field(() => [VentaDetalleInput])
  @IsArray()
  @ArrayMinSize(1, { message: 'La venta debe tener al menos un detalle.' })
  @ValidateNested({ each: true })
  @Type(() => VentaDetalleInput)
  detalles!: VentaDetalleInput[];
}
