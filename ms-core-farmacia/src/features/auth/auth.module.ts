import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Persona } from '../../database/entities/persona.entity';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { TokenDispositivo } from '../../database/entities/token-dispositivo.entity';
import { Usuario } from '../../database/entities/usuario.entity';
import { UsuarioSucursal } from '../../database/entities/usuario-sucursal.entity';
import { AuthRepository } from './auth.repository';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Usuario, Persona, RefreshToken, UsuarioSucursal, TokenDispositivo]),
    NotificationsModule,
  ],
  providers: [AuthService, AuthRepository, AuthResolver, JwtStrategy],
})
export class AuthModule {}
