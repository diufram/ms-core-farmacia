import { ApiPropertyOptional } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class UpdateCategoriaDto {
  @ApiPropertyOptional({ example: 'Medicamentos' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string;

  @ApiPropertyOptional({ example: 'MED-001' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  codigo?: string;
}
