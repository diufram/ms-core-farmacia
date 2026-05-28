import { CategoriaProducto } from '../entities/categoria-producto.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { Seed } from './base.seed';
import { seedDataSource } from './seed-data-source';

const CATEGORIAS = [
  { codigo: 'MED', nombre: 'Medicamentos', descripcion: 'Productos farmacologicos.' },
  { codigo: 'VEN', nombre: 'Venta Libre', descripcion: 'Productos de venta libre.' },
  { codigo: 'INS', nombre: 'Insumos', descripcion: 'Material e insumos de farmacia.' },
];

export const categoriasProductoSeed: Seed = {
  order: 4,
  name: '004-categorias-producto',
  run: async () => {
    const sucursalRepository = seedDataSource.getRepository(Sucursal);
    const categoriaRepository = seedDataSource.getRepository(CategoriaProducto);
    const sucursales = await sucursalRepository.find();

    for (const sucursal of sucursales) {
      for (const categoriaBase of CATEGORIAS) {
        const codigo = `${categoriaBase.codigo}-${sucursal.slug}`;
        const existing = await categoriaRepository.findOne({
          where: { sucursal: { id: sucursal.id }, codigo },
        });
        if (existing) {
          continue;
        }

        await categoriaRepository.save(
          categoriaRepository.create({
            sucursal,
            codigo,
            nombre: categoriaBase.nombre,
            descripcion: categoriaBase.descripcion,
            activo: true,
          }),
        );
      }

      console.log(`- Categorias registradas para ${sucursal.slug}.`);
    }
  },
};
