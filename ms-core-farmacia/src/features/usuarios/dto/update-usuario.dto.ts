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
import { RolGlobal } from '../../../database/entities/usuario.entity';
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

  @ApiPropertyOptional({ enum: RolGlobal })
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(RolGlobal)
  rol_global?: RolGlobal;

  @ApiPropertyOptional({ example: true })
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
