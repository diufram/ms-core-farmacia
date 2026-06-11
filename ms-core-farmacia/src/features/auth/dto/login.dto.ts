import { IsEmail, IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
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
  @IsNotEmpty()
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
