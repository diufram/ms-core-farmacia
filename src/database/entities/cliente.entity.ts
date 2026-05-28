import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Sucursal } from './sucursal.entity';
import { Persona } from './persona.entity';

export enum EstadoCliente {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

@Entity('clientes')
@Unique('UQ_clientes_sucursal_persona', ['sucursal', 'persona'])
export class Cliente extends BaseEntity {
  @ManyToOne(() => Sucursal, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal!: Sucursal;

  @ManyToOne(() => Persona, { nullable: false, eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'persona_id' })
  persona!: Persona;

  @Column({ type: 'varchar', length: 60 })
  codigo_cliente!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono_secundario?: string | null;

  @Column({ type: 'text', nullable: true })
  observaciones?: string | null;

  @Column({ type: 'enum', enum: EstadoCliente, default: EstadoCliente.ACTIVO })
  estado!: EstadoCliente;
}
