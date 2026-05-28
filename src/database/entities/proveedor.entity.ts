import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Sucursal } from './sucursal.entity';

@Entity('proveedores')
@Unique('UQ_proveedores_sucursal_nit', ['sucursal', 'nit'])
export class Proveedor extends BaseEntity {
  @ManyToOne(() => Sucursal, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal!: Sucursal;

  @Column({ type: 'varchar', length: 160 })
  nombre!: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  nit?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono?: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  correo_electronico?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion?: string | null;

  @Column({ default: true })
  activo!: boolean;
}
