import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaProducto } from '../../database/entities/categoria-producto.entity';
import { Producto } from '../../database/entities/producto.entity';
import { ProductosRepository } from './productos.repository';
import { ProductosResolver } from './productos.resolver';
import { ProductosService } from './productos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, CategoriaProducto])],
  providers: [ProductosService, ProductosRepository, ProductosResolver],
})
export class ProductosModule {}
