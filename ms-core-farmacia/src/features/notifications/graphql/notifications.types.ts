import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokenDispositivoType {
  @Field(() => Int)
  id!: number;

  @Field()
  token!: string;

  @Field(() => Int)
  usuarioId!: number;

  @Field()
  createdAt!: Date;
}
