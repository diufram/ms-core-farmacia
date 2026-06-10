import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Persona } from '../../database/entities/persona.entity';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { Sucursal } from '../../database/entities/sucursal.entity';
import { Rol, Usuario } from '../../database/entities/usuario.entity';
import { UsuarioSucursal } from '../../database/entities/usuario-sucursal.entity';

export interface UsuarioFilters {
  sucursalId?: number;
  rol?: Rol;
}

@Injectable()
export class UsuariosRepository {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(UsuarioSucursal)
    private readonly usuarioSucursalRepository: Repository<UsuarioSucursal>,
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  findAll(filters: UsuarioFilters): Promise<Usuario[]> {
    const qb = this.usuarioRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.persona', 'p')
      .leftJoinAndSelect('u.sucursales', 'us')
      .leftJoinAndSelect('us.sucursal', 's')
      .orderBy('u.created_at', 'DESC');

    if (filters.rol) {
      qb.andWhere('u.rol = :rol', { rol: filters.rol });
    }
    if (filters.sucursalId) {
      qb.andWhere('us.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }
    return qb.getMany();
  }

  findById(id: number): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { id },
      relations: ['persona', 'sucursales', 'sucursales.sucursal'],
    });
  }

  findByIdIncludingDeleted(id: number): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: ['persona', 'sucursales', 'sucursales.sucursal'],
    });
  }

  findByUsername(
    nombreUsuario: string,
    excludeId?: number,
  ): Promise<Usuario | null> {
    const qb = this.usuarioRepository
      .createQueryBuilder('u')
      .where('u.nombre_usuario = :nombreUsuario', { nombreUsuario });
    if (excludeId) {
      qb.andWhere('u.id != :excludeId', { excludeId });
    }
    return qb.getOne();
  }

  findByEmail(
    correo: string,
    excludeId?: number,
  ): Promise<Usuario | null> {
    const qb = this.usuarioRepository
      .createQueryBuilder('u')
      .where('LOWER(u.correo_electronico) = LOWER(:correo)', { correo });
    if (excludeId) {
      qb.andWhere('u.id != :excludeId', { excludeId });
    }
    return qb.getOne();
  }

  findAsignacion(
    usuarioId: number,
    sucursalId: number,
  ): Promise<UsuarioSucursal | null> {
    return this.usuarioSucursalRepository.findOne({
      where: {
        usuario: { id: usuarioId },
        sucursal: { id: sucursalId },
      },
      relations: ['sucursal'],
    });
  }

  findAsignacionesByUsuario(usuarioId: number): Promise<UsuarioSucursal[]> {
    return this.usuarioSucursalRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: ['sucursal'],
    });
  }

  findSucursalById(id: number): Promise<Sucursal | null> {
    return this.sucursalRepository.findOne({ where: { id } });
  }

  createPersona(data: Partial<Persona>): Persona {
    return this.personaRepository.create(data);
  }

  createUsuario(data: Partial<Usuario>): Usuario {
    return this.usuarioRepository.create(data);
  }

  createAsignacion(data: Partial<UsuarioSucursal>): UsuarioSucursal {
    return this.usuarioSucursalRepository.create(data);
  }

  async unassignAsignacion(asignacion: UsuarioSucursal): Promise<void> {
    await this.usuarioSucursalRepository.remove(asignacion);
  }

  async saveUsuario(usuario: Usuario): Promise<Usuario> {
    return this.usuarioRepository.save(usuario);
  }

  async saveAsignacion(
    asignacion: UsuarioSucursal,
  ): Promise<UsuarioSucursal> {
    return this.usuarioSucursalRepository.save(asignacion);
  }

  async softDelete(id: number): Promise<void> {
    await this.usuarioRepository.softDelete(id);
  }

  async revokeRefreshTokens(usuarioId: number): Promise<void> {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .update()
      .set({ revoked_at: () => 'NOW()' })
      .where('usuario_id = :usuarioId', { usuarioId })
      .andWhere('revoked_at IS NULL')
      .execute();
  }

  async setActivoAllAsignaciones(
    usuarioId: number,
    activo: boolean,
  ): Promise<void> {
    await this.usuarioSucursalRepository
      .createQueryBuilder()
      .update()
      .set({ activo })
      .where('usuario_id = :usuarioId', { usuarioId })
      .execute();
  }
}
