import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateUsernameDto {
  @ApiProperty({ example: 'nuevo_username' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username!: string;

  @ApiProperty()
  @Field()
  @IsString()
  @IsNotEmpty()
  current_password!: string;
}
