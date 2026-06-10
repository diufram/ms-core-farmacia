import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VentaDetalleType {
  @Field(() => Int)
  id!: number;

  @Field(() => Int, { nullable: true })
  producto_id!: number | null;

  @Field()
  producto_nombre!: string;

  @Field(() => Int)
  cantidad!: number;

  @Field(() => Float)
  precio_unitario!: number;

  @Field(() => Float)
  subtotal!: number;
}

@ObjectType()
export class VentaType {
  @Field(() => Int)
  id!: number;

  @Field()
  numero_venta!: string;

  @Field()
  fecha_venta!: string;

  @Field(() => Float)
  total!: number;

  @Field()
  estado!: string;

  @Field(() => Int, { nullable: true })
  sucursal_id!: number | null;

  @Field(() => Int, { nullable: true })
  usuario_id!: number | null;

  @Field(() => Int, { nullable: true })
  cliente_id!: number | null;

  @Field()
  cliente_walk_in!: boolean;

  @Field(() => String, { nullable: true })
  cliente_nombre?: string | null;

  @Field(() => String, { nullable: true })
  cliente_celular?: string | null;

  @Field(() => String, { nullable: true })
  cliente_codigo?: string | null;

  @Field(() => [VentaDetalleType])
  detalles!: VentaDetalleType[];
}

@ObjectType()
export class VentaPayloadType {
  @Field(() => VentaType)
  venta!: VentaType;

  @Field()
  message!: string;
}
