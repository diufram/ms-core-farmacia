import { CategoriaProducto } from '../entities/categoria-producto.entity';
import { Laboratorio } from '../entities/laboratorio.entity';
import { Producto, TipoProducto } from '../entities/producto.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { Seed } from './base.seed';
import { seedDataSource } from './seed-data-source';

const PRODUCTOS = [
  {
    codigo: 'PROD-001',
    nombre: 'Paracetamol 500mg',
    principio_activo: 'Paracetamol',
    presentacion: 'Caja x 100 tabletas',
    categoriaCodigoBase: 'MED',
    tipo: TipoProducto.MEDICAMENTO,
    requiere_receta: false,
    stock_actual: 200,
    stock_minimo: 30,
    precio_venta: 0.8,
  },
  {
    codigo: 'PROD-002',
    nombre: 'Ibuprofeno 400mg',
    principio_activo: 'Ibuprofeno',
    presentacion: 'Caja x 50 tabletas',
    categoriaCodigoBase: 'MED',
    tipo: TipoProducto.MEDICAMENTO,
    requiere_receta: false,
    stock_actual: 150,
    stock_minimo: 20,
    precio_venta: 1.2,
  },
  {
    codigo: 'PROD-003',
    nombre: 'Alcohol Antiseptico 70%',
    principio_activo: null,
    presentacion: 'Frasco 500 ml',
    categoriaCodigoBase: 'INS',
    tipo: TipoProducto.INSUMO,
    requiere_receta: false,
    stock_actual: 80,
    stock_minimo: 10,
    precio_venta: 12,
  },
];

export const productosSeed: Seed = {
  order: 7,
  name: '007-productos',
  run: async () => {
    const sucursalRepository = seedDataSource.getRepository(Sucursal);
    const categoriaRepository = seedDataSource.getRepository(CategoriaProducto);
    const laboratorioRepository = seedDataSource.getRepository(Laboratorio);
    const productoRepository = seedDataSource.getRepository(Producto);

    const sucursal = await sucursalRepository.findOne({ where: { slug: 'sucursal-central' } });
    if (!sucursal) {
      console.log('- No existe sucursal-central, seed de productos omitido.');
      return;
    }

    const laboratorio = await laboratorioRepository.findOne({
      where: { sucursal: { id: sucursal.id } },
      order: { id: 'ASC' },
    });

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
          laboratorio: laboratorio ?? null,
          codigo: item.codigo,
          nombre: item.nombre,
          principio_activo: item.principio_activo,
          presentacion: item.presentacion,
          tipo: item.tipo,
          requiere_receta: item.requiere_receta,
          stock_actual: item.stock_actual,
          stock_minimo: item.stock_minimo,
          precio_venta: item.precio_venta,
          activo: true,
        }),
      );
    }

    console.log('- Productos registrados en sucursal-central.');
  },
};
