import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenDispositivo } from '../../database/entities/token-dispositivo.entity';

@Injectable()
export class NotificationsRepository {
  constructor(
    @InjectRepository(TokenDispositivo)
    private readonly tokenDispositivoRepository: Repository<TokenDispositivo>,
  ) {}

  async buscarPorToken(token: string): Promise<TokenDispositivo | null> {
    return this.tokenDispositivoRepository.findOne({
      where: { token },
      relations: ['usuario'],
    });
  }

  async obtenerTokensDeUsuario(usuarioId: number): Promise<TokenDispositivo[]> {
    return this.tokenDispositivoRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: ['usuario'],
      order: { createdAt: 'DESC' },
    });
  }

  async registrar(usuarioId: number, token: string): Promise<TokenDispositivo> {
    const existente = await this.buscarPorToken(token);
    if (existente) {
      if (existente.usuario.id === usuarioId) {
        return existente;
      }
      existente.usuario = { id: usuarioId } as any;
      return this.tokenDispositivoRepository.save(existente);
    }
    const nuevo = this.tokenDispositivoRepository.create({
      token,
      usuario: { id: usuarioId },
    });
    return this.tokenDispositivoRepository.save(nuevo);
  }

  async eliminarTodosDeUsuario(usuarioId: number): Promise<void> {
    await this.tokenDispositivoRepository.delete({ usuario: { id: usuarioId } });
  }
}
