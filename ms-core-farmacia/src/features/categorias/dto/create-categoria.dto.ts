import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

@InputType()
export class CreateCategoriaDto {
  @ApiProperty({ example: 'Medicamentos' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string;

  @ApiProperty({ example: 'MED-001' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  codigo!: string;

  @ApiProperty({ example: 1 })
  @Field(() => Int)
  @IsInt()
  @Min(1)
  sucursalId!: number;
}
