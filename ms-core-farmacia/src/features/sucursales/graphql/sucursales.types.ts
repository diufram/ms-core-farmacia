import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SucursalType {
  @Field(() => Int)
  id!: number;

  @Field()
  nombre!: string;

  @Field()
  slug!: string;

  @Field(() => String, { nullable: true })
  telefono?: string | null;

  @Field()
  direccion!: string;

  @Field(() => String, { nullable: true })
  ciudad?: string | null;

  @Field(() => Float, { nullable: true })
  latitud?: number | null;

  @Field(() => Float, { nullable: true })
  longitud?: number | null;

  @Field(() => String, { nullable: true })
  logo?: string | null;
}

@ObjectType()
export class SucursalAdminType {
  @Field(() => Int)
  id!: number;

  @Field()
  nombre_usuario!: string;

  @Field()
  correo_electronico!: string;
}

@ObjectType()
export class CreateSucursalPayloadType {
  @Field(() => SucursalType)
  sucursal!: SucursalType;

  @Field(() => SucursalAdminType)
  admin!: SucursalAdminType;

  @Field()
  message!: string;
}

@ObjectType()
export class SucursalPayloadType {
  @Field(() => SucursalType)
  sucursal!: SucursalType;

  @Field()
  message!: string;
}
