import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class LoginDto {
  @ApiProperty({ example: 'matias@correo.com' })
  @Field()
  @IsEmail()
  correo_electronico!: string;

  @ApiProperty({ example: 'Password123' })
  @Field()
  @IsString()
  @MinLength(8)
  contrasena!: string;
}
