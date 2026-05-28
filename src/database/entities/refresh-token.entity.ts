import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Usuario } from './usuario.entity';

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
  @ManyToOne(() => Usuario, (usuario) => usuario.refresh_tokens, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @Column({ type: 'varchar', length: 255, unique: true })
  token_hash!: string;

  @Column({ type: 'timestamp' })
  expires_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  revoked_at!: Date | null;
}
