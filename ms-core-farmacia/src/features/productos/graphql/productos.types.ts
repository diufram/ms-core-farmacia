import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProductoType {
  @Field(() => Int)
  id!: number;

  @Field()
  codigo!: string;

  @Field()
  nombre!: string;

  @Field(() => Int)
  stock_actual!: number;

  @Field(() => Float)
  precio_venta!: number;

  @Field(() => Int)
  categoria_id!: number;

  @Field(() => Int)
  sucursal_id!: number;
}

@ObjectType()
export class ProductoPayloadType {
  @Field(() => ProductoType)
  producto!: ProductoType;

  @Field()
  message!: string;
}
