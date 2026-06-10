import { Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Usuario } from './usuario.entity';

@Entity('personas')
export class Persona extends BaseEntity {
  @Column({ type: 'varchar', length: 120 })
  nombre!: string;

  @Column({ type: 'varchar', length: 120 })
  apellido!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  celular?: string | null;

  @OneToOne(() => Usuario, (usuario) => usuario.persona)
  usuario?: Usuario;
}
