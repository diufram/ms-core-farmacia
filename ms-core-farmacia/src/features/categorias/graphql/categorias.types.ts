import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CategoriaType {
  @Field(() => Int)
  id!: number;

  @Field()
  nombre!: string;

  @Field()
  codigo!: string;

  @Field(() => Int, { nullable: true })
  sucursal_id!: number | null;
}

@ObjectType()
export class CategoriaPayloadType {
  @Field(() => CategoriaType)
  categoria!: CategoriaType;

  @Field()
  message!: string;
}
