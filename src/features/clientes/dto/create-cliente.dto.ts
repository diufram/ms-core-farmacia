import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PersonaInput } from './persona-input';

@InputType()
export class CreateClienteDto {
  @ApiProperty({ example: 'CLI-0001' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  codigo_cliente!: string;

  @ApiProperty({ example: 1 })
  @Field(() => Int)
  @IsInt()
  @Min(1)
  sucursalId!: number;

  @ApiProperty({ type: PersonaInput })
  @Field(() => PersonaInput)
  @ValidateNested()
  @Type(() => PersonaInput)
  persona!: PersonaInput;
}
