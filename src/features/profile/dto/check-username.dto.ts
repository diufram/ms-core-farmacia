import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckUsernameDto {
  @ApiProperty({ example: 'nuevo_username' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username!: string;
}