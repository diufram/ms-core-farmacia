import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Persona } from '../../database/entities/persona.entity';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { Sucursal } from '../../database/entities/sucursal.entity';
import { Usuario } from '../../database/entities/usuario.entity';
import { UsuarioSucursal } from '../../database/entities/usuario-sucursal.entity';
import { UsuariosRepository } from './usuarios.repository';
import { UsuariosResolver } from './usuarios.resolver';
import { UsuariosService } from './usuarios.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Persona,
      UsuarioSucursal,
      Sucursal,
      RefreshToken,
    ]),
  ],
  providers: [UsuariosService, UsuariosRepository, UsuariosResolver],
})
export class UsuariosModule {}
