import { IsNotEmpty, IsString } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RegistrarTokenDispositivoInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  token!: string;
}
