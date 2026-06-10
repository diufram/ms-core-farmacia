import { Injectable } from '@nestjs/common';
import { Rol } from '../../database/entities/usuario.entity';
import {
  DashboardKpisType,
  ProductoStockBajoType,
  TopProductoType,
  VentasPorDiaType,
  VentasPorSucursalType,
} from './graphql/dashboard.types';
import { DashboardRepository } from './dashboard.repository';

const DEFAULT_STOCK_BAJO_UMBRAL = 10;
const DEFAULT_TOP_PRODUCTOS_LIMITE = 5;
const DEFAULT_STOCK_BAJO_LISTA_LIMITE = 10;
const DEFAULT_VENTAS_POR_DIA = 30;

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
    const effectiveSucursalId = this.resolveSucursalId(
      userRol,
      userSucursalId,
      filters.sucursalId,
    );
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
      totalClientes,
      totalSucursales,
    ] = await Promise.all([
      this.dashboardRepository.ventasTotales({
        ...(effectiveSucursalId ? { sucursalId: effectiveSucursalId } : {}),
        ...dateFilters,
      }),
      this.dashboardRepository.ventasPorSucursal(dateFilters),
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
      this.dashboardRepository.countClientes({
        ...(effectiveSucursalId ? { sucursalId: effectiveSucursalId } : {}),
      }),
      this.dashboardRepository.countSucursales(userRol, userSucursalId),
    ]);

    return {
      totalVentas: ventasTotales.total,
      cantidadVentas: ventasTotales.cantidad,
      totalProductos,
      productosStockBajo: totalStockBajo,
      totalClientes,
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
