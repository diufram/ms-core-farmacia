import { randomUUID } from 'crypto';
import { Cliente } from '../entities/cliente.entity';
import { Producto } from '../entities/producto.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { Usuario } from '../entities/usuario.entity';
import { Venta } from '../entities/venta.entity';
import { VentaDetalle } from '../entities/venta-detalle.entity';
import { Seed } from './base.seed';
import { seedDataSource } from './seed-data-source';

type VentaSeed = {
  sucursalSlug: string;
  clienteCodigo?: string;
  diasAtras: number;
  detalles: { productoCodigo: string; cantidad: number; precioUnitario?: number }[];
};

const VENTAS: VentaSeed[] = [
  {
    sucursalSlug: 'sucursal-central',
    clienteCodigo: 'CLI-0001',
    diasAtras: 5,
    detalles: [
      { productoCodigo: 'PROD-001', cantidad: 2 },
      { productoCodigo: 'PROD-003', cantidad: 1 },
    ],
  },
  {
    sucursalSlug: 'sucursal-central',
    diasAtras: 4,
    detalles: [{ productoCodigo: 'PROD-002', cantidad: 1 }],
  },
  {
    sucursalSlug: 'sucursal-central',
    clienteCodigo: 'CLI-0002',
    diasAtras: 3,
    detalles: [
      { productoCodigo: 'PROD-001', cantidad: 3 },
      { productoCodigo: 'PROD-002', cantidad: 2 },
    ],
  },
  {
    sucursalSlug: 'sucursal-central',
    diasAtras: 1,
    detalles: [{ productoCodigo: 'PROD-003', cantidad: 2 }],
  },
  {
    sucursalSlug: 'sucursal-norte',
    diasAtras: 4,
    detalles: [
      { productoCodigo: 'PROD-001', cantidad: 5 },
      { productoCodigo: 'PROD-003', cantidad: 3 },
    ],
  },
  {
    sucursalSlug: 'sucursal-norte',
    clienteCodigo: 'CLI-1001',
    diasAtras: 2,
    detalles: [{ productoCodigo: 'PROD-002', cantidad: 4 }],
  },
  {
    sucursalSlug: 'sucursal-norte',
    diasAtras: 0,
    detalles: [
      { productoCodigo: 'PROD-001', cantidad: 1 },
      { productoCodigo: 'PROD-002', cantidad: 1 },
      { productoCodigo: 'PROD-003', cantidad: 1 },
    ],
  },
  {
    sucursalSlug: 'sucursal-norte',
    diasAtras: 0,
    detalles: [{ productoCodigo: 'PROD-003', cantidad: 1, precioUnitario: 11.5 }],
  },
];

export const ventasSeed: Seed = {
  order: 8,
  name: '008-ventas',
  run: async () => {
    const sucursalRepository = seedDataSource.getRepository(Sucursal);
    const usuarioRepository = seedDataSource.getRepository(Usuario);
    const clienteRepository = seedDataSource.getRepository(Cliente);
    const productoRepository = seedDataSource.getRepository(Producto);

    const superAdmin = await usuarioRepository.findOne({
      where: { nombre_usuario: 'superadmin' },
    });
    if (!superAdmin) {
      console.log('- Super admin no existe, seed de ventas omitido.');
      return;
    }

    const ventasCreadas: string[] = [];

    for (const item of VENTAS) {
      const sucursal = await sucursalRepository.findOne({
        where: { slug: item.sucursalSlug },
      });
      if (!sucursal) {
        console.log(`- Sucursal ${item.sucursalSlug} no existe, omitida.`);
        continue;
      }

      let cliente: Cliente | null = null;
      if (item.clienteCodigo) {
        cliente = await clienteRepository.findOne({
          where: { codigo_cliente: item.clienteCodigo, sucursal: { id: sucursal.id } },
          relations: ['sucursal'],
        });
        if (!cliente) {
          console.log(
            `- Cliente ${item.clienteCodigo} no existe en ${item.sucursalSlug}, omitido.`,
          );
          continue;
        }
      }

      const productos: Producto[] = [];
      let stockInsuficiente = false;
      for (const det of item.detalles) {
        const producto = await productoRepository.findOne({
          where: { codigo: det.productoCodigo, sucursal: { id: sucursal.id } },
          relations: ['sucursal'],
        });
        if (!producto) {
          console.log(
            `- Producto ${det.productoCodigo} no existe en ${item.sucursalSlug}, omitido.`,
          );
          stockInsuficiente = true;
          break;
        }
        if (producto.stock_actual < det.cantidad) {
          console.log(
            `- Stock insuficiente (${producto.stock_actual}) para ${det.productoCodigo} en ${item.sucursalSlug}, omitido.`,
          );
          stockInsuficiente = true;
          break;
        }
        productos.push(producto);
      }
      if (stockInsuficiente) continue;

      const total = item.detalles.reduce((acc, det) => {
        const producto = productos.find((p) => p.codigo === det.productoCodigo);
        if (!producto) return acc;
        const precio = det.precioUnitario ?? Number(producto.precio_venta);
        return acc + precio * det.cantidad;
      }, 0);

      const fechaVenta = new Date();
      fechaVenta.setDate(fechaVenta.getDate() - item.diasAtras);
      const fechaVentaStr = fechaVenta.toISOString().slice(0, 10);

      const numeroVenta = `V-${randomUUID()}`;

      await seedDataSource.transaction(async (manager) => {
        const venta = manager.create(Venta, {
          numero_venta: numeroVenta,
          fecha_venta: fechaVentaStr,
          total,
          sucursal,
          usuario: superAdmin,
          cliente,
        });
        const ventaGuardada = await manager.save(venta);

        for (const det of item.detalles) {
          const producto = productos.find((p) => p.codigo === det.productoCodigo);
          if (!producto) continue;
          const precio = det.precioUnitario ?? Number(producto.precio_venta);
          const detalle = manager.create(VentaDetalle, {
            venta: ventaGuardada,
            producto,
            cantidad: det.cantidad,
            precio_unitario: precio,
          });
          await manager.save(detalle);
          producto.stock_actual -= det.cantidad;
          await manager.save(Producto, producto);
        }

        ventasCreadas.push(numeroVenta);
      });
    }

    console.log(`- ${ventasCreadas.length} ventas creadas.`);
  },
};
