import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Sucursal } from './sucursal.entity';
import { Lote } from './lote.entity';
import { Usuario } from './usuario.entity';

export enum TipoMovimientoInventario {
  ENTRADA = 'entrada',
  SALIDA = 'salida',
  AJUSTE = 'ajuste',
  DEVOLUCION = 'devolucion',
  TRANSFERENCIA = 'transferencia',
}

@Entity('inventario_movimientos')
export class InventarioMovimiento extends BaseEntity {
  @ManyToOne(() => Sucursal, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal!: Sucursal;

  @ManyToOne(() => Lote, (lote) => lote.movimientos, {
    nullable: false,
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'lote_id' })
  lote!: Lote;

  @ManyToOne(() => Usuario, { nullable: false, eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @Column({
    type: 'enum',
    enum: TipoMovimientoInventario,
  })
  tipo!: TipoMovimientoInventario;

  @Column({ type: 'integer' })
  cantidad!: number;

  @Column({ type: 'integer' })
  stock_anterior!: number;

  @Column({ type: 'integer' })
  stock_resultante!: number;

  @Column({ type: 'varchar', length: 40, nullable: true })
  referencia_tipo?: string | null;

  @Column({ type: 'integer', nullable: true })
  referencia_id?: number | null;

  @Column({ type: 'text', nullable: true })
  observacion?: string | null;
}
