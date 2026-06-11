import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Usuario } from './usuario.entity';

@Entity('tokens_dispositivo')
export class TokenDispositivo extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  token!: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.tokens_dispositivo, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;
}
