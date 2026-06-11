import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaProducto } from '../../database/entities/categoria-producto.entity';
import { Producto } from '../../database/entities/producto.entity';

export interface ProductoFilters {
  sucursalId?: number;
  categoriaId?: number;
}

@Injectable()
export class ProductosRepository {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(CategoriaProducto)
    private readonly categoriaRepository: Repository<CategoriaProducto>,
  ) {}

  findAll(filters: ProductoFilters): Promise<Producto[]> {
    const where: Record<string, unknown> = {};
    if (filters.sucursalId) where.sucursal = { id: filters.sucursalId };
    if (filters.categoriaId) where.categoria = { id: filters.categoriaId };
    return this.productoRepository.find({
      where,
      order: { nombre: 'ASC' },
      relations: ['sucursal', 'categoria'],
    });
  }

  findById(id: number): Promise<Producto | null> {
    return this.productoRepository.findOne({
      where: { id },
      relations: ['sucursal', 'categoria'],
    });
  }

  findByCodigoAndSucursal(codigo: string, sucursalId: number): Promise<Producto | null> {
    return this.productoRepository.findOne({
      where: { codigo, sucursal: { id: sucursalId } },
    });
  }

  findCategoriaById(id: number): Promise<CategoriaProducto | null> {
    return this.categoriaRepository.findOne({
      where: { id },
      relations: ['sucursal'],
    });
  }

  create(data: Partial<Producto>): Producto {
    return this.productoRepository.create(data);
  }

  async save(producto: Producto): Promise<Producto> {
    return this.productoRepository.save(producto);
  }

  async softDelete(id: number): Promise<void> {
    await this.productoRepository.softDelete(id);
  }
}
