import { superAdminSeed } from './001-super-admin.seed';
import { sucursalesSeed } from './002-sucursales.seed';
import { usuariosAdministradoresSeed } from './003-usuarios-administradores.seed';
import { categoriasProductoSeed } from './004-categorias-producto.seed';
import { clientesSeed } from './006-clientes.seed';
import { productosSeed } from './007-productos.seed';
import { Seed } from './base.seed';
import { seedDataSource } from './seed-data-source';

const seeds: Seed[] = [
  superAdminSeed,
  sucursalesSeed,
  usuariosAdministradoresSeed,
  categoriasProductoSeed,
  clientesSeed,
  productosSeed,
];

async function runSeeds() {
    console.log('Iniciando ejecucion de seeds...\n');
    await seedDataSource.initialize();
    console.log('Conexion de seed activa.\n');

    for (const seed of seeds.sort((a, b) => a.order - b.order)) {
        console.log(`Ejecutando seed: ${seed.name}`);
        try {
            await seed.run();
            console.log(`Seed "${seed.name}" completado\n`);
        } catch (error) {
            console.error(`Error en seed "${seed.name}":`, error);
            throw error;
        }
    }

    await seedDataSource.destroy();
    console.log('Todos los seeds se ejecutaron correctamente');
}

runSeeds().catch((err) => {
    if (seedDataSource.isInitialized) {
        seedDataSource.destroy().catch(() => null);
    }
    console.error('Error durante la ejecucion de seeds:', err);
    process.exit(1);
});
