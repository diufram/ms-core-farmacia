import { Injectable, Logger } from '@nestjs/common';
import { DashboardRepository } from '../dashboard/dashboard.repository';
import {
  CategoryRiskFeatures,
  CategoryRiskModel,
  CategoryRiskTrainingResult,
} from './category-risk.model';
import { MIN_CATEGORIES_TO_TRAIN } from './ml.constants';

export interface CategoryRiskRow {
  categoria_id: number;
  categoria_nombre: string;
  total_productos: number;
  productos_stock_bajo: number;
  ventas_periodo: number;
  ratio_stock_bajo: number;
  ventas_por_producto: number;
  tendencia_ventas: number;
  dias_promedio_sin_venta: number;
  label: 0 | 1;
}

export interface CategoryRiskDataset {
  X: number[][];
  y: number[];
  rows: CategoryRiskRow[];
}

@Injectable()
export class FeatureBuilderService {
  private readonly logger = new Logger(FeatureBuilderService.name);

  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly categoryRiskModel: CategoryRiskModel,
  ) {}

  async buildCategoryRiskDataset(filters: {
    sucursalId?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    stockBajoUmbral?: number;
  }): Promise<CategoryRiskDataset> {
    const base = await this.dashboardRepository.riesgoPorCategoria(filters);
    const tendencia = await this.dashboardRepository.ventasTendenciaCategoria(filters);
    const diasSinVenta = await this.dashboardRepository.diasSinVentaPromedioPorCategoria(filters);

    const rows: CategoryRiskRow[] = base.map((b) => {
      const totalProductos = b.total_productos;
      const stockBajo = b.productos_stock_bajo;
      const ventasPeriodo = b.ventas_periodo;
      const ratioStockBajo = totalProductos ? stockBajo / totalProductos : 0;
      const ventasPorProducto = totalProductos ? ventasPeriodo / totalProductos : 0;
      const t = tendencia.get(b.categoria_id) ?? { recientes: 0, previas: 0 };
      const tendenciaVentas =
        t.previas > 0 ? (t.recientes - t.previas) / t.previas : t.recientes > 0 ? 1 : 0;
      const diasProm = diasSinVenta.get(b.categoria_id) ?? 0;

      return {
        categoria_id: b.categoria_id,
        categoria_nombre: b.categoria_nombre,
        total_productos: totalProductos,
        productos_stock_bajo: stockBajo,
        ventas_periodo: ventasPeriodo,
        ratio_stock_bajo: ratioStockBajo,
        ventas_por_producto: ventasPorProducto,
        tendencia_ventas: tendenciaVentas,
        dias_promedio_sin_venta: diasProm,
        label: 0,
      };
    });

    this.assignLabelsByPercentile(rows, 'ventas_por_producto');
    this.assignLabelsByPercentile(rows, 'dias_promedio_sin_venta');
    this.assignLabelsByPercentile(rows, 'tendencia_ventas');

    const X = rows.map((r) => [
      r.total_productos,
      r.productos_stock_bajo,
      r.ratio_stock_bajo,
      r.ventas_periodo,
      r.ventas_por_producto,
      r.tendencia_ventas,
      r.dias_promedio_sin_venta,
    ]);
    const y = rows.map((r) => r.label);

    if (rows.length < MIN_CATEGORIES_TO_TRAIN) {
      this.logger.warn(
        `Solo hay ${rows.length} categorías (mínimo ${MIN_CATEGORIES_TO_TRAIN}). El entrenamiento no procederá.`,
      );
    }

    return { X, y, rows };
  }

  private assignLabelsByPercentile(
    rows: CategoryRiskRow[],
    field: 'ventas_por_producto' | 'dias_promedio_sin_venta' | 'tendencia_ventas',
  ): void {
    if (rows.length < 4) return;
    const values = rows.map((r) => r[field]).sort((a, b) => a - b);
    const q1Index = Math.floor(values.length * 0.25);
    const q1Value = values[Math.min(q1Index, values.length - 1)];
    const ascending = field === 'ventas_por_producto' || field === 'tendencia_ventas';
    for (const r of rows) {
      const isInBottom = ascending ? r[field] <= q1Value : r[field] >= q1Value;
      if (isInBottom) {
        r.label = 1;
      }
    }
  }

  async trainCategoryRiskModel(filters: {
    sucursalId?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    stockBajoUmbral?: number;
  }): Promise<CategoryRiskTrainingResult> {
    const { X, y } = await this.buildCategoryRiskDataset(filters);
    return this.categoryRiskModel.train(X, y);
  }

  buildFeaturesFromRow(row: {
    total_productos: number;
    productos_stock_bajo: number;
    ventas_periodo: number;
    ratio_stock_bajo: number;
    ventas_por_producto: number;
    tendencia_ventas: number;
    dias_promedio_sin_venta: number;
  }): CategoryRiskFeatures {
    return {
      total_productos: row.total_productos,
      productos_stock_bajo: row.productos_stock_bajo,
      ratio_stock_bajo: row.ratio_stock_bajo,
      ventas_periodo: row.ventas_periodo,
      ventas_por_producto: row.ventas_por_producto,
      tendencia_ventas: row.tendencia_ventas,
      dias_promedio_sin_venta: row.dias_promedio_sin_venta,
    };
  }
}
