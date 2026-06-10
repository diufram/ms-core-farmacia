import { randomUUID } from 'crypto';
import { Producto } from '../entities/producto.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { Usuario } from '../entities/usuario.entity';
import { Venta } from '../entities/venta.entity';
import { VentaDetalle } from '../entities/venta-detalle.entity';
import { Seed } from './base.seed';
import { seedDataSource } from './seed-data-source';

type EstadoVentaSeed = 'PENDIENTE' | 'CONFIRMADA' | 'RECHAZADA';

type VentaSeed = {
  sucursalSlug: string;
  diasAtras: number;
  estado: EstadoVentaSeed;
  walkIn?: {
    nombre: string;
    celular?: string;
    codigo?: string;
  };
  detalles: { productoCodigo: string; cantidad: number; precioUnitario?: number }[];
};

const VENTAS: VentaSeed[] = [
  // === Sucursal Central ===
  {
    sucursalSlug: 'sucursal-central',
    diasAtras: 10,
    estado: 'CONFIRMADA',
    walkIn: { nombre: 'Cliente Walk-in A', celular: '70000001', codigo: 'WI-A' },
    detalles: [
      { productoCodigo: 'PROD-001', cantidad: 2 },
      { productoCodigo: 'PROD-003', cantidad: 1 },
    ],
  },
  {
    sucursalSlug: 'sucursal-central',
    diasAtras: 7,
    estado: 'CONFIRMADA',
    detalles: [{ productoCodigo: 'PROD-002', cantidad: 1 }],
  },
  {
    sucursalSlug: 'sucursal-central',
    diasAtras: 5,
    estado: 'RECHAZADA',
    walkIn: { nombre: 'Cliente Walk-in B' },
    detalles: [
      { productoCodigo: 'PROD-001', cantidad: 3 },
      { productoCodigo: 'PROD-002', cantidad: 2 },
    ],
  },
  {
    sucursalSlug: 'sucursal-central',
    diasAtras: 1,
    estado: 'PENDIENTE',
    detalles: [{ productoCodigo: 'PROD-003', cantidad: 2 }],
  },
  // === Sucursal Norte ===
  {
    sucursalSlug: 'sucursal-norte',
    diasAtras: 8,
    estado: 'CONFIRMADA',
    detalles: [
      { productoCodigo: 'PROD-001', cantidad: 5 },
      { productoCodigo: 'PROD-003', cantidad: 3 },
    ],
  },
  {
    sucursalSlug: 'sucursal-norte',
    diasAtras: 4,
    estado: 'RECHAZADA',
    walkIn: { nombre: 'Cliente Walk-in C', codigo: 'WI-C' },
    detalles: [{ productoCodigo: 'PROD-002', cantidad: 4 }],
  },
  {
    sucursalSlug: 'sucursal-norte',
    diasAtras: 2,
    estado: 'PENDIENTE',
    detalles: [
      { productoCodigo: 'PROD-001', cantidad: 1 },
      { productoCodigo: 'PROD-002', cantidad: 1 },
      { productoCodigo: 'PROD-003', cantidad: 1 },
    ],
  },
  // === Sucursal Sur ===
  {
    sucursalSlug: 'sucursal-sur',
    diasAtras: 6,
    estado: 'CONFIRMADA',
    walkIn: { nombre: 'Cliente Walk-in D', celular: '70000004', codigo: 'WI-D' },
    detalles: [
      { productoCodigo: 'PROD-001', cantidad: 4 },
      { productoCodigo: 'PROD-002', cantidad: 1 },
    ],
  },
  {
    sucursalSlug: 'sucursal-sur',
    diasAtras: 3,
    estado: 'RECHAZADA',
    walkIn: { nombre: 'Cliente Walk-in E' },
    detalles: [{ productoCodigo: 'PROD-003', cantidad: 6 }],
  },
  {
    sucursalSlug: 'sucursal-sur',
    diasAtras: 0,
    estado: 'PENDIENTE',
    detalles: [
      { productoCodigo: 'PROD-001', cantidad: 2 },
      { productoCodigo: 'PROD-003', cantidad: 2 },
    ],
  },
];

export const ventasSeed: Seed = {
  order: 8,
  name: '008-ventas',
  run: async () => {
    const sucursalRepository = seedDataSource.getRepository(Sucursal);
    const usuarioRepository = seedDataSource.getRepository(Usuario);
    const productoRepository = seedDataSource.getRepository(Producto);

    const superAdmin = await usuarioRepository.findOne({
      where: { nombre_usuario: 'admin' },
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
        if (item.estado === 'CONFIRMADA' && producto.stock_actual < det.cantidad) {
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

      const esWalkIn = !!item.walkIn;
      const descuentaStock = item.estado === 'CONFIRMADA';

      await seedDataSource.transaction(async (manager) => {
        const venta = manager.create(Venta, {
          numero_venta: numeroVenta,
          fecha_venta: fechaVentaStr,
          total,
          estado: item.estado,
          sucursal,
          usuario: superAdmin,
          cliente_walk_in: esWalkIn,
          cliente_nombre: esWalkIn ? (item.walkIn?.nombre ?? null) : null,
          cliente_celular: esWalkIn ? (item.walkIn?.celular ?? null) : null,
          cliente_codigo: esWalkIn ? (item.walkIn?.codigo ?? null) : null,
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
          if (descuentaStock) {
            producto.stock_actual -= det.cantidad;
            await manager.save(Producto, producto);
          }
        }

        ventasCreadas.push(numeroVenta);
      });
    }

    console.log(`- ${ventasCreadas.length} ventas creadas.`);
  },
};
