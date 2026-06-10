import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
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

  @ApiPropertyOptional({
    description: 'Si es true, el admin está asociando un cliente walk-in (consumidor final)',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  cliente_walk_in?: boolean;

  @ApiPropertyOptional({ description: 'Snapshot: nombre del cliente walk-in' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  cliente_nombre?: string;

  @ApiPropertyOptional({ description: 'Snapshot: celular del cliente walk-in' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cliente_celular?: string;

  @ApiPropertyOptional({ description: 'Snapshot: código del cliente walk-in' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  cliente_codigo?: string;

  @ApiProperty({ type: [VentaDetalleInput] })
  @Field(() => [VentaDetalleInput])
  @IsArray()
  @ArrayMinSize(1, { message: 'La venta debe tener al menos un detalle.' })
  @ValidateNested({ each: true })
  @Type(() => VentaDetalleInput)
  detalles!: VentaDetalleInput[];
}
