import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClienteRol1781105495000 implements MigrationInterface {
    name = 'AddClienteRol1781105495000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TYPE "public"."usuarios_rol_enum" RENAME TO "usuarios_rol_enum_old"`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."usuarios_rol_enum" AS ENUM('super_admin', 'admin', 'cliente')`,
        );
        await queryRunner.query(
            `ALTER TABLE "usuarios" ALTER COLUMN "rol" DROP DEFAULT`,
        );
        await queryRunner.query(
            `ALTER TABLE "usuarios" ALTER COLUMN "rol" TYPE "public"."usuarios_rol_enum" USING "rol"::text::"public"."usuarios_rol_enum"`,
        );
        await queryRunner.query(
            `ALTER TABLE "usuarios" ALTER COLUMN "rol" SET DEFAULT 'admin'`,
        );
        await queryRunner.query(
            `DROP TYPE "public"."usuarios_rol_enum_old"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "usuarios" ALTER COLUMN "rol" DROP DEFAULT`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."usuarios_rol_enum_old" AS ENUM('super_admin', 'admin')`,
        );
        await queryRunner.query(
            `ALTER TABLE "usuarios" ALTER COLUMN "rol" TYPE "public"."usuarios_rol_enum_old" USING "rol"::text::"public"."usuarios_rol_enum_old"`,
        );
        await queryRunner.query(
            `DROP TYPE "public"."usuarios_rol_enum"`,
        );
        await queryRunner.query(
            `ALTER TYPE "public"."usuarios_rol_enum_old" RENAME TO "usuarios_rol_enum"`,
        );
        await queryRunner.query(
            `ALTER TABLE "usuarios" ALTER COLUMN "rol" SET DEFAULT 'admin'`,
        );
    }
}
