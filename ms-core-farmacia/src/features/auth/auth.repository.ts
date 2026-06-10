import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { Usuario, Rol } from '../../database/entities/usuario.entity';
import { UsuarioSucursal } from '../../database/entities/usuario-sucursal.entity';
import { Persona } from '../../database/entities/persona.entity';

@Injectable()
export class AuthRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(UsuarioSucursal)
    private readonly usuarioSucursalRepository: Repository<UsuarioSucursal>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
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

  async crearUsuarioConPersona(
    nombre: string,
    apellido: string,
    celular: string | undefined,
    correo: string,
    nombre_usuario: string,
    contrasenaHash: string,
  ): Promise<Usuario> {
    return await this.dataSource.transaction(async (manager) => {
      const persona = manager.create(Persona, {
        nombre,
        apellido,
        celular: celular || null,
      });
      await manager.save(persona);

      const usuario = manager.create(Usuario, {
        correo_electronico: correo.toLowerCase(),
        nombre_usuario,
        contrasena: contrasenaHash,
        rol: Rol.ADMIN,
        persona,
      });
      return await manager.save(usuario);
    });
  }

  async actualizarRolUsuario(usuarioId: number, nuevoRol: Rol): Promise<void> {
    await this.usuarioRepository.update(usuarioId, { rol: nuevoRol });
  }
}
