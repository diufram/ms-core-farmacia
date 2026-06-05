import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VentaDetalleType {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  producto_id!: number;

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

  @Field(() => Int)
  sucursal_id!: number;

  @Field(() => Int)
  usuario_id!: number;

  @Field(() => Int, { nullable: true })
  cliente_id!: number | null;

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
