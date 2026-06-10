import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VentasPorSucursalType {
  @Field(() => Int)
  sucursal_id!: number;

  @Field()
  sucursal_nombre!: string;

  @Field(() => Float)
  total!: number;

  @Field(() => Int)
  cantidad!: number;
}

@ObjectType()
export class TopProductoType {
  @Field(() => Int)
  producto_id!: number;

  @Field()
  nombre!: string;

  @Field()
  codigo!: string;

  @Field(() => Int)
  cantidad_vendida!: number;

  @Field(() => Float)
  total_vendido!: number;
}

@ObjectType()
export class VentasPorDiaType {
  @Field()
  fecha!: string;

  @Field(() => Int)
  cantidad!: number;

  @Field(() => Float)
  total!: number;
}

@ObjectType()
export class ProductoStockBajoType {
  @Field(() => Int)
  id!: number;

  @Field()
  codigo!: string;

  @Field()
  nombre!: string;

  @Field(() => Int)
  stock_actual!: number;

  @Field(() => Int)
  sucursal_id!: number;

  @Field()
  sucursal_nombre!: string;
}

@ObjectType()
export class DashboardKpisType {
  @Field(() => Float)
  totalVentas!: number;

  @Field(() => Int)
  cantidadVentas!: number;

  @Field(() => Int)
  totalProductos!: number;

  @Field(() => Int)
  productosStockBajo!: number;

  @Field(() => Int)
  totalSucursales!: number;

  @Field(() => [VentasPorSucursalType])
  ventasPorSucursal!: VentasPorSucursalType[];

  @Field(() => [TopProductoType])
  topProductos!: TopProductoType[];

  @Field(() => [VentasPorDiaType])
  ventasPorDia!: VentasPorDiaType[];

  @Field(() => [ProductoStockBajoType])
  productosStockBajoList!: ProductoStockBajoType[];
}
