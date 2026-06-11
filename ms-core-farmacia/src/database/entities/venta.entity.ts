import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Sucursal } from './sucursal.entity';
import { Usuario } from './usuario.entity';
import { VentaDetalle } from './venta-detalle.entity';

@Entity('ventas')
@Unique('UQ_ventas_sucursal_numero', ['sucursal', 'numero_venta'])
export class Venta extends BaseEntity {
  @ManyToOne(() => Sucursal, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal!: Sucursal;

  @ManyToOne(() => Usuario, {
    nullable: false,
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @Column({ type: 'varchar', length: 40 })
  numero_venta!: string;

  @Column({ type: 'date' })
  fecha_venta!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total!: number;

  @Column({ type: 'varchar', length: 20, default: 'PENDIENTE' })
  estado!: string;

  @Column({ type: 'boolean', default: false })
  cliente_walk_in!: boolean;

  @Column({ type: 'varchar', length: 120, nullable: true })
  cliente_nombre?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cliente_celular?: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  cliente_codigo?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tx_hash?: string | null;

  @OneToMany(() => VentaDetalle, (detalle) => detalle.venta)
  detalles!: VentaDetalle[];
}
