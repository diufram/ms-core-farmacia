import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaProducto } from '../../database/entities/categoria-producto.entity';

@Injectable()
export class CategoriasRepository {
  constructor(
    @InjectRepository(CategoriaProducto)
    private readonly categoriaRepository: Repository<CategoriaProducto>,
  ) {}

  findAll(sucursalId?: number): Promise<CategoriaProducto[]> {
    const where = sucursalId ? { sucursal: { id: sucursalId } } : {};
    return this.categoriaRepository.find({
      where,
      order: { nombre: 'ASC' },
      relations: ['sucursal'],
    });
  }

  findById(id: number): Promise<CategoriaProducto | null> {
    return this.categoriaRepository.findOne({
      where: { id },
      relations: ['sucursal'],
    });
  }

  findByCodigoAndSucursal(
    codigo: string,
    sucursalId: number,
  ): Promise<CategoriaProducto | null> {
    return this.categoriaRepository.findOne({
      where: { codigo, sucursal: { id: sucursalId } },
    });
  }

  create(data: Partial<CategoriaProducto>): CategoriaProducto {
    return this.categoriaRepository.create(data);
  }

  async save(categoria: CategoriaProducto): Promise<CategoriaProducto> {
    return this.categoriaRepository.save(categoria);
  }

  async softDelete(id: number): Promise<void> {
    await this.categoriaRepository.softDelete(id);
  }
}
