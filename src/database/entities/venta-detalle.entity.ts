import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Producto } from './producto.entity';
import { Venta } from './venta.entity';

@Entity('venta_detalles')
export class VentaDetalle extends BaseEntity {
  @ManyToOne(() => Venta, (venta) => venta.detalles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'venta_id' })
  venta!: Venta;

  @ManyToOne(() => Producto, { nullable: false, eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'producto_id' })
  producto!: Producto;

  @Column({ type: 'integer' })
  cantidad!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  precio_unitario!: number;
}
