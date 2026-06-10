import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { Producto } from '../../database/entities/producto.entity';
import { Rol } from '../../database/entities/usuario.entity';
import { Venta } from '../../database/entities/venta.entity';
import { VentaDetalle } from '../../database/entities/venta-detalle.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { VentasRepository } from './ventas.repository';

@Injectable()
export class VentasService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly ventasRepository: VentasRepository,
  ) {}

  async findAll(
    userId: number,
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
      usuarioId: userRol === Rol.ADMIN ? userId : undefined,
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
    const fechaVenta = today.toISOString().slice(0, 10);
    const numeroVenta = `V-${randomUUID()}`;

    let total = 0;
    for (const detalle of dto.detalles) {
      const producto = productos.find((p) => p.id === detalle.productoId);
      if (!producto) continue;
      const precioUnitario =
        detalle.precioUnitario ?? Number(producto.precio_venta);
      total += precioUnitario * detalle.cantidad;
    }

    const ventaCreada = await this.dataSource.transaction(async (manager) => {
      const venta = manager.create(Venta, {
        numero_venta: numeroVenta,
        fecha_venta: fechaVenta,
        total,
        estado: 'PENDIENTE',
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

    const reloaded = await this.ventasRepository.findById(ventaCreada.id);
    return {
      venta: this.serializeVenta(reloaded!),
      message: `Venta ${numeroVenta} creada correctamente.`,
    };
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
    if (userRol === Rol.SUPER_ADMIN) {
      return requestedSucursalId;
    }
    return userSucursalId;
  }

  private assertCanUseSucursal(
    userRol: string,
    userSucursalId: number | null,
    requestedSucursalId: number,
  ) {
    if (userRol === Rol.SUPER_ADMIN || userRol === Rol.ADMIN) {
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
    if (userRol === Rol.SUPER_ADMIN) {
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
      estado: venta.estado ?? 'PENDIENTE',
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
