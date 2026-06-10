import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriaProducto } from '../../database/entities/categoria-producto.entity';
import { Rol } from '../../database/entities/usuario.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { CategoriasRepository } from './categorias.repository';

@Injectable()
export class CategoriasService {
  constructor(private readonly categoriasRepository: CategoriasRepository) {}

  async findAll(
    userRol: string,
    userSucursalId: number | null,
    filterSucursalId: number | null,
  ) {
    const targetSucursalId = this.resolveSucursalId(
      userRol,
      userSucursalId,
      filterSucursalId,
    );
    const categorias = await this.categoriasRepository.findAll(
      targetSucursalId ?? undefined,
    );
    return categorias.map((c) => this.serializeCategoria(c));
  }

  async findOne(
    id: number,
    userRol: string,
    userSucursalId: number | null,
  ) {
    const categoria = await this.categoriasRepository.findById(id);
    if (!categoria) {
      throw new NotFoundException('Categoria no encontrada.');
    }
    this.assertSucursalAccess(categoria, userRol, userSucursalId);
    return this.serializeCategoria(categoria);
  }

  async create(
    dto: CreateCategoriaDto,
    userRol: string,
    userSucursalId: number | null,
  ) {
    this.assertCanUseSucursal(userRol, userSucursalId, dto.sucursalId);
    const targetSucursalId = this.resolveSucursalId(
      userRol,
      userSucursalId,
      dto.sucursalId,
    );

    if (!targetSucursalId) {
      throw new ForbiddenException(
        'Debe indicar una sucursal valida para crear la categoria.',
      );
    }

    const existing = await this.categoriasRepository.findByCodigoAndSucursal(
      dto.codigo,
      targetSucursalId,
    );
    if (existing) {
      throw new ConflictException(
        'Ya existe una categoria con ese codigo en esta sucursal.',
      );
    }

    const categoria = this.categoriasRepository.create({
      nombre: dto.nombre,
      codigo: dto.codigo,
      sucursal: { id: targetSucursalId } as CategoriaProducto['sucursal'],
    });
    const saved = await this.categoriasRepository.save(categoria);
    return {
      categoria: this.serializeCategoria(saved),
      message: 'Categoria creada correctamente.',
    };
  }

  async update(
    id: number,
    dto: UpdateCategoriaDto,
    userRol: string,
    userSucursalId: number | null,
  ) {
    const categoria = await this.categoriasRepository.findById(id);
    if (!categoria) {
      throw new NotFoundException('Categoria no encontrada.');
    }
    this.assertSucursalAccess(categoria, userRol, userSucursalId);

    if (dto.codigo && dto.codigo !== categoria.codigo) {
      const existing = await this.categoriasRepository.findByCodigoAndSucursal(
        dto.codigo,
        categoria.sucursal.id,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Ya existe una categoria con ese codigo en esta sucursal.',
        );
      }
    }

    if (dto.nombre !== undefined) categoria.nombre = dto.nombre;
    if (dto.codigo !== undefined) categoria.codigo = dto.codigo;

    const saved = await this.categoriasRepository.save(categoria);
    return this.serializeCategoria(saved);
  }

  async delete(
    id: number,
    userRol: string,
    userSucursalId: number | null,
  ) {
    const categoria = await this.categoriasRepository.findById(id);
    if (!categoria) {
      throw new NotFoundException('Categoria no encontrada.');
    }
    this.assertSucursalAccess(categoria, userRol, userSucursalId);
    const snapshot = this.serializeCategoria(categoria);
    await this.categoriasRepository.softDelete(id);
    return {
      categoria: snapshot,
      message: 'Categoria eliminada correctamente.',
    };
  }

  private resolveSucursalId(
    userRol: string,
    userSucursalId: number | null,
    requestedSucursalId: number | null,
  ): number | null {
    if (userRol === Rol.SUPER_ADMIN) {
      return requestedSucursalId;
    }
    return userSucursalId;
  }

  private assertSucursalAccess(
    categoria: CategoriaProducto,
    userRol: string,
    userSucursalId: number | null,
  ) {
    if (userRol === Rol.SUPER_ADMIN) {
      return;
    }
    if (categoria.sucursal.id !== userSucursalId) {
      throw new ForbiddenException(
        'No tiene permiso para operar sobre categorias de otra sucursal.',
      );
    }
  }

  private assertCanUseSucursal(
    userRol: string,
    userSucursalId: number | null,
    requestedSucursalId: number,
  ) {
    if (userRol === Rol.SUPER_ADMIN) {
      return;
    }
    if (requestedSucursalId !== userSucursalId) {
      throw new ForbiddenException(
        'Solo puede operar sobre categorias de su propia sucursal.',
      );
    }
  }

  private serializeCategoria(categoria: CategoriaProducto) {
    return {
      id: categoria.id,
      nombre: categoria.nombre,
      codigo: categoria.codigo,
      sucursal_id: categoria.sucursal?.id ?? null,
    };
  }
}
