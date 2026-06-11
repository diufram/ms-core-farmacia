import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Persona } from '../../database/entities/persona.entity';
import { Sucursal } from '../../database/entities/sucursal.entity';
import { Usuario } from '../../database/entities/usuario.entity';
import { UsuarioSucursal } from '../../database/entities/usuario-sucursal.entity';
import { SucursalesRepository } from './sucursales.repository';
import { SucursalesResolver } from './sucursales.resolver';
import { SucursalesService } from './sucursales.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sucursal, Persona, Usuario, UsuarioSucursal])],
  providers: [SucursalesService, SucursalesRepository, SucursalesResolver],
  exports: [SucursalesService],
})
export class SucursalesModule {}
