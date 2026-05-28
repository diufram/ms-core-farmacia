import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Cliente } from './cliente.entity';
import { UsuarioSucursal } from './usuario-sucursal.entity';

export enum EstadoSucursal {
  ACTIVA = 'activa',
  INACTIVA = 'inactiva',
}

@Entity('sucursales')
export class Sucursal extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ type: 'varchar', length: 160, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono?: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  correo_electronico?: string | null;

  @Column({ type: 'varchar', length: 255 })
  direccion!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ciudad?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  departamento?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pais?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referencia?: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
  latitud?: number | null;

  @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
  longitud?: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo?: string | null;

  @Column({ type: 'text', nullable: true })
  descripcion?: string | null;

  @Column({ type: 'enum', enum: EstadoSucursal, default: EstadoSucursal.ACTIVA })
  estado!: EstadoSucursal;

  @OneToMany(() => UsuarioSucursal, (usuarioSucursal) => usuarioSucursal.sucursal)
  usuarios_sucursal!: UsuarioSucursal[];

  @OneToMany(() => Cliente, (cliente) => cliente.sucursal)
  clientes!: Cliente[];
}
