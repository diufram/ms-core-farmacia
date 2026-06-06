import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class PersonaInput {
  @ApiPropertyOptional({ example: 'Juan' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string;

  @ApiPropertyOptional({ example: 'Perez' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  apellido?: string;

  @ApiPropertyOptional({ example: '70000000' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  celular?: string;
}
