"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const ventas_service_1 = require("./src/features/ventas/ventas.service");
const ventas_repository_1 = require("./src/features/ventas/ventas.repository");
const typeorm_1 = require("typeorm");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const ventasService = app.get(ventas_service_1.VentasService);
    const ventasRepository = app.get(ventas_repository_1.VentasRepository);
    const dataSource = app.get(typeorm_1.DataSource);
    const ventas = await ventasRepository.findAll({});
    const completedVenta = ventas.find(v => v.tx_hash);
    if (!completedVenta) {
        console.log('No completed sale with tx_hash found.');
        process.exit(0);
    }
    console.log(`Verifying sale: ${completedVenta.numero_venta} (ID: ${completedVenta.id})`);
    const { Rol } = require('./src/database/entities/usuario.entity');
    const result1 = await ventasService.verificarIntegridad(completedVenta.id, Rol.SUPER_ADMIN, null, 0);
    console.log('Result (Happy Path):', result1);
    console.log('\nAltering DB total...');
    await dataSource.query('UPDATE ventas SET total = 999.99 WHERE id = $1', [completedVenta.id]);
    try {
        const result2 = await ventasService.verificarIntegridad(completedVenta.id, Rol.SUPER_ADMIN, null, 0);
        console.log('Result (Tampered Path):', result2);
    }
    catch (e) {
        console.error(e);
    }
    console.log('\nReverting DB total...');
    await dataSource.query('UPDATE ventas SET total = $1 WHERE id = $2', [completedVenta.total, completedVenta.id]);
    await app.close();
}
bootstrap();
//# sourceMappingURL=test-verification.js.map