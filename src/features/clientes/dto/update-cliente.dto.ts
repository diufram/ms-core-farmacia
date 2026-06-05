import { ApiPropertyOptional } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PersonaInput } from './persona-input';

@InputType()
export class UpdateClienteDto {
  @ApiPropertyOptional({ example: 'CLI-0001' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  codigo_cliente?: string;

  @ApiPropertyOptional({ type: PersonaInput })
  @Field(() => PersonaInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => PersonaInput)
  persona?: PersonaInput;
}
