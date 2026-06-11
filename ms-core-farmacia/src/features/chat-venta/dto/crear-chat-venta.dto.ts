import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductoVentaInput {
  @IsString()
  codigo!: string;

  @IsInt()
  @Min(1)
  cantidad!: number;
}

export class CrearChatVentaDto {
  @IsInt()
  @Min(1)
  sucursalId!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductoVentaInput)
  productos!: ProductoVentaInput[];

  @IsOptional()
  @IsString()
  clienteNombre?: string;

  @IsOptional()
  @IsString()
  clienteCelular?: string;
}
