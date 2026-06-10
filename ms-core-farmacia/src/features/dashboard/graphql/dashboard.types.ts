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
export class TopClienteType {
  @Field(() => String, { nullable: true })
  cliente_nombre!: string | null;

  @Field(() => String, { nullable: true })
  cliente_codigo!: string | null;

  @Field(() => Int)
  cantidad_ventas!: number;

  @Field(() => Float)
  total_comprado!: number;
}

@ObjectType()
export class ProductoSinMovimientoType {
  @Field(() => Int)
  id!: number;

  @Field()
  codigo!: string;

  @Field()
  nombre!: string;

  @Field(() => Int)
  stock_actual!: number;

  @Field()
  categoria_nombre!: string;

  @Field(() => Int)
  dias_sin_venta!: number;
}

@ObjectType()
export class RiesgoCategoriaType {
  @Field(() => Int)
  categoria_id!: number;

  @Field()
  categoria_nombre!: string;

  @Field(() => Int)
  total_productos!: number;

  @Field(() => Int)
  productos_stock_bajo!: number;

  @Field(() => Float)
  score_riesgo!: number;

  @Field(() => Int)
  ventas_periodo!: number;
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

  @Field(() => [TopClienteType])
  topClientes!: TopClienteType[];

  @Field(() => [ProductoSinMovimientoType])
  productosSinMovimiento!: ProductoSinMovimientoType[];

  @Field(() => [RiesgoCategoriaType])
  riesgoPorCategoria!: RiesgoCategoriaType[];
}
