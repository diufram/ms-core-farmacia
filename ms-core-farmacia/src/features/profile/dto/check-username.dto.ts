import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CheckUsernameDto {
  @ApiProperty({ example: 'nuevo_username' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username!: string;
}
