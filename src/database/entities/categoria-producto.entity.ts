import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Sucursal } from './sucursal.entity';
import { Producto } from './producto.entity';

@Entity('categorias_producto')
export class CategoriaProducto extends BaseEntity {
  @ManyToOne(() => Sucursal, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal!: Sucursal;

  @Column({ type: 'varchar', length: 120 })
  nombre!: string;

  @Column({ type: 'varchar', length: 160 })
  codigo!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string | null;

  @Column({ default: true })
  activo!: boolean;

  @OneToMany(() => Producto, (producto) => producto.categoria)
  productos!: Producto[];
}
