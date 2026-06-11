import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Persona } from '../../database/entities/persona.entity';
import { Usuario } from '../../database/entities/usuario.entity';

@Injectable()
export class ProfileRepository {
  constructor(
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async findPersonaByUsuarioId(usuarioId: number): Promise<Persona | null> {
    return this.personaRepository.findOne({
      where: { usuario: { id: usuarioId } },
      relations: ['usuario'],
    });
  }

  async findUsuarioById(id: number): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { id },
      relations: ['persona', 'sucursales', 'sucursales.sucursal'],
    });
  }

  async updateUsername(usuarioId: number, username: string): Promise<Usuario> {
    await this.usuarioRepository.update(usuarioId, {
      nombre_usuario: username,
    });
    const usuario = await this.findUsuarioById(usuarioId);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async isUsernameTaken(username: string, excludeUserId?: number): Promise<boolean> {
    const query = this.usuarioRepository
      .createQueryBuilder('u')
      .where('LOWER(u.nombre_usuario) = LOWER(:username)', { username });
    if (excludeUserId) {
      query.andWhere('u.id != :excludeUserId', { excludeUserId });
    }
    const count = await query.getCount();
    return count > 0;
  }

  async updatePassword(usuarioId: number, passwordHash: string): Promise<void> {
    await this.usuarioRepository.update(usuarioId, {
      contrasena: passwordHash,
    });
  }
}
