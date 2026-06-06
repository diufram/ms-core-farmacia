import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { CategoriaProducto } from './categoria-producto.entity';
import { MovimientoStock } from './movimiento-stock.entity';
import { Sucursal } from './sucursal.entity';

@Entity('productos')
@Unique('UQ_productos_sucursal_codigo', ['sucursal', 'codigo'])
export class Producto extends BaseEntity {
  @ManyToOne(() => Sucursal, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal!: Sucursal;

  @ManyToOne(() => CategoriaProducto, (categoria) => categoria.productos, {
    nullable: false,
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoria_id' })
  categoria!: CategoriaProducto;

  @Column({ type: 'varchar', length: 60 })
  codigo!: string;

  @Column({ type: 'varchar', length: 180 })
  nombre!: string;

  @Column({ type: 'integer', default: 0 })
  stock_actual!: number;

  @Column({ type: 'integer', default: 0 })
  stock_minimo!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  precio_venta!: number;

  @OneToMany(() => MovimientoStock, (mov) => mov.producto)
  movimientos!: MovimientoStock[];
}
