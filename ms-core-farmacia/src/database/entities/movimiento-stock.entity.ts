import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Producto } from './producto.entity';
import { Usuario } from './usuario.entity';

export enum TipoMovimientoStock {
  ENTRADA = 'entrada',
  SALIDA = 'salida',
  AJUSTE = 'ajuste',
}

export enum OrigenMovimientoStock {
  VENTA = 'venta',
  COMPRA = 'compra',
  MANUAL = 'manual',
  INICIAL = 'inicial',
  DEVOLUCION = 'devolucion',
}

@Entity('movimientos_stock')
export class MovimientoStock extends BaseEntity {
  @ManyToOne(() => Producto, (producto) => producto.movimientos, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'producto_id' })
  producto!: Producto;

  @Column({ type: 'enum', enum: TipoMovimientoStock })
  tipo!: TipoMovimientoStock;

  @Column({ type: 'integer' })
  cantidad!: number;

  @Column({ type: 'integer' })
  stock_anterior!: number;

  @Column({ type: 'integer' })
  stock_nuevo!: number;

  @Column({ type: 'enum', enum: OrigenMovimientoStock, default: OrigenMovimientoStock.MANUAL })
  origen!: OrigenMovimientoStock;

  @Column({ type: 'varchar', length: 255, nullable: true })
  motivo?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referencia?: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuario_id' })
  usuario?: Usuario | null;
}
