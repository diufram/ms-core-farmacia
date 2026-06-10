import { MigrationInterface, QueryRunner } from 'typeorm';

export class VentasSnapshotFields1781110000000 implements MigrationInterface {
    name = 'VentasSnapshotFields1781110000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "ventas" ADD COLUMN "cliente_walk_in" boolean NOT NULL DEFAULT false`,
        );
        await queryRunner.query(
            `ALTER TABLE "ventas" ADD COLUMN "cliente_nombre" varchar(120)`,
        );
        await queryRunner.query(
            `ALTER TABLE "ventas" ADD COLUMN "cliente_celular" varchar(20)`,
        );
        await queryRunner.query(
            `ALTER TABLE "ventas" ADD COLUMN "cliente_codigo" varchar(60)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "ventas" DROP COLUMN "cliente_codigo"`,
        );
        await queryRunner.query(
            `ALTER TABLE "ventas" DROP COLUMN "cliente_celular"`,
        );
        await queryRunner.query(
            `ALTER TABLE "ventas" DROP COLUMN "cliente_nombre"`,
        );
        await queryRunner.query(
            `ALTER TABLE "ventas" DROP COLUMN "cliente_walk_in"`,
        );
    }
}
