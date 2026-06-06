import { Field, Int, ObjectType } from '@nestjs/graphql';
import { RolGlobal } from '../../../database/entities/usuario.entity';
import { RolSucursal } from '../../../database/entities/usuario-sucursal.entity';

@ObjectType()
export class PersonaType {
  @Field(() => Int)
  id!: number;

  @Field()
  nombre!: string;

  @Field()
  apellido!: string;

  @Field(() => String, { nullable: true })
  celular?: string | null;
}

@ObjectType()
export class SucursalSimpleType {
  @Field(() => Int)
  id!: number;

  @Field()
  nombre!: string;
}

@ObjectType()
export class UsuarioSucursalAsignacionType {
  @Field(() => Int)
  id!: number;

  @Field(() => SucursalSimpleType)
  sucursal!: SucursalSimpleType;

  @Field()
  rol!: RolSucursal;

  @Field()
  activo!: boolean;
}

@ObjectType()
export class UsuarioType {
  @Field(() => Int)
  id!: number;

  @Field()
  nombre_usuario!: string;

  @Field()
  correo_electronico!: string;

  @Field()
  rol_global!: RolGlobal;

  @Field(() => PersonaType)
  persona!: PersonaType;

  @Field(() => [UsuarioSucursalAsignacionType])
  asignaciones!: UsuarioSucursalAsignacionType[];
}

@ObjectType()
export class UsuarioPayloadType {
  @Field(() => UsuarioType)
  usuario!: UsuarioType;

  @Field()
  message!: string;
}
