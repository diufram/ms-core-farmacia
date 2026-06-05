import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { Sucursal } from '../../database/entities/sucursal.entity';
import { Usuario } from '../../database/entities/usuario.entity';
import { UsuarioSucursal } from '../../database/entities/usuario-sucursal.entity';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(UsuarioSucursal)
    private readonly usuarioSucursalRepository: Repository<UsuarioSucursal>,
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
  ) {}

  async buscarUsuarioPorCorreo(correo: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { correo_electronico: correo },
      relations: ['persona', 'sucursales', 'sucursales.sucursal'],
    });
  }

  async buscarUsuarioPorId(id: number): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { id },
      relations: ['persona', 'sucursales', 'sucursales.sucursal'],
    });
  }

  async buscarSucursalPorId(id: number): Promise<Sucursal | null> {
    return this.sucursalRepository.findOne({ where: { id } });
  }

  async buscarRelacionUsuarioSucursal(
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

  async guardarRefreshToken(
    usuarioId: number,
    tokenHash: string,
    expiraEn: Date,
  ): Promise<RefreshToken> {
    const refreshToken = this.refreshTokenRepository.create({
      usuario: { id: usuarioId },
      token_hash: tokenHash,
      expires_at: expiraEn,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  async buscarRefreshTokenValido(
    usuarioId: number,
    tokenHash: string,
  ): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: {
        usuario: { id: usuarioId },
        token_hash: tokenHash,
        revoked_at: IsNull(),
      },
      relations: ['usuario'],
    });
  }

  async revocarRefreshToken(id: number): Promise<void> {
    await this.refreshTokenRepository.update(id, {
      revoked_at: new Date(),
    });
  }
}
