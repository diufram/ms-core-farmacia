import { ApiPropertyOptional } from '@nestjs/swagger';
import { Field, Float, InputType } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

@InputType()
export class UpdateSucursalDto {
  @ApiPropertyOptional({ example: 'Sucursal Centro' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;

  @ApiPropertyOptional({ example: '77445566' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional({ example: 'Av. Principal #123' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccion?: string;

  @ApiPropertyOptional({ example: 'Santa Cruz' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string;

  @ApiPropertyOptional({ example: -17.783327 })
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  latitud?: number;

  @ApiPropertyOptional({ example: -63.18214 })
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  longitud?: number;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  logo?: string;
}
