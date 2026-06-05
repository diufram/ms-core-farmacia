import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import { Producto } from '../../database/entities/producto.entity';
import { RolGlobal } from '../../database/entities/usuario.entity';
import { Venta } from '../../database/entities/venta.entity';
import { VentaDetalle } from '../../database/entities/venta-detalle.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { VentasRepository } from './ventas.repository';

const MAX_NUMERO_VENTA_ATTEMPTS = 10;
const POSTGRES_UNIQUE_VIOLATION = '23505';

@Injectable()
export class VentasService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly ventasRepository: VentasRepository,
  ) {}

  async findAll(
    userRol: string,
    userSucursalId: number | null,
    filters: { sucursalId?: number; fechaDesde?: string; fechaHasta?: string },
  ) {
    const targetSucursalId = this.resolveSucursalId(
      userRol,
      userSucursalId,
      filters.sucursalId ?? null,
    );
    const ventas = await this.ventasRepository.findAll({
      sucursalId: targetSucursalId ?? undefined,
      fechaDesde: filters.fechaDesde,
      fechaHasta: filters.fechaHasta,
    });
    return ventas.map((v) => this.serializeVenta(v));
  }

  async findOne(id: number, userRol: string, userSucursalId: number | null) {
    const venta = await this.ventasRepository.findById(id);
    if (!venta) {
      throw new NotFoundException('Venta no encontrada.');
    }
    this.assertSucursalAccess(venta, userRol, userSucursalId);
    return this.serializeVenta(venta);
  }

  async create(
    dto: CreateVentaDto,
    userId: number,
    userRol: string,
    userSucursalId: number | null,
  ) {
    this.assertCanUseSucursal(userRol, userSucursalId, dto.sucursalId);

    const productoIds = [...new Set(dto.detalles.map((d) => d.productoId))];
    const productos = await this.ventasRepository.findProductosByIds(productoIds);
    if (productos.length !== productoIds.length) {
      throw new NotFoundException('Uno o mas productos no existen.');
    }

    for (const producto of productos) {
      if (producto.sucursal.id !== dto.sucursalId) {
        throw new BadRequestException(
          `El producto "${producto.nombre}" no pertenece a la sucursal ${dto.sucursalId}.`,
        );
      }
    }

    for (const detalle of dto.detalles) {
      const producto = productos.find((p) => p.id === detalle.productoId);
      if (!producto) continue;
      if (producto.stock_actual < detalle.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock_actual}, solicitado: ${detalle.cantidad}.`,
        );
      }
    }

    const today = new Date();
    const datePrefix = `V-${today.toISOString().slice(0, 10).replace(/-/g, '')}`;
    const fechaVenta = today.toISOString().slice(0, 10);

    let total = 0;
    for (const detalle of dto.detalles) {
      const producto = productos.find((p) => p.id === detalle.productoId);
      if (!producto) continue;
      const precioUnitario =
        detalle.precioUnitario ?? Number(producto.precio_venta);
      total += precioUnitario * detalle.cantidad;
    }

    let ventaCreada: Venta | null = null;
    let numeroVenta = '';
    for (let attempt = 1; attempt <= MAX_NUMERO_VENTA_ATTEMPTS; attempt++) {
      const count = await this.ventasRepository.countByNumeroVentaPrefix(
        dto.sucursalId,
        datePrefix,
      );
      const candidate = count + attempt;
      numeroVenta = `${datePrefix}-${String(candidate).padStart(4, '0')}`;

      try {
        ventaCreada = await this.dataSource.transaction(async (manager) => {
          const venta = manager.create(Venta, {
            numero_venta: numeroVenta,
            fecha_venta: fechaVenta,
            total,
            sucursal: { id: dto.sucursalId } as Venta['sucursal'],
            usuario: { id: userId } as Venta['usuario'],
            cliente: dto.clienteId
              ? ({ id: dto.clienteId } as Venta['cliente'])
              : null,
          });
          const ventaGuardada = await manager.save(venta);

          for (const detalle of dto.detalles) {
            const producto = productos.find((p) => p.id === detalle.productoId);
            if (!producto) continue;
            const precioUnitario =
              detalle.precioUnitario ?? Number(producto.precio_venta);
            const detalleEntity = manager.create(VentaDetalle, {
              venta: ventaGuardada,
              producto: { id: producto.id } as VentaDetalle['producto'],
              cantidad: detalle.cantidad,
              precio_unitario: precioUnitario,
            });
            await manager.save(detalleEntity);
          }

          for (const detalle of dto.detalles) {
            const producto = productos.find((p) => p.id === detalle.productoId);
            if (!producto) continue;
            producto.stock_actual -= detalle.cantidad;
            await manager.save(Producto, producto);
          }

          return ventaGuardada;
        });
        break;
      } catch (err) {
        if (this.isUniqueViolation(err)) {
          continue;
        }
        throw err;
      }
    }

    if (!ventaCreada) {
      throw new InternalServerErrorException(
        'No se pudo generar un numero de venta unico. Intente nuevamente.',
      );
    }

    const reloaded = await this.ventasRepository.findById(ventaCreada.id);
    return {
      venta: this.serializeVenta(reloaded!),
      message: `Venta ${numeroVenta} creada correctamente.`,
    };
  }

  private isUniqueViolation(err: unknown): boolean {
    if (err instanceof QueryFailedError) {
      const driverError = (err as { driverError?: { code?: string } })
        .driverError;
      return driverError?.code === POSTGRES_UNIQUE_VIOLATION;
    }
    return false;
  }

  async delete(id: number, userRol: string, userSucursalId: number | null) {
    const venta = await this.ventasRepository.findById(id);
    if (!venta) {
      throw new NotFoundException('Venta no encontrada.');
    }
    this.assertSucursalAccess(venta, userRol, userSucursalId);
    const snapshot = this.serializeVenta(venta);
    await this.ventasRepository.softDelete(id);
    return {
      venta: snapshot,
      message: 'Venta eliminada correctamente.',
    };
  }

  private resolveSucursalId(
    userRol: string,
    userSucursalId: number | null,
    requestedSucursalId: number | null,
  ): number | null {
    if (userRol === RolGlobal.SUPER_ADMIN) {
      return requestedSucursalId;
    }
    return userSucursalId;
  }

  private assertCanUseSucursal(
    userRol: string,
    userSucursalId: number | null,
    requestedSucursalId: number,
  ) {
    if (userRol === RolGlobal.SUPER_ADMIN) {
      return;
    }
    if (requestedSucursalId !== userSucursalId) {
      throw new ForbiddenException(
        'Solo puede registrar ventas en su propia sucursal.',
      );
    }
  }

  private assertSucursalAccess(
    venta: Venta,
    userRol: string,
    userSucursalId: number | null,
  ) {
    if (userRol === RolGlobal.SUPER_ADMIN) {
      return;
    }
    if (venta.sucursal.id !== userSucursalId) {
      throw new ForbiddenException(
        'No tiene permiso para operar sobre ventas de otra sucursal.',
      );
    }
  }

  private serializeVenta(venta: Venta) {
    return {
      id: venta.id,
      numero_venta: venta.numero_venta,
      fecha_venta: venta.fecha_venta,
      total: Number(venta.total),
      sucursal_id: venta.sucursal?.id ?? null,
      usuario_id: venta.usuario?.id ?? null,
      cliente_id: venta.cliente?.id ?? null,
      detalles:
        venta.detalles?.map((d) => ({
          id: d.id,
          producto_id: d.producto?.id ?? null,
          producto_nombre: d.producto?.nombre ?? '',
          cantidad: d.cantidad,
          precio_unitario: Number(d.precio_unitario),
          subtotal: Number(d.precio_unitario) * d.cantidad,
        })) ?? [],
    };
  }
}
