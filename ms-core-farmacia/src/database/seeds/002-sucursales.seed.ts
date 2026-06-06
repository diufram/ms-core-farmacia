import { Sucursal } from '../entities/sucursal.entity';
import { Seed } from './base.seed';
import { seedDataSource } from './seed-data-source';

const SUCURSALES = [
  {
    nombre: 'Sucursal Central',
    slug: 'sucursal-central',
    telefono: '70000001',
    direccion: 'Av. Principal #100',
    ciudad: 'Santa Cruz',
  },
  {
    nombre: 'Sucursal Norte',
    slug: 'sucursal-norte',
    telefono: '70000002',
    direccion: 'Av. Norte #250',
    ciudad: 'Santa Cruz',
  },
];

export const sucursalesSeed: Seed = {
  order: 2,
  name: '002-sucursales',
  run: async () => {
    const repository = seedDataSource.getRepository(Sucursal);

    for (const item of SUCURSALES) {
      const existing = await repository.findOne({ where: { slug: item.slug } });
      if (existing) {
        console.log(`- Sucursal ${item.slug} ya existe, omitida.`);
        continue;
      }

      const sucursal = repository.create({ ...item });
      await repository.save(sucursal);
      console.log(`- Sucursal creada (${item.slug}).`);
    }
  },
};
