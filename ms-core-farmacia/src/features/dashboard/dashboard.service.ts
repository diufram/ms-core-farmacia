import { Injectable } from '@nestjs/common';
import { Rol } from '../../database/entities/usuario.entity';
import {
  DashboardKpisType,
  ProductoSinMovimientoType,
  ProductoStockBajoType,
  RiesgoCategoriaType,
  TopClienteType,
  TopProductoType,
  VentasPorDiaType,
  VentasPorSucursalType,
} from './graphql/dashboard.types';
import { DashboardRepository } from './dashboard.repository';

const DEFAULT_STOCK_BAJO_UMBRAL = 10;
const DEFAULT_TOP_PRODUCTOS_LIMITE = 5;
const DEFAULT_STOCK_BAJO_LISTA_LIMITE = 10;
const DEFAULT_VENTAS_POR_DIA = 30;
const DEFAULT_TOP_CLIENTES_LIMITE = 5;
const DEFAULT_PRODUCTOS_SIN_MOV_LIMITE = 5;

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getKpis(
    userRol: string,
    userSucursalId: number | null,
    filters: {
      sucursalId?: number;
      fechaDesde?: string;
      fechaHasta?: string;
      stockBajoUmbral?: number;
    },
  ): Promise<DashboardKpisType> {
    const effectiveSucursalId = this.resolveSucursalId(userRol, userSucursalId, filters.sucursalId);
    const umbral = filters.stockBajoUmbral ?? DEFAULT_STOCK_BAJO_UMBRAL;

    const dateFilters = {
      fechaDesde: filters.fechaDesde,
      fechaHasta: filters.fechaHasta,
    };

    const [
      ventasTotales,
      ventasPorSucursal,
      topProductos,
      ventasPorDia,
      stockBajoList,
      totalStockBajo,
      totalProductos,
      totalSucursales,
      topClientes,
      productosSinMovimiento,
      riesgoPorCategoria,
    ] = await Promise.all([
      this.dashboardRepository.ventasTotales({
        ...(effectiveSucursalId ? { sucursalId: effectiveSucursalId } : {}),
        ...dateFilters,
      }),
      this.dashboardRepository.ventasPorSucursal({
        ...(effectiveSucursalId ? { sucursalId: effectiveSucursalId } : {}),
        ...dateFilters,
      }),
      this.dashboardRepository.topProductos(DEFAULT_TOP_PRODUCTOS_LIMITE, {
        ...(effectiveSucursalId ? { sucursalId: effectiveSucursalId } : {}),
        ...dateFilters,
      }),
      this.dashboardRepository.ventasPorDia(DEFAULT_VENTAS_POR_DIA, {
        ...(effectiveSucursalId ? { sucursalId: effectiveSucursalId } : {}),
      }),
      this.dashboardRepository.productosStockBajoList(
        umbral,
        {
          ...(effectiveSucursalId ? { sucursalId: effectiveSucursalId } : {}),
        },
        DEFAULT_STOCK_BAJO_LISTA_LIMITE,
      ),
      this.dashboardRepository.countProductosStockBajo(umbral, {
        ...(effectiveSucursalId ? { sucursalId: effectiveSucursalId } : {}),
      }),
      this.dashboardRepository.countProductos({
        ...(effectiveSucursalId ? { sucursalId: effectiveSucursalId } : {}),
      }),
      this.dashboardRepository.countSucursales(userRol, userSucursalId),
      this.dashboardRepository.topClientes(DEFAULT_TOP_CLIENTES_LIMITE, {
        ...(effectiveSucursalId ? { sucursalId: effectiveSucursalId } : {}),
        ...dateFilters,
      }),
      this.dashboardRepository.productosSinMovimiento(
        DEFAULT_PRODUCTOS_SIN_MOV_LIMITE,
        DEFAULT_VENTAS_POR_DIA,
        {
          ...(effectiveSucursalId ? { sucursalId: effectiveSucursalId } : {}),
          stockBajoUmbral: umbral,
        },
      ),
      this.dashboardRepository.riesgoPorCategoria({
        ...(effectiveSucursalId ? { sucursalId: effectiveSucursalId } : {}),
        stockBajoUmbral: umbral,
        ...dateFilters,
      }),
    ]);

    return {
      totalVentas: ventasTotales.total,
      cantidadVentas: ventasTotales.cantidad,
      totalProductos,
      productosStockBajo: totalStockBajo,
      totalSucursales,
      ventasPorSucursal: ventasPorSucursal.map<VentasPorSucursalType>((v) => ({
        sucursal_id: v.sucursal_id,
        sucursal_nombre: v.sucursal_nombre,
        total: v.total,
        cantidad: v.cantidad,
      })),
      topProductos: topProductos.map<TopProductoType>((p) => ({
        producto_id: p.producto_id,
        nombre: p.nombre,
        codigo: p.codigo,
        cantidad_vendida: p.cantidad_vendida,
        total_vendido: p.total_vendido,
      })),
      ventasPorDia: ventasPorDia.map<VentasPorDiaType>((d) => ({
        fecha: d.fecha,
        cantidad: d.cantidad,
        total: d.total,
      })),
      productosStockBajoList: stockBajoList.map<ProductoStockBajoType>((p) => ({
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        stock_actual: p.stock_actual,
        sucursal_id: p.sucursal_id,
        sucursal_nombre: p.sucursal_nombre,
      })),
      topClientes: topClientes.map<TopClienteType>((c) => ({
        cliente_nombre: c.cliente_nombre,
        cliente_codigo: c.cliente_codigo,
        cantidad_ventas: c.cantidad_ventas,
        total_comprado: c.total_comprado,
      })),
      productosSinMovimiento: productosSinMovimiento.map<ProductoSinMovimientoType>((p) => ({
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        stock_actual: p.stock_actual,
        categoria_nombre: p.categoria_nombre,
        dias_sin_venta: p.dias_sin_venta,
      })),
      riesgoPorCategoria: riesgoPorCategoria
        .map<RiesgoCategoriaType>((r) => ({
          categoria_id: r.categoria_id,
          categoria_nombre: r.categoria_nombre,
          total_productos: r.total_productos,
          productos_stock_bajo: r.productos_stock_bajo,
          ventas_periodo: r.ventas_periodo,
          score_riesgo: r.score_riesgo,
        }))
        .sort((a, b) => b.score_riesgo - a.score_riesgo),
    };
  }

  private resolveSucursalId(
    userRol: string,
    userSucursalId: number | null,
    requestedSucursalId: number | undefined,
  ): number | null {
    if (userRol === Rol.SUPER_ADMIN) {
      return requestedSucursalId ?? null;
    }
    return userSucursalId;
  }
}
