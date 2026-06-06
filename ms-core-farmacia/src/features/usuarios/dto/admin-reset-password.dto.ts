import { ApiPropertyOptional } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class AdminResetPasswordDto {
  @ApiPropertyOptional({ example: 'NuevoPass123' })
  @Field()
  @IsString()
  @MinLength(8)
  nueva_contrasena!: string;

  @ApiPropertyOptional({ description: 'Forzar cambio en próximo login' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  motivo?: string;
}
