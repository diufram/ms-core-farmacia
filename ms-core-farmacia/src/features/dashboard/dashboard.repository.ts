import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../../database/entities/producto.entity';
import { Sucursal } from '../../database/entities/sucursal.entity';
import { Venta } from '../../database/entities/venta.entity';
import { VentaDetalle } from '../../database/entities/venta-detalle.entity';
import { CategoriaProducto } from '../../database/entities/categoria-producto.entity';
import { Rol } from '../../database/entities/usuario.entity';

export interface DashboardFilters {
  sucursalId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  stockBajoUmbral?: number;
}

@Injectable()
export class DashboardRepository {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(VentaDetalle)
    private readonly ventaDetalleRepository: Repository<VentaDetalle>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
    @InjectRepository(CategoriaProducto)
    private readonly categoriaRepository: Repository<CategoriaProducto>,
  ) {}

  async ventasTotales(filters: {
    sucursalId?: number;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Promise<{ total: number; cantidad: number }> {
    const qb = this.ventaRepository
      .createQueryBuilder('v')
      .select('COALESCE(SUM(v.total), 0)', 'total')
      .addSelect('COUNT(v.id)', 'cantidad');

    if (filters.sucursalId) {
      qb.andWhere('v.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }
    if (filters.fechaDesde) {
      qb.andWhere('v.fecha_venta >= :fechaDesde', {
        fechaDesde: filters.fechaDesde,
      });
    }
    if (filters.fechaHasta) {
      qb.andWhere('v.fecha_venta <= :fechaHasta', {
        fechaHasta: filters.fechaHasta,
      });
    }

    const row = await qb.getRawOne<{ total: string; cantidad: string }>();
    return {
      total: Number(row?.total ?? 0),
      cantidad: Number(row?.cantidad ?? 0),
    };
  }

  async ventasPorSucursal(filters: {
    sucursalId?: number;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Promise<
    {
      sucursal_id: number;
      sucursal_nombre: string;
      total: number;
      cantidad: number;
    }[]
  > {
    const qb = this.ventaRepository
      .createQueryBuilder('v')
      .innerJoin('v.sucursal', 's')
      .select('s.id', 'sucursal_id')
      .addSelect('s.nombre', 'sucursal_nombre')
      .addSelect('COALESCE(SUM(v.total), 0)', 'total')
      .addSelect('COUNT(v.id)', 'cantidad')
      .groupBy('s.id')
      .addGroupBy('s.nombre')
      .orderBy('total', 'DESC');

    if (filters.sucursalId) {
      qb.andWhere('v.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }
    if (filters.fechaDesde) {
      qb.andWhere('v.fecha_venta >= :fechaDesde', {
        fechaDesde: filters.fechaDesde,
      });
    }
    if (filters.fechaHasta) {
      qb.andWhere('v.fecha_venta <= :fechaHasta', {
        fechaHasta: filters.fechaHasta,
      });
    }

    const rows = await qb.getRawMany<{
      sucursal_id: string;
      sucursal_nombre: string;
      total: string;
      cantidad: string;
    }>();
    return rows.map((r) => ({
      sucursal_id: Number(r.sucursal_id),
      sucursal_nombre: r.sucursal_nombre,
      total: Number(r.total),
      cantidad: Number(r.cantidad),
    }));
  }

  async topProductos(
    limite: number,
    filters: { sucursalId?: number; fechaDesde?: string; fechaHasta?: string },
  ): Promise<
    {
      producto_id: number;
      nombre: string;
      codigo: string;
      cantidad_vendida: number;
      total_vendido: number;
    }[]
  > {
    const qb = this.ventaDetalleRepository
      .createQueryBuilder('d')
      .innerJoin('d.venta', 'v')
      .innerJoin('d.producto', 'p')
      .select('p.id', 'producto_id')
      .addSelect('p.nombre', 'nombre')
      .addSelect('p.codigo', 'codigo')
      .addSelect('SUM(d.cantidad)', 'cantidad_vendida')
      .addSelect('SUM(d.cantidad * d.precio_unitario)', 'total_vendido')
      .groupBy('p.id')
      .addGroupBy('p.nombre')
      .addGroupBy('p.codigo')
      .orderBy('cantidad_vendida', 'DESC')
      .limit(limite);

    if (filters.sucursalId) {
      qb.andWhere('v.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }
    if (filters.fechaDesde) {
      qb.andWhere('v.fecha_venta >= :fechaDesde', {
        fechaDesde: filters.fechaDesde,
      });
    }
    if (filters.fechaHasta) {
      qb.andWhere('v.fecha_venta <= :fechaHasta', {
        fechaHasta: filters.fechaHasta,
      });
    }

    const rows = await qb.getRawMany<{
      producto_id: string;
      nombre: string;
      codigo: string;
      cantidad_vendida: string;
      total_vendido: string;
    }>();
    return rows.map((r) => ({
      producto_id: Number(r.producto_id),
      nombre: r.nombre,
      codigo: r.codigo,
      cantidad_vendida: Number(r.cantidad_vendida),
      total_vendido: Number(r.total_vendido),
    }));
  }

  async ventasPorDia(
    dias: number,
    filters: { sucursalId?: number },
  ): Promise<{ fecha: string; cantidad: number; total: number }[]> {
    const fechaDesde = new Date();
    fechaDesde.setDate(fechaDesde.getDate() - (dias - 1));
    const fechaDesdeStr = fechaDesde.toISOString().slice(0, 10);

    const qb = this.ventaRepository
      .createQueryBuilder('v')
      .select('v.fecha_venta', 'fecha')
      .addSelect('COUNT(v.id)', 'cantidad')
      .addSelect('COALESCE(SUM(v.total), 0)', 'total')
      .where('v.fecha_venta >= :fechaDesde', { fechaDesde: fechaDesdeStr })
      .groupBy('v.fecha_venta')
      .orderBy('v.fecha_venta', 'ASC');

    if (filters.sucursalId) {
      qb.andWhere('v.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }

    const rows = await qb.getRawMany<{
      fecha: string;
      cantidad: string;
      total: string;
    }>();

    const map = new Map<string, { cantidad: number; total: number }>();
    for (const r of rows) {
      const fechaStr = this.toDateString(r.fecha);
      map.set(fechaStr, {
        cantidad: Number(r.cantidad),
        total: Number(r.total),
      });
    }

    const result: { fecha: string; cantidad: number; total: number }[] = [];
    for (let i = 0; i < dias; i++) {
      const d = new Date(fechaDesde);
      d.setDate(d.getDate() + i);
      const fechaStr = d.toISOString().slice(0, 10);
      const data = map.get(fechaStr) ?? { cantidad: 0, total: 0 };
      result.push({ fecha: fechaStr, ...data });
    }
    return result;
  }

  async productosStockBajoList(
    umbral: number,
    filters: { sucursalId?: number },
    limite: number,
  ): Promise<
    {
      id: number;
      codigo: string;
      nombre: string;
      stock_actual: number;
      sucursal_id: number;
      sucursal_nombre: string;
    }[]
  > {
    const qb = this.productoRepository
      .createQueryBuilder('p')
      .innerJoin('p.sucursal', 's')
      .select([
        'p.id AS id',
        'p.codigo AS codigo',
        'p.nombre AS nombre',
        'p.stock_actual AS stock_actual',
        's.id AS sucursal_id',
        's.nombre AS sucursal_nombre',
      ])
      .where('p.stock_actual < :umbral', { umbral })
      .orderBy('p.stock_actual', 'ASC')
      .addOrderBy('p.nombre', 'ASC')
      .limit(limite);

    if (filters.sucursalId) {
      qb.andWhere('p.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }

    return qb.getRawMany();
  }

  async countProductosStockBajo(umbral: number, filters: { sucursalId?: number }): Promise<number> {
    const qb = this.productoRepository
      .createQueryBuilder('p')
      .where('p.stock_actual < :umbral', { umbral });

    if (filters.sucursalId) {
      qb.andWhere('p.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }
    return qb.getCount();
  }

  countProductos(filters: { sucursalId?: number }): Promise<number> {
    const qb = this.productoRepository.createQueryBuilder('p');
    if (filters.sucursalId) {
      qb.where('p.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }
    return qb.getCount();
  }

  countSucursales(userRol: string, userSucursalId: number | null): Promise<number> {
    if (userRol === Rol.SUPER_ADMIN) {
      return this.sucursalRepository.count();
    }
    return this.sucursalRepository.count({
      where: userSucursalId ? { id: userSucursalId } : {},
    });
  }

  async topClientes(
    limite: number,
    filters: { sucursalId?: number; fechaDesde?: string; fechaHasta?: string },
  ): Promise<
    {
      cliente_nombre: string | null;
      cliente_codigo: string | null;
      cantidad_ventas: number;
      total_comprado: number;
    }[]
  > {
    const qb = this.ventaRepository
      .createQueryBuilder('v')
      .select('v.cliente_nombre', 'cliente_nombre')
      .addSelect('v.cliente_codigo', 'cliente_codigo')
      .addSelect('COUNT(v.id)', 'cantidad_ventas')
      .addSelect('COALESCE(SUM(v.total), 0)', 'total_comprado')
      .where('v.estado = :estado', { estado: 'CONFIRMADA' })
      .groupBy('v.cliente_nombre')
      .addGroupBy('v.cliente_codigo')
      .orderBy('total_comprado', 'DESC')
      .limit(limite);

    if (filters.sucursalId) {
      qb.andWhere('v.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }
    if (filters.fechaDesde) {
      qb.andWhere('v.fecha_venta >= :fechaDesde', {
        fechaDesde: filters.fechaDesde,
      });
    }
    if (filters.fechaHasta) {
      qb.andWhere('v.fecha_venta <= :fechaHasta', {
        fechaHasta: filters.fechaHasta,
      });
    }

    const rows = await qb.getRawMany<{
      cliente_nombre: string | null;
      cliente_codigo: string | null;
      cantidad_ventas: string;
      total_comprado: string;
    }>();
    return rows.map((r) => ({
      cliente_nombre: r.cliente_nombre,
      cliente_codigo: r.cliente_codigo,
      cantidad_ventas: Number(r.cantidad_ventas),
      total_comprado: Number(r.total_comprado),
    }));
  }

  async productosSinMovimiento(
    limite: number,
    rangoDias: number,
    filters: { sucursalId?: number; stockBajoUmbral?: number },
  ): Promise<
    {
      id: number;
      codigo: string;
      nombre: string;
      stock_actual: number;
      categoria_nombre: string;
      dias_sin_venta: number;
    }[]
  > {
    const fechaDesdeLimite = new Date();
    fechaDesdeLimite.setDate(fechaDesdeLimite.getDate() - rangoDias);
    const fechaLimiteStr = fechaDesdeLimite.toISOString().slice(0, 10);

    const qb = this.productoRepository
      .createQueryBuilder('p')
      .innerJoin('p.categoria', 'c')
      .leftJoin(
        (sub) =>
          sub
            .select('d.producto_id', 'producto_id')
            .addSelect('MAX(v.fecha_venta)', 'ultima_venta')
            .from(VentaDetalle, 'd')
            .innerJoin('d.venta', 'v')
            .where('v.estado = :estado', { estado: 'CONFIRMADA' })
            .groupBy('d.producto_id'),
        'uv',
        'uv.producto_id = p.id',
      )
      .select('p.id', 'id')
      .addSelect('p.codigo', 'codigo')
      .addSelect('p.nombre', 'nombre')
      .addSelect('p.stock_actual', 'stock_actual')
      .addSelect('c.nombre', 'categoria_nombre')
      .addSelect(
        `COALESCE(DATE_PART('day', NOW() - uv.ultima_venta::timestamp), ${rangoDias})`,
        'dias_sin_venta',
      )
      .where('(uv.ultima_venta IS NULL OR uv.ultima_venta < :fechaLimite)', {
        fechaLimite: fechaLimiteStr,
      })
      .orderBy('p.stock_actual', 'DESC')
      .limit(limite);

    if (filters.sucursalId) {
      qb.andWhere('p.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }
    if (filters.stockBajoUmbral != null) {
      qb.andWhere('p.stock_actual >= :umbral', {
        umbral: filters.stockBajoUmbral,
      });
    }

    const rows = await qb.getRawMany<{
      id: string;
      codigo: string;
      nombre: string;
      stock_actual: string;
      categoria_nombre: string;
      dias_sin_venta: string;
    }>();
    return rows.map((r) => ({
      id: Number(r.id),
      codigo: r.codigo,
      nombre: r.nombre,
      stock_actual: Number(r.stock_actual),
      categoria_nombre: r.categoria_nombre,
      dias_sin_venta: Number(r.dias_sin_venta),
    }));
  }

  async riesgoPorCategoria(filters: {
    sucursalId?: number;
    stockBajoUmbral?: number;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Promise<
    {
      categoria_id: number;
      categoria_nombre: string;
      total_productos: number;
      productos_stock_bajo: number;
      ventas_periodo: number;
      score_riesgo: number;
    }[]
  > {
    const umbral = filters.stockBajoUmbral ?? 10;

    const qbProductos = this.productoRepository
      .createQueryBuilder('p')
      .innerJoin('p.categoria', 'c')
      .select('c.id', 'categoria_id')
      .addSelect('c.nombre', 'categoria_nombre')
      .addSelect('COUNT(p.id)', 'total_productos')
      .addSelect(
        `SUM(CASE WHEN p.stock_actual < ${umbral} THEN 1 ELSE 0 END)`,
        'productos_stock_bajo',
      )
      .groupBy('c.id')
      .addGroupBy('c.nombre');

    if (filters.sucursalId) {
      qbProductos.andWhere('p.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }

    const productos = await qbProductos.getRawMany<{
      categoria_id: string;
      categoria_nombre: string;
      total_productos: string;
      productos_stock_bajo: string;
    }>();

    const qbVentas = this.ventaDetalleRepository
      .createQueryBuilder('d')
      .innerJoin('d.venta', 'v')
      .innerJoin('d.producto', 'p')
      .innerJoin('p.categoria', 'c')
      .select('c.id', 'categoria_id')
      .addSelect('COALESCE(SUM(d.cantidad), 0)', 'ventas_periodo')
      .where('v.estado = :estado', { estado: 'CONFIRMADA' })
      .groupBy('c.id');

    if (filters.sucursalId) {
      qbVentas.andWhere('v.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }
    if (filters.fechaDesde) {
      qbVentas.andWhere('v.fecha_venta >= :fechaDesde', {
        fechaDesde: filters.fechaDesde,
      });
    }
    if (filters.fechaHasta) {
      qbVentas.andWhere('v.fecha_venta <= :fechaHasta', {
        fechaHasta: filters.fechaHasta,
      });
    }

    const ventas = await qbVentas.getRawMany<{
      categoria_id: string;
      ventas_periodo: string;
    }>();
    const ventasMap = new Map<number, number>();
    for (const v of ventas) {
      ventasMap.set(Number(v.categoria_id), Number(v.ventas_periodo));
    }

    const maxVentas = Math.max(1, ...Array.from(ventasMap.values()));

    return productos.map((p) => {
      const totalProductos = Number(p.total_productos);
      const stockBajo = Number(p.productos_stock_bajo);
      const ventasCategoria = ventasMap.get(Number(p.categoria_id)) ?? 0;
      const ratioStockBajo = totalProductos ? stockBajo / totalProductos : 0;
      const ratioSinVenta = 1 - ventasCategoria / maxVentas;
      const score = ratioStockBajo * 0.5 + ratioSinVenta * 0.5;
      return {
        categoria_id: Number(p.categoria_id),
        categoria_nombre: p.categoria_nombre,
        total_productos: totalProductos,
        productos_stock_bajo: stockBajo,
        ventas_periodo: ventasCategoria,
        score_riesgo: score,
      };
    });
  }

  async ventasTendenciaCategoria(filters: {
    sucursalId?: number;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Promise<Map<number, { recientes: number; previas: number }>> {
    const fechaFin = filters.fechaHasta ? new Date(filters.fechaHasta) : new Date();
    const fechaInicioRecientes = new Date(fechaFin);
    fechaInicioRecientes.setDate(fechaInicioRecientes.getDate() - 30);
    const fechaInicioPeriodoPrevio = new Date(fechaFin);
    fechaInicioPeriodoPrevio.setDate(fechaInicioPeriodoPrevio.getDate() - 60);
    const fechaFinPeriodoPrevio = new Date(fechaFin);
    fechaFinPeriodoPrevio.setDate(fechaFinPeriodoPrevio.getDate() - 30);

    const inicioRecientesStr = fechaInicioRecientes.toISOString().slice(0, 10);
    const inicioPrevioStr = fechaInicioPeriodoPrevio.toISOString().slice(0, 10);
    const finPrevioStr = fechaFinPeriodoPrevio.toISOString().slice(0, 10);

    const recientesQb = this.ventaDetalleRepository
      .createQueryBuilder('d')
      .innerJoin('d.venta', 'v')
      .innerJoin('d.producto', 'p')
      .innerJoin('p.categoria', 'c')
      .select('c.id', 'categoria_id')
      .addSelect('COALESCE(SUM(d.cantidad), 0)', 'total')
      .where('v.estado = :estado', { estado: 'CONFIRMADA' })
      .andWhere('v.fecha_venta >= :desde', { desde: inicioRecientesStr })
      .groupBy('c.id');

    const previosQb = this.ventaDetalleRepository
      .createQueryBuilder('d')
      .innerJoin('d.venta', 'v')
      .innerJoin('d.producto', 'p')
      .innerJoin('p.categoria', 'c')
      .select('c.id', 'categoria_id')
      .addSelect('COALESCE(SUM(d.cantidad), 0)', 'total')
      .where('v.estado = :estado', { estado: 'CONFIRMADA' })
      .andWhere('v.fecha_venta >= :desde', { desde: inicioPrevioStr })
      .andWhere('v.fecha_venta < :hasta', { hasta: finPrevioStr })
      .groupBy('c.id');

    if (filters.sucursalId) {
      recientesQb.andWhere('v.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
      previosQb.andWhere('v.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }

    const [recientes, previos] = await Promise.all([
      recientesQb.getRawMany<{ categoria_id: string; total: string }>(),
      previosQb.getRawMany<{ categoria_id: string; total: string }>(),
    ]);

    const map = new Map<number, { recientes: number; previas: number }>();
    for (const r of recientes) {
      const id = Number(r.categoria_id);
      map.set(id, { recientes: Number(r.total), previas: 0 });
    }
    for (const p of previos) {
      const id = Number(p.categoria_id);
      const entry = map.get(id) ?? { recientes: 0, previas: 0 };
      entry.previas = Number(p.total);
      map.set(id, entry);
    }
    return map;
  }

  async diasSinVentaPromedioPorCategoria(filters: {
    sucursalId?: number;
    rangoDias?: number;
  }): Promise<Map<number, number>> {
    const rangoDias = filters.rangoDias ?? 60;

    const qb = this.productoRepository
      .createQueryBuilder('p')
      .innerJoin('p.categoria', 'c')
      .leftJoin(
        (sub) =>
          sub
            .select('d.producto_id', 'producto_id')
            .addSelect('MAX(v.fecha_venta)', 'ultima_venta')
            .from(VentaDetalle, 'd')
            .innerJoin('d.venta', 'v')
            .where('v.estado = :estado', { estado: 'CONFIRMADA' })
            .groupBy('d.producto_id'),
        'uv',
        'uv.producto_id = p.id',
      )
      .select('c.id', 'categoria_id')
      .addSelect(
        `AVG(COALESCE(DATE_PART('day', NOW() - uv.ultima_venta::timestamp), ${rangoDias}))`,
        'dias_promedio',
      )
      .groupBy('c.id');

    if (filters.sucursalId) {
      qb.andWhere('p.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }

    const rows = await qb.getRawMany<{
      categoria_id: string;
      dias_promedio: string;
    }>();
    const map = new Map<number, number>();
    for (const r of rows) {
      map.set(Number(r.categoria_id), Number(r.dias_promedio));
    }
    return map;
  }

  private toDateString(value: unknown): string {
    if (value == null) return '';
    if (value instanceof Date) {
      const y = value.getUTCFullYear();
      const m = String(value.getUTCMonth() + 1).padStart(2, '0');
      const d = String(value.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    const s = String(value as any);
    return s.length >= 10 ? s.slice(0, 10) : s;
  }
}
