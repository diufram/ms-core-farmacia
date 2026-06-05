import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaProducto } from '../../database/entities/categoria-producto.entity';
import { CategoriasRepository } from './categorias.repository';
import { CategoriasResolver } from './categorias.resolver';
import { CategoriasService } from './categorias.service';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaProducto])],
  providers: [CategoriasService, CategoriasRepository, CategoriasResolver],
})
export class CategoriasModule {}
