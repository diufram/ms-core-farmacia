import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class RegisterDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  apellido!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  celular?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  nombre_usuario!: string;

  @Field()
  @IsEmail()
  @IsNotEmpty()
  correo_electronico!: string;

  @Field()
  @IsString()
  @MinLength(6)
  contrasena!: string;
}
