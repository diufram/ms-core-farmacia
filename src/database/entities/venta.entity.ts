import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Cliente } from './cliente.entity';
import { Sucursal } from './sucursal.entity';
import { Usuario } from './usuario.entity';
import { VentaDetalle } from './venta-detalle.entity';

export enum EstadoVenta {
  BORRADOR = 'borrador',
  CONFIRMADA = 'confirmada',
  ANULADA = 'anulada',
}

export enum MetodoPagoVenta {
  EFECTIVO = 'efectivo',
  TARJETA = 'tarjeta',
  TRANSFERENCIA = 'transferencia',
  QR = 'qr',
}

@Entity('ventas')
@Unique('UQ_ventas_sucursal_numero', ['sucursal', 'numero_venta'])
export class Venta extends BaseEntity {
  @ManyToOne(() => Sucursal, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal!: Sucursal;

  @ManyToOne(() => Usuario, { nullable: false, eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @ManyToOne(() => Cliente, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cliente_id' })
  cliente?: Cliente | null;

  @Column({ type: 'varchar', length: 40 })
  numero_venta!: string;

  @Column({ type: 'date' })
  fecha_venta!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  descuento_total!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total!: number;

  @Column({ type: 'enum', enum: EstadoVenta, default: EstadoVenta.CONFIRMADA })
  estado!: EstadoVenta;

  @Column({ type: 'text', nullable: true })
  observacion?: string | null;

  @Column({ type: 'enum', enum: MetodoPagoVenta, default: MetodoPagoVenta.EFECTIVO })
  metodo_pago!: MetodoPagoVenta;

  @OneToMany(() => VentaDetalle, (detalle) => detalle.venta)
  detalles!: VentaDetalle[];
}
