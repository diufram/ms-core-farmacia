import { randomUUID } from 'crypto';
import { Producto } from '../entities/producto.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { Usuario } from '../entities/usuario.entity';
import { Venta } from '../entities/venta.entity';
import { VentaDetalle } from '../entities/venta-detalle.entity';
import { Seed } from './base.seed';
import { seedDataSource } from './seed-data-source';

type EstadoVentaSeed = 'PENDIENTE' | 'CONFIRMADA' | 'RECHAZADA';

const SUCURSALES = [
    { slug: 'sucursal-central', codigo: 'C' },
    { slug: 'sucursal-norte', codigo: 'N' },
    { slug: 'sucursal-sur', codigo: 'S' },
];

const NOMBRES_WALKIN = [
    'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez',
    'Luis Rodríguez', 'Carmen Sánchez', 'Pedro Gómez', 'Lucía Fernández',
    'Miguel Díaz', 'Sofía Romero', 'Diego Torres', 'Elena Castro',
    'Andrés Vargas', 'Laura Morales', 'Sebastián Ortiz', 'Valentina Silva',
    'Roberto Méndez', 'Camila Reyes', 'Fernando Guzmán', 'Isabela Rojas',
];

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function generarVenta(
    sucursal: Sucursal,
    admin: Usuario,
    productos: Producto[],
    fechaVenta: Date,
    estado: EstadoVentaSeed,
    esWalkIn: boolean,
    codigoCliente: string | null,
): { venta: Partial<Venta>; detalles: VentaDetalle[] } {
    const cantidadProductos = randomInt(1, 4);
    const productosElegidos: Producto[] = [];
    const usados = new Set<number>();
    while (
        productosElegidos.length < cantidadProductos &&
        usados.size < productos.length
    ) {
        const idx = randomInt(0, productos.length - 1);
        if (!usados.has(idx)) {
            usados.add(idx);
            productosElegidos.push(productos[idx]);
        }
    }

    const detalles: VentaDetalle[] = [];
    let total = 0;
    for (const p of productosElegidos) {
        const cantidad = randomInt(1, 5);
        const precio = Number(p.precio_venta);
        total += precio * cantidad;
        const det = new VentaDetalle();
        det.producto = p;
        det.cantidad = cantidad;
        det.precio_unitario = precio;
        detalles.push(det);
    }

    const venta = new Venta();
    venta.numero_venta = `V-${randomUUID()}`;
    venta.fecha_venta = formatDate(fechaVenta);
    venta.total = Math.round(total * 100) / 100;
    venta.estado = estado;
    venta.sucursal = sucursal;
    venta.usuario = admin;
    venta.cliente_walk_in = esWalkIn;
    venta.cliente_nombre = esWalkIn ? pickRandom(NOMBRES_WALKIN) : null;
    venta.cliente_celular = esWalkIn
        ? `7${randomInt(1000000, 9999999)}`
        : null;
    venta.cliente_codigo = codigoCliente;

    return { venta, detalles };
}

export const ventasHistoricasSeed: Seed = {
    order: 9,
    name: '009-ventas-historicas',
    run: async () => {
        const sucursalRepository = seedDataSource.getRepository(Sucursal);
        const usuarioRepository = seedDataSource.getRepository(Usuario);
        const productoRepository = seedDataSource.getRepository(Producto);

        const superAdmin = await usuarioRepository.findOne({
            where: { nombre_usuario: 'admin' },
        });
        if (!superAdmin) {
            console.log(
                '- Super admin no existe, seed de ventas históricas omitido.',
            );
            return;
        }

        const totalCreadas: number[] = [0];

        for (const { slug, codigo: sucCode } of SUCURSALES) {
            const sucursal = await sucursalRepository.findOne({
                where: { slug },
            });
            if (!sucursal) {
                console.log(`- Sucursal ${slug} no existe, omitida.`);
                continue;
            }

            const productos = await productoRepository.find({
                where: { sucursal: { id: sucursal.id } },
            });
            if (productos.length === 0) {
                console.log(
                    `- Sin productos en ${slug}, seed omitido.`,
                );
                continue;
            }

            const hoy = new Date();
            let contador = 0;

            for (let diasAtras = 90; diasAtras >= 1; diasAtras--) {
                const fecha = new Date(hoy);
                fecha.setDate(fecha.getDate() - diasAtras);

                const dow = fecha.getDay();
                const factorFinDeSemana = dow === 0 || dow === 6 ? 0.6 : 1;
                const baseVentasPorDia = randomInt(1, 4);
                const ventasHoy = Math.max(
                    1,
                    Math.round(baseVentasPorDia * factorFinDeSemana),
                );

                for (let i = 0; i < ventasHoy; i++) {
                    const r = Math.random();
                    let estado: EstadoVentaSeed;
                    if (r < 0.7) estado = 'CONFIRMADA';
                    else if (r < 0.9) estado = 'PENDIENTE';
                    else estado = 'RECHAZADA';

                    const esWalkIn = Math.random() < 0.55;
                    const codigoCliente = esWalkIn
                        ? `${sucCode}-WI-${String(contador).padStart(3, '0')}`
                        : null;

                    const { venta, detalles } = generarVenta(
                        sucursal,
                        superAdmin,
                        productos,
                        fecha,
                        estado,
                        esWalkIn,
                        codigoCliente,
                    );

                    await seedDataSource.transaction(async (manager) => {
                        const ventaGuardada = await manager.save(
                            manager.create(Venta, venta),
                        );
                        for (const det of detalles) {
                            det.venta = ventaGuardada;
                            await manager.save(
                                manager.create(VentaDetalle, det),
                            );
                            if (estado === 'CONFIRMADA') {
                                const prod = productos.find(
                                    (p) => p.id === det.producto.id,
                                );
                                if (prod) {
                                    prod.stock_actual = Math.max(
                                        0,
                                        prod.stock_actual - det.cantidad,
                                    );
                                    await manager.save(Producto, prod);
                                }
                            }
                        }
                    });

                    contador++;
                    totalCreadas[0]++;
                }
            }

            console.log(
                `- ${slug}: ${contador} ventas históricas (90 días).`,
            );
        }

        console.log(
            `- Total: ${totalCreadas[0]} ventas históricas creadas.`,
        );
    },
};
