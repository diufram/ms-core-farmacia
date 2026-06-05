import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PersonaSimpleType {
  @Field(() => Int)
  id!: number;

  @Field()
  nombre!: string;

  @Field()
  apellido!: string;

  @Field(() => String, { nullable: true })
  celular!: string | null;
}

@ObjectType()
export class ClienteType {
  @Field(() => Int)
  id!: number;

  @Field()
  codigo_cliente!: string;

  @Field(() => Int)
  sucursal_id!: number;

  @Field(() => PersonaSimpleType)
  persona!: PersonaSimpleType;
}

@ObjectType()
export class ClientePayloadType {
  @Field(() => ClienteType)
  cliente!: ClienteType;

  @Field()
  message!: string;
}
