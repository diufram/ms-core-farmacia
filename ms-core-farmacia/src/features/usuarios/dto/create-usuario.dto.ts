import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Rol } from '../../../database/entities/usuario.entity';

@InputType()
export class UsuarioPersonaInput {
  @ApiProperty({ example: 'Laura' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string;

  @ApiProperty({ example: 'Lopez' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  apellido!: string;

  @ApiPropertyOptional({ example: '70011223' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  celular?: string;
}

@InputType()
export class SucursalAsignacionInput {
  @ApiProperty({ example: 1 })
  @Field(() => Int)
  @IsNotEmpty()
  sucursalId!: number;
}

@InputType()
export class CreateUsuarioDto {
  @ApiProperty({ type: UsuarioPersonaInput })
  @Field(() => UsuarioPersonaInput)
  @ValidateNested()
  @Type(() => UsuarioPersonaInput)
  persona!: UsuarioPersonaInput;

  @ApiProperty({ example: 'laura.admin' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(60)
  nombre_usuario!: string;

  @ApiProperty({ example: 'laura@ejemplo.com' })
  @Field()
  @IsEmail()
  correo_electronico!: string;

  @ApiProperty({ example: 'Password123' })
  @Field()
  @IsString()
  @MinLength(8)
  contrasena!: string;

  @ApiPropertyOptional({ enum: Rol, example: Rol.ADMIN })
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(Rol)
  rol?: Rol;

  @ApiPropertyOptional({ type: [SucursalAsignacionInput] })
  @Field(() => [SucursalAsignacionInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SucursalAsignacionInput)
  sucursales?: SucursalAsignacionInput[];
}
