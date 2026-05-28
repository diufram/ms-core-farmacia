import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'matias@correo.com' })
  @IsEmail()
  correo_electronico!: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(8)
  contrasena!: string;
}
