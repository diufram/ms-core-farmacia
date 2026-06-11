import { CategoriaProducto } from '../entities/categoria-producto.entity';
import { Producto } from '../entities/producto.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { Seed } from './base.seed';
import { seedDataSource } from './seed-data-source';

type ProductoItem = {
  codigo: string;
  nombre: string;
  categoriaCodigoBase: 'MED' | 'VEN' | 'INS';
  stock_actual: number;
  precio_venta: number;
};

function generarProductos(): ProductoItem[] {
  const productos: ProductoItem[] = [];
  let seq = 1;

  // === MEDICAMENTOS (20 items) ===
  const medicamentos = [
    { nombre: 'Paracetamol 500mg x 20', precio: 0.8, stock: 200 },
    { nombre: 'Ibuprofeno 400mg x 20', precio: 1.2, stock: 180 },
    { nombre: 'Aspirina 100mg x 30', precio: 0.9, stock: 160 },
    { nombre: 'Diclofenac 50mg x 20', precio: 1.5, stock: 140 },
    { nombre: 'Naproxeno 550mg x 10', precio: 2.5, stock: 120 },
    { nombre: 'Amoxicilina 500mg x 12', precio: 4.5, stock: 100 },
    { nombre: 'Azitromicina 500mg x 3', precio: 6.0, stock: 90 },
    { nombre: 'Ciprofloxacino 500mg x 10', precio: 5.5, stock: 80 },
    { nombre: 'Metronidazol 500mg x 20', precio: 3.0, stock: 70 },
    { nombre: 'Ibuprofeno Suspension 100mg/5ml', precio: 4.2, stock: 60 },
    { nombre: 'Loratadina 10mg x 10', precio: 1.8, stock: 110 },
    { nombre: 'Cetirizina 10mg x 10', precio: 2.0, stock: 100 },
    { nombre: 'Dipirona 500mg x 10', precio: 1.0, stock: 150 },
    { nombre: 'Paracetamol Suspension 120mg/5ml', precio: 3.5, stock: 90 },
    { nombre: 'Omeprazol 20mg x 14', precio: 3.2, stock: 85 },
    { nombre: 'Losartan 50mg x 30', precio: 4.8, stock: 70 },
    { nombre: 'Enalapril 10mg x 30', precio: 3.5, stock: 65 },
    { nombre: 'Metformina 850mg x 30', precio: 4.0, stock: 90 },
    { nombre: 'Atorvastatina 20mg x 30', precio: 7.5, stock: 50 },
    { nombre: 'Salbutamol Inhalador 100mcg', precio: 12.0, stock: 40 },
  ];
  medicamentos.forEach((m) => {
    productos.push({
      codigo: String(seq).padStart(3, '0'),
      nombre: m.nombre,
      categoriaCodigoBase: 'MED',
      stock_actual: m.stock,
      precio_venta: m.precio,
    });
    seq++;
  });

  // === VENTA LIBRE (20 items) ===
  const ventaLibre = [
    { nombre: 'Vitamina C 500mg x 30', precio: 5.5, stock: 100 },
    { nombre: 'Multivitaminico x 60', precio: 12.0, stock: 80 },
    { nombre: 'Vitamina D3 1000UI x 30', precio: 7.0, stock: 90 },
    { nombre: 'Omega 3 1000mg x 60', precio: 15.0, stock: 60 },
    { nombre: 'Calcio + Magnesio x 60', precio: 9.0, stock: 70 },
    { nombre: 'Vitamina B12 1000mcg x 30', precio: 6.5, stock: 80 },
    { nombre: 'Hierro + Acido Folico x 30', precio: 5.0, stock: 70 },
    { nombre: 'Colageno Hidrolizado 300g', precio: 22.0, stock: 35 },
    { nombre: 'Probioticos 10 Billion x 30', precio: 14.0, stock: 50 },
    { nombre: 'Magnesio Citrato 400mg x 60', precio: 8.5, stock: 60 },
    { nombre: 'Zinc 50mg x 60', precio: 6.0, stock: 70 },
    { nombre: 'Vitamina E 400UI x 30', precio: 8.0, stock: 50 },
    { nombre: 'Complejo B x 60', precio: 7.5, stock: 65 },
    { nombre: 'Glucosamina + Condroitina x 60', precio: 18.0, stock: 40 },
    { nombre: 'Lecitina de Soja 1200mg x 100', precio: 11.0, stock: 55 },
    { nombre: 'Cartílago de Tiburon 500mg x 100', precio: 16.0, stock: 30 },
    { nombre: 'Ginseng 500mg x 60', precio: 13.0, stock: 45 },
    { nombre: 'Te Verde Extracto x 90', precio: 9.5, stock: 60 },
    { nombre: 'Melatonina 3mg x 60', precio: 8.5, stock: 50 },
    { nombre: 'Coenzima Q10 100mg x 30', precio: 19.0, stock: 35 },
  ];
  ventaLibre.forEach((v) => {
    productos.push({
      codigo: String(seq).padStart(3, '0'),
      nombre: v.nombre,
      categoriaCodigoBase: 'VEN',
      stock_actual: v.stock,
      precio_venta: v.precio,
    });
    seq++;
  });

  // === INSUMOS (20 items) ===
  const insumos = [
    { nombre: 'Alcohol Antiseptico 70% 500ml', precio: 12.0, stock: 80 },
    { nombre: 'Alcohol en Gel 250ml', precio: 8.0, stock: 100 },
    { nombre: 'Agua Oxigenada 1L', precio: 5.5, stock: 90 },
    { nombre: 'Jeringas Descartables 5ml x 100', precio: 18.0, stock: 50 },
    { nombre: 'Agujas Descartables 21G x 100', precio: 12.0, stock: 55 },
    { nombre: 'Gasas Esteriles 10x10cm x 100', precio: 15.0, stock: 60 },
    { nombre: 'Vendas Elasticas 10cm x 12', precio: 9.0, stock: 70 },
    { nombre: 'Cinta Adhesiva Medica 5cm', precio: 4.5, stock: 90 },
    { nombre: 'Termometro Digital', precio: 18.0, stock: 45 },
    { nombre: 'Tensiometro Digital de Brazo', precio: 95.0, stock: 15 },
    { nombre: 'Mascarillas Quirurgicas x 50', precio: 12.0, stock: 100 },
    { nombre: 'Guantes de Latex M x 100', precio: 22.0, stock: 60 },
    { nombre: 'Guantes de Nitrilo M x 100', precio: 28.0, stock: 55 },
    { nombre: 'Baja Lenguas Madera x 500', precio: 6.0, stock: 40 },
    { nombre: 'Algodon Hidrofilo 500g', precio: 11.0, stock: 50 },
    { nombre: 'Suero Fisiologico 0.9% 1L', precio: 7.0, stock: 70 },
    { nombre: 'Alcohol Iodado 1L', precio: 9.0, stock: 60 },
    { nombre: 'Curitas Adhesivas x 100', precio: 8.0, stock: 80 },
    { nombre: 'Tijeras Quirurgicas 14cm', precio: 22.0, stock: 25 },
    { nombre: 'Pinzas Anatomicas 14cm', precio: 18.0, stock: 25 },
  ];
  insumos.forEach((i) => {
    productos.push({
      codigo: String(seq).padStart(3, '0'),
      nombre: i.nombre,
      categoriaCodigoBase: 'INS',
      stock_actual: i.stock,
      precio_venta: i.precio,
    });
    seq++;
  });

  return productos;
}

export const productosSeed: Seed = {
  order: 7,
  name: '007-productos',
  run: async () => {
    const sucursalRepository = seedDataSource.getRepository(Sucursal);
    const categoriaRepository = seedDataSource.getRepository(CategoriaProducto);
    const productoRepository = seedDataSource.getRepository(Producto);

    const sucursales = await sucursalRepository.find();
    const productos = generarProductos();

    for (const sucursal of sucursales) {
      for (const item of productos) {
        const codigo = `PROD-${item.codigo}`;
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

      console.log(`- Productos registrados para ${sucursal.slug}.`);
    }
  },
};
