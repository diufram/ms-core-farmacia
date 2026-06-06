import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Producto } from '../../database/entities/producto.entity';
import { Venta } from '../../database/entities/venta.entity';
import { VentaDetalle } from '../../database/entities/venta-detalle.entity';

export interface VentaFilters {
  sucursalId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

@Injectable()
export class VentasRepository {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) {}

  findAll(filters: VentaFilters): Promise<Venta[]> {
    const qb = this.ventaRepository
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.sucursal', 's')
      .leftJoinAndSelect('v.usuario', 'u')
      .leftJoinAndSelect('v.detalles', 'd')
      .leftJoinAndSelect('d.producto', 'p')
      .leftJoinAndSelect('v.cliente', 'c')
      .leftJoinAndSelect('c.persona', 'cp')
      .orderBy('v.created_at', 'DESC');

    if (filters.sucursalId) {
      qb.andWhere('v.sucursal_id = :sucursalId', { sucursalId: filters.sucursalId });
    }
    if (filters.fechaDesde) {
      qb.andWhere('v.fecha_venta >= :fechaDesde', { fechaDesde: filters.fechaDesde });
    }
    if (filters.fechaHasta) {
      qb.andWhere('v.fecha_venta <= :fechaHasta', { fechaHasta: filters.fechaHasta });
    }

    return qb.getMany();
  }

  findById(id: number): Promise<Venta | null> {
    return this.ventaRepository.findOne({
      where: { id },
      relations: [
        'sucursal',
        'usuario',
        'cliente',
        'detalles',
        'detalles.producto',
      ],
    });
  }

  findProductosByIds(ids: number[]): Promise<Producto[]> {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }
    return this.productoRepository.find({
      where: { id: In(ids) },
      relations: ['sucursal'],
    });
  }

  create(data: Partial<Venta>): Venta {
    return this.ventaRepository.create(data);
  }

  createDetalle(data: Partial<VentaDetalle>): VentaDetalle {
    return this.ventaRepository.manager.create(VentaDetalle, data);
  }

  async softDelete(id: number): Promise<void> {
    await this.ventaRepository.softDelete(id);
  }
}
