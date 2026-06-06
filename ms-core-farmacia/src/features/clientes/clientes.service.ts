import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Cliente } from '../../database/entities/cliente.entity';
import { Persona } from '../../database/entities/persona.entity';
import { RolGlobal } from '../../database/entities/usuario.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ClientesRepository } from './clientes.repository';

@Injectable()
export class ClientesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly clientesRepository: ClientesRepository,
  ) {}

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
    const clientes = await this.clientesRepository.findAll(
      targetSucursalId ?? undefined,
    );
    return clientes.map((c) => this.serializeCliente(c));
  }

  async findOne(id: number, userRol: string, userSucursalId: number | null) {
    const cliente = await this.clientesRepository.findById(id);
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado.');
    }
    this.assertSucursalAccess(cliente, userRol, userSucursalId);
    return this.serializeCliente(cliente);
  }

  async create(
    dto: CreateClienteDto,
    userRol: string,
    userSucursalId: number | null,
  ) {
    this.assertCanUseSucursal(userRol, userSucursalId, dto.sucursalId);
    if (!dto.persona.nombre || !dto.persona.apellido) {
      throw new BadRequestException(
        'Nombre y apellido son obligatorios al crear un cliente.',
      );
    }
    const targetSucursalId = dto.sucursalId;

    const existing = await this.clientesRepository.findByCodigoAndSucursal(
      dto.codigo_cliente,
      targetSucursalId,
    );
    if (existing) {
      throw new ConflictException(
        'Ya existe un cliente con ese codigo en esta sucursal.',
      );
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const persona = manager.create(Persona, {
        nombre: dto.persona.nombre,
        apellido: dto.persona.apellido,
        celular: dto.persona.celular ?? null,
      });
      const personaGuardada = await manager.save(persona);

      const cliente = manager.create(Cliente, {
        codigo_cliente: dto.codigo_cliente,
        sucursal: { id: targetSucursalId } as Cliente['sucursal'],
        persona: personaGuardada,
      });
      const clienteGuardado = await manager.save(cliente);

      return { cliente: clienteGuardado, persona: personaGuardada };
    });

    const reloaded = await this.clientesRepository.findById(result.cliente.id);
    return {
      cliente: this.serializeCliente(reloaded!),
      message: 'Cliente creado correctamente.',
    };
  }

  async update(
    id: number,
    dto: UpdateClienteDto,
    userRol: string,
    userSucursalId: number | null,
  ) {
    const cliente = await this.clientesRepository.findById(id);
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado.');
    }
    this.assertSucursalAccess(cliente, userRol, userSucursalId);

    if (
      dto.codigo_cliente &&
      dto.codigo_cliente !== cliente.codigo_cliente
    ) {
      const existing = await this.clientesRepository.findByCodigoAndSucursal(
        dto.codigo_cliente,
        cliente.sucursal.id,
        id,
      );
      if (existing) {
        throw new ConflictException(
          'Ya existe un cliente con ese codigo en esta sucursal.',
        );
      }
      cliente.codigo_cliente = dto.codigo_cliente;
    }

    if (dto.persona) {
      if (dto.persona.nombre !== undefined) {
        cliente.persona.nombre = dto.persona.nombre;
      }
      if (dto.persona.apellido !== undefined) {
        cliente.persona.apellido = dto.persona.apellido;
      }
      if (dto.persona.celular !== undefined) {
        cliente.persona.celular = dto.persona.celular;
      }
      await this.clientesRepository.savePersona(cliente.persona);
    }

    const saved = await this.clientesRepository.saveCliente(cliente);
    return this.serializeCliente(saved);
  }

  async delete(id: number, userRol: string, userSucursalId: number | null) {
    const cliente = await this.clientesRepository.findById(id);
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado.');
    }
    this.assertSucursalAccess(cliente, userRol, userSucursalId);
    const snapshot = this.serializeCliente(cliente);
    await this.clientesRepository.softDelete(id);
    return {
      cliente: snapshot,
      message: 'Cliente eliminado correctamente.',
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

  private assertCanUseSucursal(
    userRol: string,
    userSucursalId: number | null,
    requestedSucursalId: number,
  ) {
    if (userRol === RolGlobal.SUPER_ADMIN) {
      return;
    }
    if (requestedSucursalId !== userSucursalId) {
      throw new ForbiddenException(
        'Solo puede operar sobre clientes de su propia sucursal.',
      );
    }
  }

  private assertSucursalAccess(
    cliente: Cliente,
    userRol: string,
    userSucursalId: number | null,
  ) {
    if (userRol === RolGlobal.SUPER_ADMIN) {
      return;
    }
    if (cliente.sucursal.id !== userSucursalId) {
      throw new ForbiddenException(
        'No tiene permiso para operar sobre clientes de otra sucursal.',
      );
    }
  }

  private serializeCliente(cliente: Cliente) {
    return {
      id: cliente.id,
      codigo_cliente: cliente.codigo_cliente,
      sucursal_id: cliente.sucursal?.id ?? null,
      persona: {
        id: cliente.persona.id,
        nombre: cliente.persona.nombre,
        apellido: cliente.persona.apellido,
        celular: cliente.persona.celular,
      },
    };
  }
}
