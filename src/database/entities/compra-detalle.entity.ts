import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Compra } from './compra.entity';
import { Lote } from './lote.entity';
import { Producto } from './producto.entity';

@Entity('compra_detalles')
export class CompraDetalle extends BaseEntity {
  @ManyToOne(() => Compra, (compra) => compra.detalles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'compra_id' })
  compra!: Compra;

  @ManyToOne(() => Producto, { nullable: false, eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'producto_id' })
  producto!: Producto;

  @ManyToOne(() => Lote, { nullable: false, eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'lote_id' })
  lote!: Lote;

  @Column({ type: 'integer' })
  cantidad!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  costo_unitario!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  subtotal!: number;
}
