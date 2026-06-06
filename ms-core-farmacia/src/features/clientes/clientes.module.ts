import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from '../../database/entities/cliente.entity';
import { Persona } from '../../database/entities/persona.entity';
import { ClientesRepository } from './clientes.repository';
import { ClientesResolver } from './clientes.resolver';
import { ClientesService } from './clientes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Persona])],
  providers: [ClientesService, ClientesRepository, ClientesResolver],
})
export class ClientesModule {}
