import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Sucursal } from './sucursal.entity';
import { Producto } from './producto.entity';

@Entity('laboratorios')
export class Laboratorio extends BaseEntity {
  @ManyToOne(() => Sucursal, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal!: Sucursal;

  @Column({ type: 'varchar', length: 140 })
  nombre!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono?: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  correo_electronico?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion?: string | null;

  @Column({ default: true })
  activo!: boolean;

  @OneToMany(() => Producto, (producto) => producto.laboratorio)
  productos!: Producto[];
}
