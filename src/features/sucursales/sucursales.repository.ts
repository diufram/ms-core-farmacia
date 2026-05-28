import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sucursal } from '../../database/entities/sucursal.entity';

@Injectable()
export class SucursalesRepository {
  constructor(
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
  ) {}

  findAll(): Promise<Sucursal[]> {
    return this.sucursalRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: number): Promise<Sucursal | null> {
    return this.sucursalRepository.findOne({ where: { id } });
  }

  findBySlug(slug: string): Promise<Sucursal | null> {
    return this.sucursalRepository.findOne({ where: { slug } });
  }
}
