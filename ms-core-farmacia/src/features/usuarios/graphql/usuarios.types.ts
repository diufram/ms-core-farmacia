import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Rol } from '../../../database/entities/usuario.entity';

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
  rol!: Rol;

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
