import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Field, Float, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class CreateSucursalDto {
  @ApiProperty({ example: 'Sucursal Centro' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;

  @ApiPropertyOptional({ example: '77445566' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional({ example: 'contacto@sucursal.com' })
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  correo_electronico?: string;

  @ApiProperty({ example: 'Av. Principal #123' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  direccion!: string;

  @ApiPropertyOptional({ example: 'Santa Cruz' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string;

  @ApiPropertyOptional({ example: 'Andres Ibanez' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  departamento?: string;

  @ApiPropertyOptional({ example: 'Bolivia' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pais?: string;

  @ApiPropertyOptional({ example: 'Frente a la plaza' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  referencia?: string;

  @ApiPropertyOptional({ example: -17.783327 })
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  latitud?: number;

  @ApiPropertyOptional({ example: -63.18214 })
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  longitud?: number;

  @ApiPropertyOptional({ example: 'Sucursal para atencion de zona norte' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ example: 'Laura' })
  @Field()
  @IsString()
  @IsNotEmpty()
  nombre_admin!: string;

  @ApiProperty({ example: 'Lopez' })
  @Field()
  @IsString()
  @IsNotEmpty()
  apellido_admin!: string;

  @ApiPropertyOptional({ example: '70011223' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  celular_admin?: string;

  @ApiProperty({ example: 'laura.sucursal' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(60)
  nombre_usuario_admin!: string;

  @ApiProperty({ example: 'admin@sucursal.com' })
  @Field()
  @IsEmail()
  correo_admin!: string;

  @ApiProperty({ example: 'Password123' })
  @Field()
  @IsString()
  @MinLength(8)
  contrasena_admin!: string;
}
