import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../../database/entities/cliente.entity';
import { Persona } from '../../database/entities/persona.entity';

@Injectable()
export class ClientesRepository {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
  ) {}

  findAll(sucursalId?: number): Promise<Cliente[]> {
    const where = sucursalId ? { sucursal: { id: sucursalId } } : {};
    return this.clienteRepository.find({
      where,
      order: { codigo_cliente: 'ASC' },
      relations: ['sucursal', 'persona'],
    });
  }

  findById(id: number): Promise<Cliente | null> {
    return this.clienteRepository.findOne({
      where: { id },
      relations: ['sucursal', 'persona'],
    });
  }

  findByCodigoAndSucursal(
    codigo: string,
    sucursalId: number,
    excludeId?: number,
  ): Promise<Cliente | null> {
    const qb = this.clienteRepository
      .createQueryBuilder('c')
      .where('c.codigo_cliente = :codigo', { codigo })
      .andWhere('c.sucursal_id = :sucursalId', { sucursalId });
    if (excludeId) {
      qb.andWhere('c.id != :excludeId', { excludeId });
    }
    return qb.getOne();
  }

  createCliente(data: Partial<Cliente>): Cliente {
    return this.clienteRepository.create(data);
  }

  createPersona(data: Partial<Persona>): Persona {
    return this.personaRepository.create(data);
  }

  async savePersona(persona: Persona): Promise<Persona> {
    return this.personaRepository.save(persona);
  }

  async saveCliente(cliente: Cliente): Promise<Cliente> {
    return this.clienteRepository.save(cliente);
  }

  async softDelete(id: number): Promise<void> {
    await this.clienteRepository.softDelete(id);
  }
}
