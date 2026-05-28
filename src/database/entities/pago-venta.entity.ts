import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Usuario } from './usuario.entity';
import { Venta } from './venta.entity';

export enum MetodoPagoVenta {
  EFECTIVO = 'efectivo',
  TARJETA = 'tarjeta',
  TRANSFERENCIA = 'transferencia',
  QR = 'qr',
}

@Entity('pagos_venta')
export class PagoVenta extends BaseEntity {
  @ManyToOne(() => Venta, (venta) => venta.pagos, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'venta_id' })
  venta!: Venta;

  @ManyToOne(() => Usuario, { nullable: false, eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @Column({ type: 'enum', enum: MetodoPagoVenta })
  metodo!: MetodoPagoVenta;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monto!: number;

  @Column({ type: 'varchar', length: 80, nullable: true })
  referencia?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  fecha_pago?: Date | null;
}
