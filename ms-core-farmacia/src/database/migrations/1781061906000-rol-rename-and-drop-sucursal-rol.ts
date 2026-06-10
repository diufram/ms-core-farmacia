import { MigrationInterface, QueryRunner } from 'typeorm';

export class RolRenameAndDropSucursalRol1781061906000
    implements MigrationInterface
{
    name = 'RolRenameAndDropSucursalRol1781061906000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Replace the global role enum: drop old, create new with only super_admin/admin
        await queryRunner.query(
            `ALTER TYPE "public"."usuarios_rol_global_enum" RENAME TO "usuarios_rol_global_enum_old"`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."usuarios_rol_global_enum" AS ENUM('super_admin', 'admin')`,
        );

        // 2. Migrate column values: 'user' -> 'admin', keep 'super_admin' as is
        await queryRunner.query(
            `ALTER TABLE "usuarios" ALTER COLUMN "rol_global" DROP DEFAULT`,
        );
        await queryRunner.query(
            `ALTER TABLE "usuarios" ALTER COLUMN "rol_global" TYPE "public"."usuarios_rol_global_enum" USING (
                CASE WHEN "rol_global" = 'user' THEN 'admin'::"public"."usuarios_rol_global_enum"
                     ELSE "rol_global"::text::"public"."usuarios_rol_global_enum"
                END
            )`,
        );
        await queryRunner.query(
            `ALTER TABLE "usuarios" ALTER COLUMN "rol_global" SET DEFAULT 'admin'`,
        );

        // 3. Drop the old enum
        await queryRunner.query(
            `DROP TYPE "public"."usuarios_rol_global_enum_old"`,
        );

        // 4. Drop the rol column from usuarios_sucursal
        await queryRunner.query(
            `ALTER TABLE "usuarios_sucursal" DROP COLUMN "rol"`,
        );
        await queryRunner.query(
            `DROP TYPE IF EXISTS "public"."usuarios_sucursal_rol_enum"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate the sucursal rol enum + column
        await queryRunner.query(
            `CREATE TYPE "public"."usuarios_sucursal_rol_enum" AS ENUM('admin')`,
        );
        await queryRunner.query(
            `ALTER TABLE "usuarios_sucursal" ADD COLUMN "rol" "public"."usuarios_sucursal_rol_enum" NOT NULL DEFAULT 'admin'`,
        );

        // Roll back the global rol enum
        await queryRunner.query(
            `ALTER TABLE "usuarios" ALTER COLUMN "rol_global" DROP DEFAULT`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."usuarios_rol_global_enum_old" AS ENUM('super_admin', 'user')`,
        );
        await queryRunner.query(
            `ALTER TABLE "usuarios" ALTER COLUMN "rol_global" TYPE "public"."usuarios_rol_global_enum_old" USING (
                CASE WHEN "rol_global" = 'admin' THEN 'user'::"public"."usuarios_rol_global_enum_old"
                     ELSE "rol_global"::text::"public"."usuarios_rol_global_enum_old"
                END
            )`,
        );
        await queryRunner.query(
            `DROP TYPE "public"."usuarios_rol_global_enum"`,
        );
        await queryRunner.query(
            `ALTER TYPE "public"."usuarios_rol_global_enum_old" RENAME TO "usuarios_rol_global_enum"`,
        );
        await queryRunner.query(
            `ALTER TABLE "usuarios" ALTER COLUMN "rol_global" SET DEFAULT 'user'`,
        );
    }
}
