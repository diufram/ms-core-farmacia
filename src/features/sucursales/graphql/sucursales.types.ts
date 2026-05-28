import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SucursalType {
  @Field(() => Int)
  id!: number;

  @Field()
  nombre!: string;

  @Field()
  slug!: string;

  @Field({ nullable: true })
  telefono?: string | null;

  @Field({ nullable: true })
  correo_electronico?: string | null;

  @Field()
  direccion!: string;

  @Field({ nullable: true })
  ciudad?: string | null;

  @Field({ nullable: true })
  departamento?: string | null;

  @Field({ nullable: true })
  pais?: string | null;

  @Field({ nullable: true })
  referencia?: string | null;

  @Field(() => Float, { nullable: true })
  latitud?: number | null;

  @Field(() => Float, { nullable: true })
  longitud?: number | null;

  @Field({ nullable: true })
  descripcion?: string | null;

  @Field()
  estado!: string;
}

@ObjectType()
export class SucursalAdminType {
  @Field(() => Int)
  id!: number;

  @Field()
  nombre_usuario!: string;

  @Field()
  correo_electronico!: string;

  @Field()
  rol!: string;
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
