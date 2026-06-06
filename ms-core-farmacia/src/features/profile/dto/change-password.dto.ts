import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ChangePasswordDto {
  @ApiProperty()
  @Field()
  @IsString()
  @IsNotEmpty()
  current_password!: string;

  @ApiProperty({ minLength: 8 })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  new_password!: string;

  @ApiProperty()
  @Field()
  @IsString()
  @IsNotEmpty()
  confirm_password!: string;
}
