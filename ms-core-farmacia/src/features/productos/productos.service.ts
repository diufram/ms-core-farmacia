import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriaProducto } from '../../database/entities/categoria-producto.entity';
import { Producto } from '../../database/entities/producto.entity';
import { RolGlobal } from '../../database/entities/usuario.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ProductosRepository } from './productos.repository';

@Injectable()
export class ProductosService {
  constructor(private readonly productosRepository: ProductosRepository) {}

  async findAll(
    userRol: string,
    userSucursalId: number | null,
    filters: { sucursalId?: number; categoriaId?: number },
  ) {
    const targetSucursalId = this.resolveSucursalId(
      userRol,
      userSucursalId,
      filters.sucursalId ?? null,
    );
    const productos = await this.productosRepository.findAll({
      sucursalId: targetSucursalId ?? undefined,
      categoriaId: filters.categoriaId,
    });
    return productos.map((p) => this.serializeProducto(p));
  }

  async findOne(id: number, userRol: string, userSucursalId: number | null) {
    const producto = await this.productosRepository.findById(id);
    if (!producto) {
      throw new NotFoundException('Producto no encontrado.');
    }
    this.assertSucursalAccess(producto, userRol, userSucursalId);
    return this.serializeProducto(producto);
  }

  async create(
    dto: CreateProductoDto,
    userRol: string,
    userSucursalId: number | null,
  ) {
    const categoria = await this.productosRepository.findCategoriaById(
      dto.categoriaId,
    );
    if (!categoria) {
      throw new NotFoundException('Categoria no encontrada.');
    }

    if (
      userRol !== RolGlobal.SUPER_ADMIN &&
      categoria.sucursal.id !== userSucursalId
    ) {
      throw new ForbiddenException(
        'No puede crear productos con categorias de otra sucursal.',
      );
    }

    const existing = await this.productosRepository.findByCodigoAndSucursal(
      dto.codigo,
      categoria.sucursal.id,
    );
    if (existing) {
      throw new ConflictException(
        'Ya existe un producto con ese codigo en esta sucursal.',
      );
    }

    const producto = this.productosRepository.create({
      codigo: dto.codigo,
      nombre: dto.nombre,
      stock_actual: dto.stock_actual ?? 0,
      precio_venta: dto.precio_venta,
      categoria: { id: categoria.id } as Producto['categoria'],
      sucursal: { id: categoria.sucursal.id } as Producto['sucursal'],
    });
    const saved = await this.productosRepository.save(producto);
    return {
      producto: this.serializeProducto(saved),
      message: 'Producto creado correctamente.',
    };
  }

  async update(
    id: number,
    dto: UpdateProductoDto,
    userRol: string,
    userSucursalId: number | null,
  ) {
    const producto = await this.productosRepository.findById(id);
    if (!producto) {
      throw new NotFoundException('Producto no encontrado.');
    }
    this.assertSucursalAccess(producto, userRol, userSucursalId);

    if (dto.categoriaId && dto.categoriaId !== producto.categoria.id) {
      const nuevaCategoria = await this.productosRepository.findCategoriaById(
        dto.categoriaId,
      );
      if (!nuevaCategoria) {
        throw new NotFoundException('Categoria no encontrada.');
      }
      if (
        userRol !== RolGlobal.SUPER_ADMIN &&
        nuevaCategoria.sucursal.id !== userSucursalId
      ) {
        throw new ForbiddenException(
          'No puede asignar categorias de otra sucursal.',
        );
      }
      producto.categoria = nuevaCategoria;
      producto.sucursal = nuevaCategoria.sucursal;
    }

    if (dto.nombre !== undefined) producto.nombre = dto.nombre;
    if (dto.stock_actual !== undefined) producto.stock_actual = dto.stock_actual;
    if (dto.precio_venta !== undefined) producto.precio_venta = dto.precio_venta;

    const saved = await this.productosRepository.save(producto);
    return this.serializeProducto(saved);
  }

  async delete(id: number, userRol: string, userSucursalId: number | null) {
    const producto = await this.productosRepository.findById(id);
    if (!producto) {
      throw new NotFoundException('Producto no encontrado.');
    }
    this.assertSucursalAccess(producto, userRol, userSucursalId);
    const snapshot = this.serializeProducto(producto);
    await this.productosRepository.softDelete(id);
    return {
      producto: snapshot,
      message: 'Producto eliminado correctamente.',
    };
  }

  private resolveSucursalId(
    userRol: string,
    userSucursalId: number | null,
    requestedSucursalId: number | null,
  ): number | null {
    if (userRol === RolGlobal.SUPER_ADMIN) {
      return requestedSucursalId;
    }
    return userSucursalId;
  }

  private assertSucursalAccess(
    producto: Producto,
    userRol: string,
    userSucursalId: number | null,
  ) {
    if (userRol === RolGlobal.SUPER_ADMIN) {
      return;
    }
    if (producto.sucursal.id !== userSucursalId) {
      throw new ForbiddenException(
        'No tiene permiso para operar sobre productos de otra sucursal.',
      );
    }
  }

  private serializeCategoriaRef(categoria: CategoriaProducto | undefined) {
    if (!categoria) return null;
    return { id: categoria.id, sucursal_id: categoria.sucursal?.id ?? null };
  }

  private serializeProducto(producto: Producto) {
    return {
      id: producto.id,
      codigo: producto.codigo,
      nombre: producto.nombre,
      stock_actual: producto.stock_actual,
      precio_venta: Number(producto.precio_venta),
      categoria_id: producto.categoria?.id ?? null,
      sucursal_id: producto.sucursal?.id ?? null,
    };
  }
}
