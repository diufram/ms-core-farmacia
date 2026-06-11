import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { DataSource } from 'typeorm';
import { Persona } from '../../database/entities/persona.entity';
import { Sucursal } from '../../database/entities/sucursal.entity';
import { Rol, Usuario } from '../../database/entities/usuario.entity';
import { UsuarioSucursal } from '../../database/entities/usuario-sucursal.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AssignSucursalDto } from './dto/assign-sucursal.dto';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { UsuarioFilters, UsuariosRepository } from './usuarios.repository';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly usuariosRepository: UsuariosRepository,
  ) {}

  async findAll(filters: UsuarioFilters) {
    const usuarios = await this.usuariosRepository.findAll(filters);
    return usuarios.map((u) => this.serializeUsuario(u));
  }

  async findOne(id: number) {
    const usuario = await this.usuariosRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    return this.serializeUsuario(usuario);
  }

  async create(dto: CreateUsuarioDto) {
    const usernameExists = await this.usuariosRepository.findByUsername(dto.nombre_usuario);
    if (usernameExists) {
      throw new ConflictException('Ya existe un usuario con ese nombre de usuario.');
    }

    const emailExists = await this.usuariosRepository.findByEmail(dto.correo_electronico);
    if (emailExists) {
      throw new ConflictException('Ya existe un usuario con ese correo electrónico.');
    }

    const targetRol = dto.rol ?? Rol.ADMIN;
    if (targetRol === Rol.ADMIN && (!dto.sucursales || dto.sucursales.length === 0)) {
      throw new ConflictException('Un administrador debe estar asignado a al menos una sucursal.');
    }
    if (targetRol === Rol.CLIENTE && dto.sucursales && dto.sucursales.length > 0) {
      throw new ConflictException('Un cliente no debe estar asignado a sucursales.');
    }

    if (dto.sucursales?.length) {
      const sucursalIds = dto.sucursales.map((s) => s.sucursalId);
      const duplicates = sucursalIds.filter((id, i) => sucursalIds.indexOf(id) !== i);
      if (duplicates.length) {
        throw new ConflictException(
          'No se puede asignar el mismo usuario dos veces a la misma sucursal.',
        );
      }
    }

    const passwordHash = await hash(dto.contrasena, 10);

    const created = await this.dataSource.transaction(async (manager) => {
      const personaRepo = manager.getRepository(Persona);
      const usuarioRepo = manager.getRepository(Usuario);
      const usuarioSucursalRepo = manager.getRepository(UsuarioSucursal);

      const persona = personaRepo.create({
        nombre: dto.persona.nombre,
        apellido: dto.persona.apellido,
        celular: dto.persona.celular ?? null,
      });
      const personaGuardada = await personaRepo.save(persona);

      const usuario = usuarioRepo.create({
        nombre_usuario: dto.nombre_usuario,
        correo_electronico: dto.correo_electronico.toLowerCase(),
        contrasena: passwordHash,
        rol: dto.rol ?? Rol.ADMIN,
        persona: personaGuardada,
      });
      const usuarioGuardado = await usuarioRepo.save(usuario);

      if (dto.sucursales?.length) {
        for (const asignacion of dto.sucursales) {
          const sucursal = await manager
            .getRepository(Sucursal)
            .findOne({ where: { id: asignacion.sucursalId } });
          if (!sucursal) {
            throw new NotFoundException(`Sucursal con id ${asignacion.sucursalId} no encontrada.`);
          }
          const nuevaAsignacion = usuarioSucursalRepo.create({
            usuario: usuarioGuardado,
            sucursal,
            activo: true,
          });
          await usuarioSucursalRepo.save(nuevaAsignacion);
        }
      }

      return usuarioGuardado;
    });

    const reloaded = await this.usuariosRepository.findById(created.id);
    return {
      usuario: this.serializeUsuario(reloaded!),
      message: 'Usuario creado correctamente.',
    };
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    const usuario = await this.usuariosRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (dto.nombre_usuario && dto.nombre_usuario !== usuario.nombre_usuario) {
      const existing = await this.usuariosRepository.findByUsername(dto.nombre_usuario, id);
      if (existing) {
        throw new ConflictException('Ya existe un usuario con ese nombre de usuario.');
      }
    }

    if (
      dto.correo_electronico &&
      dto.correo_electronico.toLowerCase() !== usuario.correo_electronico.toLowerCase()
    ) {
      const existing = await this.usuariosRepository.findByEmail(dto.correo_electronico, id);
      if (existing) {
        throw new ConflictException('Ya existe un usuario con ese correo electrónico.');
      }
    }

    if (dto.persona?.nombre !== undefined) {
      usuario.persona.nombre = dto.persona.nombre;
    }
    if (dto.persona?.apellido !== undefined) {
      usuario.persona.apellido = dto.persona.apellido;
    }
    if (dto.persona?.celular !== undefined) {
      usuario.persona.celular = dto.persona.celular;
    }
    if (dto.nombre_usuario !== undefined) {
      usuario.nombre_usuario = dto.nombre_usuario;
    }
    if (dto.correo_electronico !== undefined) {
      usuario.correo_electronico = dto.correo_electronico.toLowerCase();
    }
    if (dto.rol !== undefined) {
      usuario.rol = dto.rol;
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Persona).save(usuario.persona);
      await manager.getRepository(Usuario).save(usuario);
      if (dto.activo !== undefined) {
        await manager
          .getRepository(UsuarioSucursal)
          .createQueryBuilder()
          .update()
          .set({ activo: dto.activo })
          .where('usuario_id = :id', { id })
          .execute();
      }
    });

    const reloaded = await this.usuariosRepository.findById(id);
    return {
      usuario: this.serializeUsuario(reloaded!),
      message: 'Usuario actualizado correctamente.',
    };
  }

  async delete(id: number) {
    const usuario = await this.usuariosRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    await this.usuariosRepository.softDelete(id);
    await this.usuariosRepository.revokeRefreshTokens(id);
    return {
      message: 'Usuario eliminado correctamente.',
    };
  }

  async assignSucursal(usuarioId: number, dto: AssignSucursalDto) {
    const usuario = await this.usuariosRepository.findById(usuarioId);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    const sucursal = await this.usuariosRepository.findSucursalById(dto.sucursalId);
    if (!sucursal) {
      throw new NotFoundException('Sucursal no encontrada.');
    }

    const existing = await this.usuariosRepository.findAsignacion(usuarioId, dto.sucursalId);
    if (existing) {
      if (!existing.activo) {
        existing.activo = true;
        await this.usuariosRepository.saveAsignacion(existing);
      } else {
        throw new ConflictException('El usuario ya está asignado a esa sucursal.');
      }
    } else {
      const asignacion = this.usuariosRepository.createAsignacion({
        usuario: { id: usuarioId } as Usuario,
        sucursal,
        activo: true,
      });
      await this.usuariosRepository.saveAsignacion(asignacion);
    }

    const reloaded = await this.usuariosRepository.findById(usuarioId);
    return {
      usuario: this.serializeUsuario(reloaded!),
      message: 'Sucursal asignada correctamente.',
    };
  }

  async unassignSucursal(usuarioId: number, sucursalId: number) {
    const asignacion = await this.usuariosRepository.findAsignacion(usuarioId, sucursalId);
    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada.');
    }
    await this.usuariosRepository.unassignAsignacion(asignacion);
    const reloaded = await this.usuariosRepository.findById(usuarioId);
    return {
      usuario: this.serializeUsuario(reloaded!),
      message: 'Sucursal removida del usuario.',
    };
  }

  async adminResetPassword(id: number, dto: AdminResetPasswordDto) {
    const usuario = await this.usuariosRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    usuario.contrasena = await hash(dto.nueva_contrasena, 10);
    await this.usuariosRepository.saveUsuario(usuario);
    await this.usuariosRepository.revokeRefreshTokens(id);
    return {
      message: 'Contraseña restablecida. El usuario deberá iniciar sesión nuevamente.',
    };
  }

  private serializeUsuario(usuario: Usuario) {
    return {
      id: usuario.id,
      nombre_usuario: usuario.nombre_usuario,
      correo_electronico: usuario.correo_electronico,
      rol: usuario.rol,
      persona: {
        id: usuario.persona?.id ?? 0,
        nombre: usuario.persona?.nombre ?? '',
        apellido: usuario.persona?.apellido ?? '',
        celular: usuario.persona?.celular ?? null,
      },
      asignaciones:
        usuario.sucursales
          ?.filter((us) => us.sucursal)
          .map((us) => ({
            id: us.id,
            sucursal: {
              id: us.sucursal.id,
              nombre: us.sucursal.nombre,
            },
            activo: us.activo,
          })) ?? [],
    };
  }
}
