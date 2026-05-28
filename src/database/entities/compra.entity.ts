import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Sucursal } from './sucursal.entity';
import { CompraDetalle } from './compra-detalle.entity';
import { Proveedor } from './proveedor.entity';
import { Usuario } from './usuario.entity';

export enum EstadoCompra {
  BORRADOR = 'borrador',
  REGISTRADA = 'registrada',
  ANULADA = 'anulada',
}

@Entity('compras')
@Unique('UQ_compras_sucursal_numero', ['sucursal', 'numero_compra'])
export class Compra extends BaseEntity {
  @ManyToOne(() => Sucursal, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal!: Sucursal;

  @ManyToOne(() => Proveedor, { nullable: false, eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor!: Proveedor;

  @ManyToOne(() => Usuario, { nullable: false, eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @Column({ type: 'varchar', length: 40 })
  numero_compra!: string;

  @Column({ type: 'date' })
  fecha_compra!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  descuento_total!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total!: number;

  @Column({ type: 'enum', enum: EstadoCompra, default: EstadoCompra.REGISTRADA })
  estado!: EstadoCompra;

  @Column({ type: 'text', nullable: true })
  observacion?: string | null;

  @OneToMany(() => CompraDetalle, (detalle) => detalle.compra)
  detalles!: CompraDetalle[];
}
