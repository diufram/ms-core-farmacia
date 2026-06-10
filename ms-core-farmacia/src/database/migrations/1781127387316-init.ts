import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1781127387316 implements MigrationInterface {
    name = 'Init1781127387316'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "personas" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "nombre" character varying(120) NOT NULL, "apellido" character varying(120) NOT NULL, "celular" character varying(20), CONSTRAINT "PK_714aa5d028f8f3e6645e971cecd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "token_hash" character varying(255) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "revoked_at" TIMESTAMP, "usuario_id" integer NOT NULL, CONSTRAINT "UQ_a7838d2ba25be1342091b6695f1" UNIQUE ("token_hash"), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."usuarios_rol_enum" AS ENUM('super_admin', 'admin', 'cliente')`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "nombre_usuario" character varying(60) NOT NULL, "correo_electronico" character varying(150) NOT NULL, "contrasena" character varying(255) NOT NULL, "rol" "public"."usuarios_rol_enum" NOT NULL DEFAULT 'admin', "persona_id" integer NOT NULL, CONSTRAINT "UQ_1a7a36f3dffef210b4c0ba5c6c0" UNIQUE ("nombre_usuario"), CONSTRAINT "UQ_e871b7157e4b74290df9baa9c93" UNIQUE ("correo_electronico"), CONSTRAINT "REL_899199fd151861c079720cc508" UNIQUE ("persona_id"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usuarios_sucursal" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "activo" boolean NOT NULL DEFAULT true, "usuario_id" integer NOT NULL, "sucursal_id" integer NOT NULL, CONSTRAINT "UQ_usuario_sucursal" UNIQUE ("usuario_id", "sucursal_id"), CONSTRAINT "PK_7719925fa8ab656620a0f394777" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sucursales" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "nombre" character varying(150) NOT NULL, "slug" character varying(160) NOT NULL, "telefono" character varying(20), "direccion" character varying(255) NOT NULL, "ciudad" character varying(100), "latitud" numeric(10,7), "longitud" numeric(10,7), "logo" character varying(255), CONSTRAINT "UQ_c9ff10677e0effcf887ae6499a1" UNIQUE ("slug"), CONSTRAINT "PK_c2232960c9e458db5b18d35eeba" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categorias_producto" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "nombre" character varying(120) NOT NULL, "codigo" character varying(160) NOT NULL, "sucursal_id" integer NOT NULL, CONSTRAINT "PK_0821d2a56229a0bb8186dab675b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."movimientos_stock_tipo_enum" AS ENUM('entrada', 'salida', 'ajuste')`);
        await queryRunner.query(`CREATE TYPE "public"."movimientos_stock_origen_enum" AS ENUM('venta', 'compra', 'manual', 'inicial', 'devolucion')`);
        await queryRunner.query(`CREATE TABLE "movimientos_stock" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "tipo" "public"."movimientos_stock_tipo_enum" NOT NULL, "cantidad" integer NOT NULL, "stock_anterior" integer NOT NULL, "stock_nuevo" integer NOT NULL, "origen" "public"."movimientos_stock_origen_enum" NOT NULL DEFAULT 'manual', "motivo" character varying(255), "referencia" character varying(100), "producto_id" integer NOT NULL, "usuario_id" integer, CONSTRAINT "PK_11359dd02b7e2b4f69b30e5ee2d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "productos" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "codigo" character varying(60) NOT NULL, "nombre" character varying(180) NOT NULL, "stock_actual" integer NOT NULL DEFAULT '0', "stock_minimo" integer NOT NULL DEFAULT '0', "precio_venta" numeric(10,2) NOT NULL DEFAULT '0', "sucursal_id" integer NOT NULL, "categoria_id" integer NOT NULL, CONSTRAINT "UQ_productos_sucursal_codigo" UNIQUE ("sucursal_id", "codigo"), CONSTRAINT "PK_04f604609a0949a7f3b43400766" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "venta_detalles" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "cantidad" integer NOT NULL, "precio_unitario" numeric(10,2) NOT NULL, "venta_id" integer NOT NULL, "producto_id" integer NOT NULL, CONSTRAINT "PK_505b25e384908bdf1f67bf3c669" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ventas" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "numero_venta" character varying(40) NOT NULL, "fecha_venta" date NOT NULL, "total" numeric(12,2) NOT NULL DEFAULT '0', "estado" character varying(20) NOT NULL DEFAULT 'PENDIENTE', "cliente_walk_in" boolean NOT NULL DEFAULT false, "cliente_nombre" character varying(120), "cliente_celular" character varying(20), "cliente_codigo" character varying(60), "sucursal_id" integer NOT NULL, "usuario_id" integer NOT NULL, CONSTRAINT "UQ_ventas_sucursal_numero" UNIQUE ("sucursal_id", "numero_venta"), CONSTRAINT "PK_b8b73abe8561829c019531d9a2e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_c8349fdadc1bc791125bdd8c855" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_899199fd151861c079720cc508f" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuarios_sucursal" ADD CONSTRAINT "FK_b455910d5a8ff78ed34b8eae98c" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuarios_sucursal" ADD CONSTRAINT "FK_b13d161124fd90027e5202ae1a6" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categorias_producto" ADD CONSTRAINT "FK_9ac0e40d84a30ca4be87f109ffd" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movimientos_stock" ADD CONSTRAINT "FK_af7ee6d27a6567d20176abc4bf7" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movimientos_stock" ADD CONSTRAINT "FK_312f4dff4a1640e1682a61dbb57" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "productos" ADD CONSTRAINT "FK_65f8d9b1e2bf86529509b8698d6" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "productos" ADD CONSTRAINT "FK_5aaee6054b643e7c778477193a3" FOREIGN KEY ("categoria_id") REFERENCES "categorias_producto"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "venta_detalles" ADD CONSTRAINT "FK_4edde3f0f455374c9d44eb6dbc7" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "venta_detalles" ADD CONSTRAINT "FK_9671a1f1ceb22743f5136de907e" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ventas" ADD CONSTRAINT "FK_3cbcca0e21a79d4b2b2fcb7c273" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ventas" ADD CONSTRAINT "FK_5c564fe8d2b5182a37211405827" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ventas" DROP CONSTRAINT "FK_5c564fe8d2b5182a37211405827"`);
        await queryRunner.query(`ALTER TABLE "ventas" DROP CONSTRAINT "FK_3cbcca0e21a79d4b2b2fcb7c273"`);
        await queryRunner.query(`ALTER TABLE "venta_detalles" DROP CONSTRAINT "FK_9671a1f1ceb22743f5136de907e"`);
        await queryRunner.query(`ALTER TABLE "venta_detalles" DROP CONSTRAINT "FK_4edde3f0f455374c9d44eb6dbc7"`);
        await queryRunner.query(`ALTER TABLE "productos" DROP CONSTRAINT "FK_5aaee6054b643e7c778477193a3"`);
        await queryRunner.query(`ALTER TABLE "productos" DROP CONSTRAINT "FK_65f8d9b1e2bf86529509b8698d6"`);
        await queryRunner.query(`ALTER TABLE "movimientos_stock" DROP CONSTRAINT "FK_312f4dff4a1640e1682a61dbb57"`);
        await queryRunner.query(`ALTER TABLE "movimientos_stock" DROP CONSTRAINT "FK_af7ee6d27a6567d20176abc4bf7"`);
        await queryRunner.query(`ALTER TABLE "categorias_producto" DROP CONSTRAINT "FK_9ac0e40d84a30ca4be87f109ffd"`);
        await queryRunner.query(`ALTER TABLE "usuarios_sucursal" DROP CONSTRAINT "FK_b13d161124fd90027e5202ae1a6"`);
        await queryRunner.query(`ALTER TABLE "usuarios_sucursal" DROP CONSTRAINT "FK_b455910d5a8ff78ed34b8eae98c"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_899199fd151861c079720cc508f"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_c8349fdadc1bc791125bdd8c855"`);
        await queryRunner.query(`DROP TABLE "ventas"`);
        await queryRunner.query(`DROP TABLE "venta_detalles"`);
        await queryRunner.query(`DROP TABLE "productos"`);
        await queryRunner.query(`DROP TABLE "movimientos_stock"`);
        await queryRunner.query(`DROP TYPE "public"."movimientos_stock_origen_enum"`);
        await queryRunner.query(`DROP TYPE "public"."movimientos_stock_tipo_enum"`);
        await queryRunner.query(`DROP TABLE "categorias_producto"`);
        await queryRunner.query(`DROP TABLE "sucursales"`);
        await queryRunner.query(`DROP TABLE "usuarios_sucursal"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TYPE "public"."usuarios_rol_enum"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE "personas"`);
    }

}
