import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Sucursal } from './sucursal.entity';
import { Usuario } from './usuario.entity';

@Entity('usuarios_sucursal')
@Unique('UQ_usuario_sucursal', ['usuario', 'sucursal'])
export class UsuarioSucursal extends BaseEntity {
  @ManyToOne(() => Usuario, (usuario) => usuario.sucursales, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.usuarios_sucursal, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal!: Sucursal;

  @Column({ default: true })
  activo!: boolean;
}
