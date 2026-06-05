import { CategoriaProducto } from '../entities/categoria-producto.entity';
import { Producto } from '../entities/producto.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { Seed } from './base.seed';
import { seedDataSource } from './seed-data-source';

const PRODUCTOS = [
  {
    codigo: 'PROD-001',
    nombre: 'Paracetamol 500mg',
    categoriaCodigoBase: 'MED',
    stock_actual: 200,
    precio_venta: 0.8,
  },
  {
    codigo: 'PROD-002',
    nombre: 'Ibuprofeno 400mg',
    categoriaCodigoBase: 'MED',
    stock_actual: 150,
    precio_venta: 1.2,
  },
  {
    codigo: 'PROD-003',
    nombre: 'Alcohol Antiseptico 70%',
    categoriaCodigoBase: 'INS',
    stock_actual: 80,
    precio_venta: 12,
  },
];

export const productosSeed: Seed = {
  order: 7,
  name: '007-productos',
  run: async () => {
    const sucursalRepository = seedDataSource.getRepository(Sucursal);
    const categoriaRepository = seedDataSource.getRepository(CategoriaProducto);
    const productoRepository = seedDataSource.getRepository(Producto);

    const sucursal = await sucursalRepository.findOne({ where: { slug: 'sucursal-central' } });
    if (!sucursal) {
      console.log('- No existe sucursal-central, seed de productos omitido.');
      return;
    }

    for (const item of PRODUCTOS) {
      const existing = await productoRepository.findOne({
        where: { sucursal: { id: sucursal.id }, codigo: item.codigo },
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
        console.log(`- Categoria no encontrada para ${item.codigo}, omitido.`);
        continue;
      }

      await productoRepository.save(
        productoRepository.create({
          sucursal,
          categoria,
          codigo: item.codigo,
          nombre: item.nombre,
          stock_actual: item.stock_actual,
          precio_venta: item.precio_venta,
        }),
      );
    }

    console.log('- Productos registrados en sucursal-central.');
  },
};
