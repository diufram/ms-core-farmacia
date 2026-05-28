import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSucursalDto {
  @ApiProperty({ example: 'Sucursal Centro' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;

  @ApiPropertyOptional({ example: '77445566' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional({ example: 'contacto@sucursal.com' })
  @IsOptional()
  @IsEmail()
  correo_electronico?: string;

  @ApiProperty({ example: 'Av. Principal #123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  direccion!: string;

  @ApiPropertyOptional({ example: 'Santa Cruz' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string;

  @ApiPropertyOptional({ example: 'Andres Ibanez' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  departamento?: string;

  @ApiPropertyOptional({ example: 'Bolivia' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pais?: string;

  @ApiPropertyOptional({ example: 'Frente a la plaza' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  referencia?: string;

  @ApiPropertyOptional({ example: -17.783327 })
  @IsOptional()
  @IsNumber()
  latitud?: number;

  @ApiPropertyOptional({ example: -63.18214 })
  @IsOptional()
  @IsNumber()
  longitud?: number;

  @ApiPropertyOptional({ example: 'Sucursal para atencion de zona norte' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ example: 'Laura' })
  @IsString()
  @IsNotEmpty()
  nombre_admin!: string;

  @ApiProperty({ example: 'Lopez' })
  @IsString()
  @IsNotEmpty()
  apellido_admin!: string;

  @ApiPropertyOptional({ example: '70011223' })
  @IsOptional()
  @IsString()
  celular_admin?: string;

  @ApiProperty({ example: 'laura.sucursal' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(60)
  nombre_usuario_admin!: string;

  @ApiProperty({ example: 'admin@sucursal.com' })
  @IsEmail()
  correo_admin!: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(8)
  contrasena_admin!: string;
}
