import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { DataSource, Repository } from 'typeorm';
import { Persona } from '../../database/entities/persona.entity';
import { Sucursal } from '../../database/entities/sucursal.entity';
import { Rol, Usuario } from '../../database/entities/usuario.entity';
import { UsuarioSucursal } from '../../database/entities/usuario-sucursal.entity';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { SucursalesRepository } from './sucursales.repository';

@Injectable()
export class SucursalesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly sucursalesRepository: SucursalesRepository,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async findAll() {
    const sucursales = await this.sucursalesRepository.findAll();
    return sucursales.map((sucursal) => this.serializeSucursal(sucursal));
  }

  async findOne(id: number) {
    const sucursal = await this.sucursalesRepository.findById(id);
    if (!sucursal) {
      throw new NotFoundException('Sucursal no encontrada.');
    }

    return this.serializeSucursal(sucursal);
  }

  async create(dto: CreateSucursalDto) {
    const slug = this.buildSlug(dto.nombre);
    const existing = await this.sucursalesRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictException('Ya existe una sucursal con ese nombre.');
    }

    const existingEmail = await this.usuarioRepository.findOne({
      where: { correo_electronico: dto.correo_admin.toLowerCase() },
    });
    if (existingEmail) {
      throw new ConflictException(
        'El correo del administrador ya esta registrado.',
      );
    }

    const existingUsername = await this.usuarioRepository.findOne({
      where: { nombre_usuario: dto.nombre_usuario_admin },
    });
    if (existingUsername) {
      throw new ConflictException(
        'El nombre de usuario del administrador ya esta en uso.',
      );
    }

    const passwordHash = await hash(dto.contrasena_admin, 10);

    const result = await this.dataSource.transaction(async (manager) => {
      const sucursal = manager.create(Sucursal, {
        nombre: dto.nombre,
        slug,
        telefono: dto.telefono,
        direccion: dto.direccion,
        ciudad: dto.ciudad,
        latitud: dto.latitud,
        longitud: dto.longitud,
      });
      const sucursalGuardada = await manager.save(sucursal);

      const personaAdmin = manager.create(Persona, {
        nombre: dto.nombre_admin,
        apellido: dto.apellido_admin,
        celular: dto.celular_admin,
      });
      const personaGuardada = await manager.save(personaAdmin);

      const admin = manager.create(Usuario, {
        nombre_usuario: dto.nombre_usuario_admin,
        correo_electronico: dto.correo_admin.toLowerCase(),
        contrasena: passwordHash,
        rol: Rol.ADMIN,
        persona: personaGuardada,
      });
      const adminGuardado = await manager.save(admin);

      const usuarioSucursal = manager.create(UsuarioSucursal, {
        usuario: adminGuardado,
        sucursal: sucursalGuardada,
      });
      await manager.save(usuarioSucursal);

      return { sucursal: sucursalGuardada, admin: adminGuardado };
    });

    return {
      sucursal: this.serializeSucursal(result.sucursal),
      admin: {
        id: result.admin.id,
        nombre_usuario: result.admin.nombre_usuario,
        correo_electronico: result.admin.correo_electronico,
        rol: Rol.ADMIN,
      },
      message: 'Sucursal creada correctamente con su usuario administrador.',
    };
  }

  private serializeSucursal(sucursal: Sucursal) {
    return {
      id: sucursal.id,
      nombre: sucursal.nombre,
      slug: sucursal.slug,
      telefono: sucursal.telefono,
      direccion: sucursal.direccion,
      ciudad: sucursal.ciudad,
      latitud: sucursal.latitud,
      longitud: sucursal.longitud,
      logo: sucursal.logo,
      created_at: sucursal.createdAt,
      updated_at: sucursal.updatedAt,
    };
  }

  private buildSlug(nombre: string): string {
    return nombre
      .normalize('NFD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  async update(id: number, dto: UpdateSucursalDto) {
    const sucursal = await this.sucursalesRepository.findById(id);
    if (!sucursal) {
      throw new NotFoundException('Sucursal no encontrada.');
    }

    if (dto.nombre && dto.nombre !== sucursal.nombre) {
      const slug = this.buildSlug(dto.nombre);
      if (slug !== sucursal.slug) {
        const existing = await this.sucursalesRepository.findBySlug(slug);
        if (existing && existing.id !== id) {
          throw new ConflictException(
            'Ya existe una sucursal con ese nombre.',
          );
        }
        sucursal.slug = slug;
      }
    }

    if (dto.nombre !== undefined) sucursal.nombre = dto.nombre;
    if (dto.telefono !== undefined) sucursal.telefono = dto.telefono;
    if (dto.direccion !== undefined) sucursal.direccion = dto.direccion;
    if (dto.ciudad !== undefined) sucursal.ciudad = dto.ciudad;
    if (dto.latitud !== undefined) sucursal.latitud = dto.latitud;
    if (dto.longitud !== undefined) sucursal.longitud = dto.longitud;
    if (dto.logo !== undefined) sucursal.logo = dto.logo;

    const saved = await this.dataSource.manager.save(sucursal);
    return {
      sucursal: this.serializeSucursal(saved),
      message: 'Sucursal actualizada correctamente.',
    };
  }

  async delete(id: number) {
    const sucursal = await this.sucursalesRepository.findById(id);
    if (!sucursal) {
      throw new NotFoundException('Sucursal no encontrada.');
    }
    const snapshot = this.serializeSucursal(sucursal);
    await this.sucursalesRepository.softDelete(id);
    return {
      sucursal: snapshot,
      message: 'Sucursal eliminada correctamente.',
    };
  }
}
