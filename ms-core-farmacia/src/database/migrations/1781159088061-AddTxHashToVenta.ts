import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTxHashToVenta1781159088061 implements MigrationInterface {
    name = 'AddTxHashToVenta1781159088061'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ventas" ADD "tx_hash" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ventas" DROP COLUMN "tx_hash"`);
    }

}
