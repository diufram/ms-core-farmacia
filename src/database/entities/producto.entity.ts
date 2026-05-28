import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { CategoriaProducto } from './categoria-producto.entity';
import { Sucursal } from './sucursal.entity';
import { Laboratorio } from './laboratorio.entity';

export enum TipoProducto {
  MEDICAMENTO = 'medicamento',
  INSUMO = 'insumo',
  OTRO = 'otro',
}

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

  @ManyToOne(() => Laboratorio, (laboratorio) => laboratorio.productos, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'laboratorio_id' })
  laboratorio?: Laboratorio | null;

  @Column({ type: 'varchar', length: 60 })
  codigo!: string;

  @Column({ type: 'varchar', length: 180 })
  nombre!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  principio_activo?: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  presentacion?: string | null;

  @Column({ type: 'enum', enum: TipoProducto, default: TipoProducto.MEDICAMENTO })
  tipo!: TipoProducto;

  @Column({ default: false })
  requiere_receta!: boolean;

  @Column({ type: 'integer', default: 0 })
  stock_actual!: number;

  @Column({ type: 'integer', default: 0 })
  stock_minimo!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  precio_venta!: number;

  @Column({ default: true })
  activo!: boolean;
}
