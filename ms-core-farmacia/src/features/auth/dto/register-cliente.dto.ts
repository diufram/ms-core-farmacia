import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsBoolean,
} from 'class-validator';

@InputType()
export class RegisterClienteDto {
  @ApiProperty({ example: 'Juan' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string;

  @ApiProperty({ example: 'Perez' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  apellido!: string;

  @ApiProperty({ example: '70011223', required: false })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  celular?: string;

  @ApiProperty({ example: 'juan.perez' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(60)
  nombre_usuario!: string;

  @ApiProperty({ example: 'juan@ejemplo.com' })
  @Field()
  @IsEmail()
  @IsNotEmpty()
  correo_electronico!: string;

  @ApiProperty({ example: 'Password123' })
  @Field()
  @IsString()
  @MinLength(8)
  contrasena!: string;

  @ApiProperty({ example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]', required: false })
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notification_token?: string;

  @ApiProperty({ example: true, required: false })
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  is_mobile?: boolean;
}
