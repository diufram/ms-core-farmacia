import { Injectable, Logger } from '@nestjs/common';
import { Rol } from '../../database/entities/usuario.entity';
import {
  CategoryRiskFeatures,
  CategoryRiskModel,
  CategoryRiskPrediction,
} from '../ml/category-risk.model';
import { FeatureBuilderService } from '../ml/feature-builder.service';
import { RISK_CLASS_THRESHOLD } from '../ml/ml.constants';
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
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly categoryRiskModel: CategoryRiskModel,
    private readonly featureBuilderService: FeatureBuilderService,
  ) {}

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
      riesgoPorCategoria: await this.enrichRiesgoPorCategoria(riesgoPorCategoria, {
        ...(effectiveSucursalId ? { sucursalId: effectiveSucursalId } : {}),
        stockBajoUmbral: umbral,
        ...dateFilters,
      }),
    };
  }

  private async enrichRiesgoPorCategoria(
    rows: {
      categoria_id: number;
      categoria_nombre: string;
      total_productos: number;
      productos_stock_bajo: number;
      ventas_periodo: number;
      score_riesgo: number;
    }[],
    filters: {
      sucursalId?: number;
      stockBajoUmbral?: number;
      fechaDesde?: string;
      fechaHasta?: string;
    },
  ): Promise<RiesgoCategoriaType[]> {
    const mlActive = this.categoryRiskModel.isLoaded();

    if (!mlActive) {
      return rows
        .map<RiesgoCategoriaType>((r) => ({
          categoria_id: r.categoria_id,
          categoria_nombre: r.categoria_nombre,
          total_productos: r.total_productos,
          productos_stock_bajo: r.productos_stock_bajo,
          ventas_periodo: r.ventas_periodo,
          score_riesgo: r.score_riesgo,
          clase_riesgo: r.score_riesgo > RISK_CLASS_THRESHOLD ? 'RIESGO_ALTO' : 'RIESGO_BAJO',
          probabilidad_riesgo: r.score_riesgo,
          importancia_features: null,
        }))
        .sort((a, b) => b.score_riesgo - a.score_riesgo);
    }

    try {
      const { rows: dataset } = await this.featureBuilderService.buildCategoryRiskDataset(filters);
      const datasetByCategoriaId = new Map(dataset.map((d) => [d.categoria_id, d] as const));
      const featuresByCategoriaId = new Map<number, CategoryRiskFeatures>();
      for (const d of dataset) {
        featuresByCategoriaId.set(
          d.categoria_id,
          this.featureBuilderService.buildFeaturesFromRow(d),
        );
      }

      return rows
        .map<RiesgoCategoriaType>((r) => {
          const baseFeature = datasetByCategoriaId.get(r.categoria_id);
          const features =
            featuresByCategoriaId.get(r.categoria_id) ?? this.buildFallbackFeatures(r, baseFeature);
          const prediction: CategoryRiskPrediction = this.categoryRiskModel.predict(features);
          return {
            categoria_id: r.categoria_id,
            categoria_nombre: r.categoria_nombre,
            total_productos: r.total_productos,
            productos_stock_bajo: r.productos_stock_bajo,
            ventas_periodo: r.ventas_periodo,
            score_riesgo: prediction.probability,
            clase_riesgo: prediction.label === 1 ? 'RIESGO_ALTO' : 'RIESGO_BAJO',
            probabilidad_riesgo: prediction.probability,
            importancia_features: null,
          };
        })
        .sort((a, b) => b.score_riesgo - a.score_riesgo);
    } catch (err) {
      this.logger.warn(`Fallo al predecir con ML, usando heurística: ${(err as Error).message}`);
      return rows
        .map<RiesgoCategoriaType>((r) => ({
          categoria_id: r.categoria_id,
          categoria_nombre: r.categoria_nombre,
          total_productos: r.total_productos,
          productos_stock_bajo: r.productos_stock_bajo,
          ventas_periodo: r.ventas_periodo,
          score_riesgo: r.score_riesgo,
          clase_riesgo: r.score_riesgo > RISK_CLASS_THRESHOLD ? 'RIESGO_ALTO' : 'RIESGO_BAJO',
          probabilidad_riesgo: r.score_riesgo,
          importancia_features: null,
        }))
        .sort((a, b) => b.score_riesgo - a.score_riesgo);
    }
  }

  private buildFallbackFeatures(
    r: {
      total_productos: number;
      productos_stock_bajo: number;
      ventas_periodo: number;
    },
    datasetRow:
      | {
          ratio_stock_bajo: number;
          ventas_por_producto: number;
          tendencia_ventas: number;
          dias_promedio_sin_venta: number;
        }
      | undefined,
  ): CategoryRiskFeatures {
    return {
      total_productos: r.total_productos,
      productos_stock_bajo: r.productos_stock_bajo,
      ratio_stock_bajo:
        datasetRow?.ratio_stock_bajo ??
        (r.total_productos ? r.productos_stock_bajo / r.total_productos : 0),
      ventas_periodo: r.ventas_periodo,
      ventas_por_producto:
        datasetRow?.ventas_por_producto ??
        (r.total_productos ? r.ventas_periodo / r.total_productos : 0),
      tendencia_ventas: datasetRow?.tendencia_ventas ?? 0,
      dias_promedio_sin_venta: datasetRow?.dias_promedio_sin_venta ?? 0,
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
