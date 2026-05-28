import { Laboratorio } from '../entities/laboratorio.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { Seed } from './base.seed';
import { seedDataSource } from './seed-data-source';

const LABORATORIOS = [
  { nombre: 'Laboratorio Andino', telefono: '73000001', correo: 'andino@labs.local' },
  { nombre: 'Farmalife', telefono: '73000002', correo: 'farmalife@labs.local' },
  { nombre: 'BioSalud', telefono: '73000003', correo: 'biosalud@labs.local' },
];

export const laboratoriosSeed: Seed = {
  order: 5,
  name: '005-laboratorios',
  run: async () => {
    const sucursalRepository = seedDataSource.getRepository(Sucursal);
    const laboratorioRepository = seedDataSource.getRepository(Laboratorio);
    const sucursales = await sucursalRepository.find();

    for (const sucursal of sucursales) {
      for (const item of LABORATORIOS) {
        const existing = await laboratorioRepository.findOne({
          where: { sucursal: { id: sucursal.id }, nombre: item.nombre },
        });
        if (existing) {
          continue;
        }

        await laboratorioRepository.save(
          laboratorioRepository.create({
            sucursal,
            nombre: item.nombre,
            telefono: item.telefono,
            correo_electronico: item.correo,
            direccion: sucursal.direccion,
            activo: true,
          }),
        );
      }
      console.log(`- Laboratorios registrados para ${sucursal.slug}.`);
    }
  },
};
