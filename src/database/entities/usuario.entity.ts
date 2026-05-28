import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Persona } from './persona.entity';
import { RefreshToken } from './refresh-token.entity';
import { UsuarioSucursal } from './usuario-sucursal.entity';

export enum RolGlobal {
  SUPER_ADMIN = 'super_admin',
  USER = 'user',
}

@Entity('usuarios')
export class Usuario extends BaseEntity {
  @Column({ type: 'varchar', length: 60, unique: true })
  nombre_usuario!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  correo_electronico!: string;

  @Column({ type: 'varchar', length: 255 })
  contrasena!: string;

  @Column({ type: 'enum', enum: RolGlobal, default: RolGlobal.USER })
  rol_global!: RolGlobal;

  @Column({ name: 'esta_verificado', default: false })
  esta_verificado!: boolean;

  @Column({ default: true })
  activo!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  foto?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  ultimo_acceso?: Date | null;

  @OneToOne(() => Persona, (persona) => persona.usuario, {
    nullable: false,
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'persona_id' })
  persona!: Persona;

  @OneToMany(() => UsuarioSucursal, (usuarioSucursal) => usuarioSucursal.usuario)
  sucursales!: UsuarioSucursal[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.usuario)
  refresh_tokens!: RefreshToken[];
}
