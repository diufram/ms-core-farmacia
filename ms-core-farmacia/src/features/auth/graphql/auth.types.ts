import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SucursalAuthType {
  @Field(() => Int)
  id!: number;

  @Field()
  nombre!: string;

  @Field()
  slug!: string;
}

@ObjectType()
export class UsuarioAuthType {
  @Field(() => Int)
  id!: number;

  @Field()
  nombre_usuario!: string;

  @Field()
  correo_electronico!: string;

  @Field()
  rol!: string;

  @Field(() => Int, { nullable: true })
  sucursal_id!: number | null;

  @Field(() => SucursalAuthType, { nullable: true })
  sucursal!: SucursalAuthType | null;
}

@ObjectType()
export class AuthPayloadType {
  @Field(() => UsuarioAuthType)
  usuario!: UsuarioAuthType;

  @Field({ nullable: true })
  access_token?: string;

  @Field({ nullable: true })
  refresh_token?: string;

  @Field()
  message!: string;
}

@ObjectType()
export class LogoutPayloadType {
  @Field()
  message!: string;
}

@ObjectType()
export class MePayloadType {
  @Field(() => UsuarioAuthType)
  usuario!: UsuarioAuthType;
}
