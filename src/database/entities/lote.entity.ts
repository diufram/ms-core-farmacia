import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Sucursal } from './sucursal.entity';
import { InventarioMovimiento } from './inventario-movimiento.entity';
import { Producto } from './producto.entity';

@Entity('lotes')
@Unique('UQ_lotes_producto_numero', ['producto', 'numero_lote'])
export class Lote extends BaseEntity {
  @ManyToOne(() => Sucursal, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal!: Sucursal;

  @ManyToOne(() => Producto, (producto) => producto.lotes, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'producto_id' })
  producto!: Producto;

  @Column({ type: 'varchar', length: 80 })
  numero_lote!: string;

  @Column({ type: 'date' })
  fecha_vencimiento!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  costo_compra!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  precio_venta!: number;

  @Column({ type: 'integer', default: 0 })
  stock_actual!: number;

  @Column({ type: 'integer', default: 0 })
  stock_minimo!: number;

  @Column({ default: true })
  activo!: boolean;

  @OneToMany(() => InventarioMovimiento, (movimiento) => movimiento.lote)
  movimientos!: InventarioMovimiento[];
}
