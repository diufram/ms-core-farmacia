import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

@InputType()
export class AssignSucursalDto {
  @ApiProperty({ example: 1 })
  @Field(() => Int)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  sucursalId!: number;
}
