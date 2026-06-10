import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Persona } from './persona.entity';
import { RefreshToken } from './refresh-token.entity';
import { UsuarioSucursal } from './usuario-sucursal.entity';

export enum Rol {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  CLIENTE = 'cliente',
}

@Entity('usuarios')
export class Usuario extends BaseEntity {
  @Column({ type: 'varchar', length: 60, unique: true })
  nombre_usuario!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  correo_electronico!: string;

  @Column({ type: 'varchar', length: 255 })
  contrasena!: string;

  @Column({ type: 'enum', enum: Rol, default: Rol.ADMIN })
  rol!: Rol;

  @OneToOne(() => Persona, (persona) => persona.usuario, {
    nullable: false,
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'persona_id' })
  persona!: Persona;

  @OneToMany(
    () => UsuarioSucursal,
    (usuarioSucursal) => usuarioSucursal.usuario,
  )
  sucursales!: UsuarioSucursal[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.usuario)
  refresh_tokens!: RefreshToken[];
}
