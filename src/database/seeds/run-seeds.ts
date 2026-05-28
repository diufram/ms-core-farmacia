import { adminUserSeed } from './admin-user.seed';
import { Seed } from './base.seed';

const seeds: Seed[] = [adminUserSeed];

async function runSeeds() {
    console.log('🚀 Iniciando ejecución de seeds...\n');

    for (const seed of seeds.sort((a, b) => a.order - b.order)) {
        console.log(`📦 Ejecutando seed: ${seed.name}`);
        try {
            await seed.run();
            console.log(`✅ Seed "${seed.name}" completado\n`);
        } catch (error) {
            console.error(`❌ Error en seed "${seed.name}":`, error);
            throw error;
        }
    }

    console.log('✨ Todos los seeds se ejecutaron correctamente');
}

runSeeds().catch((err) => {
    console.error('❌ Error durante la ejecución de seeds:', err);
    process.exit(1);
});
