import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../../database/entities/cliente.entity';
import { Producto } from '../../database/entities/producto.entity';
import { Sucursal } from '../../database/entities/sucursal.entity';
import { Venta } from '../../database/entities/venta.entity';
import { VentaDetalle } from '../../database/entities/venta-detalle.entity';
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
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
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
      const fechaStr = String(r.fecha);
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

  async countProductosStockBajo(
    umbral: number,
    filters: { sucursalId?: number },
  ): Promise<number> {
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

  countClientes(filters: { sucursalId?: number }): Promise<number> {
    const qb = this.clienteRepository.createQueryBuilder('c');
    if (filters.sucursalId) {
      qb.where('c.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }
    return qb.getCount();
  }

  countSucursales(
    userRol: string,
    userSucursalId: number | null,
  ): Promise<number> {
    if (userRol === Rol.SUPER_ADMIN) {
      return this.sucursalRepository.count();
    }
    return this.sucursalRepository.count({
      where: userSucursalId ? { id: userSucursalId } : {},
    });
  }
}
