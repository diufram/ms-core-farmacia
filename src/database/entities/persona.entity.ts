import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Cliente } from './cliente.entity';
import { Usuario } from './usuario.entity';

@Entity('personas')
export class Persona extends BaseEntity {
  @Column({ type: 'varchar', length: 120 })
  nombre!: string;

  @Column({ type: 'varchar', length: 120 })
  apellido!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  celular?: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  correo_electronico?: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  tipo_documento?: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  numero_documento?: string | null;

  @Column({ type: 'date', nullable: true })
  fecha_nacimiento?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  sexo?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion?: string | null;

  @OneToOne(() => Usuario, (usuario) => usuario.persona)
  usuario?: Usuario;

  @OneToMany(() => Cliente, (cliente) => cliente.persona)
  clientes!: Cliente[];
}
