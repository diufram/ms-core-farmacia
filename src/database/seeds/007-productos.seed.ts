import { CategoriaProducto } from '../entities/categoria-producto.entity';
import { Producto } from '../entities/producto.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { Seed } from './base.seed';
import { seedDataSource } from './seed-data-source';

const PRODUCTOS_BASE = [
  {
    codigoBase: 'PROD',
    items: [
      {
        codigo: '001',
        nombre: 'Paracetamol 500mg',
        categoriaCodigoBase: 'MED',
        stock_actual: 200,
        precio_venta: 0.8,
      },
      {
        codigo: '002',
        nombre: 'Ibuprofeno 400mg',
        categoriaCodigoBase: 'MED',
        stock_actual: 150,
        precio_venta: 1.2,
      },
      {
        codigo: '003',
        nombre: 'Alcohol Antiseptico 70%',
        categoriaCodigoBase: 'INS',
        stock_actual: 80,
        precio_venta: 12,
      },
    ],
  },
];

export const productosSeed: Seed = {
  order: 7,
  name: '007-productos',
  run: async () => {
    const sucursalRepository = seedDataSource.getRepository(Sucursal);
    const categoriaRepository = seedDataSource.getRepository(CategoriaProducto);
    const productoRepository = seedDataSource.getRepository(Producto);

    const sucursales = await sucursalRepository.find();

    for (const sucursal of sucursales) {
      for (const grupo of PRODUCTOS_BASE) {
        for (const item of grupo.items) {
          const codigo = `${grupo.codigoBase}-${item.codigo}`;
          const existing = await productoRepository.findOne({
            where: { sucursal: { id: sucursal.id }, codigo },
          });
          if (existing) {
            continue;
          }

          const categoria = await categoriaRepository.findOne({
            where: {
              sucursal: { id: sucursal.id },
              codigo: `${item.categoriaCodigoBase}-${sucursal.slug}`,
            },
          });
          if (!categoria) {
            console.log(`- Categoria no encontrada para ${codigo} en ${sucursal.slug}, omitido.`);
            continue;
          }

          await productoRepository.save(
            productoRepository.create({
              sucursal,
              categoria,
              codigo,
              nombre: item.nombre,
              stock_actual: item.stock_actual,
              precio_venta: item.precio_venta,
            }),
          );
        }
      }

      console.log(`- Productos registrados para ${sucursal.slug}.`);
    }
  },
};
