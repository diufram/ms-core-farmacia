import { ApiPropertyOptional } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Rol } from '../../../database/entities/usuario.entity';
import { UsuarioPersonaInput } from './create-usuario.dto';

@InputType()
export class UpdateUsuarioDto {
  @ApiPropertyOptional({ type: UsuarioPersonaInput })
  @Field(() => UsuarioPersonaInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => UsuarioPersonaInput)
  persona?: UsuarioPersonaInput;

  @ApiPropertyOptional({ example: 'laura.admin' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(60)
  nombre_usuario?: string;

  @ApiPropertyOptional({ example: 'laura@ejemplo.com' })
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  correo_electronico?: string;

  @ApiPropertyOptional({ enum: Rol })
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(Rol)
  rol?: Rol;

  @ApiPropertyOptional({ example: true })
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
