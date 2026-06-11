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
import { NotificationsService } from '../notifications/notifications.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ethers } from 'ethers';

type EstadoVenta = 'PENDIENTE' | 'PREPARADA' | 'CONFIRMADA' | 'RECHAZADA';

const TRANSICIONES_VALIDAS: Record<EstadoVenta, EstadoVenta[]> = {
  PENDIENTE: ['PREPARADA', 'RECHAZADA'],
  PREPARADA: ['CONFIRMADA', 'RECHAZADA'],
  CONFIRMADA: [],
  RECHAZADA: [],
};

@Injectable()
export class VentasService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly ventasRepository: VentasRepository,
    private readonly notificationsService: NotificationsService,
    private readonly blockchainService: BlockchainService,
  ) {}

  async findAll(
    userId: number,
    userRol: string,
    userSucursalId: number | null,
    filters: { sucursalId?: number; fechaDesde?: string; fechaHasta?: string },
  ) {
    const { targetSucursalId, targetUsuarioId } = this.resolveFindAllParams(
      userRol,
      userSucursalId,
      userId,
      filters.sucursalId ?? null,
    );
    const ventas = await this.ventasRepository.findAll({
      sucursalId: targetSucursalId ?? undefined,
      usuarioId: targetUsuarioId,
      fechaDesde: filters.fechaDesde,
      fechaHasta: filters.fechaHasta,
    });
    return ventas.map((v) => this.serializeVenta(v));
  }

  async findOne(
    id: number,
    userRol: string,
    userSucursalId: number | null,
    userId: number,
  ) {
    const venta = await this.ventasRepository.findById(id);
    if (!venta) {
      throw new NotFoundException('Venta no encontrada.');
    }
    this.assertCanViewVenta(venta, userRol, userSucursalId, userId);
    return this.serializeVenta(venta);
  }

  async create(
    dto: CreateVentaDto,
    userId: number,
    userRol: string,
    userSucursalId: number | null,
  ) {
    this.assertCanCreateVenta(userRol, userSucursalId, dto.sucursalId);

    if (dto.cliente_walk_in && (!dto.cliente_nombre || dto.cliente_nombre.trim().length === 0)) {
      throw new BadRequestException(
        'Si marca cliente walk-in, el nombre del cliente es obligatorio.',
      );
    }

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
        cliente_walk_in: dto.cliente_walk_in ?? false,
        cliente_nombre: dto.cliente_walk_in ? (dto.cliente_nombre ?? null) : null,
        cliente_celular: dto.cliente_walk_in ? (dto.cliente_celular ?? null) : null,
        cliente_codigo: dto.cliente_walk_in ? (dto.cliente_codigo ?? null) : null,
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

      return ventaGuardada;
    });

    const reloaded = await this.ventasRepository.findById(ventaCreada.id);
    return {
      venta: this.serializeVenta(reloaded!),
      message: `Venta ${numeroVenta} creada correctamente en estado PENDIENTE.`,
    };
  }

  async cambiarEstado(
    id: number,
    nuevoEstado: EstadoVenta,
    userRol: string,
    userSucursalId: number | null,
  ) {
    if (userRol !== Rol.SUPER_ADMIN && userRol !== Rol.ADMIN) {
      throw new ForbiddenException(
        'Solo super admin o admin pueden cambiar el estado de una venta.',
      );
    }

    const venta = await this.ventasRepository.findById(id);
    if (!venta) {
      throw new NotFoundException('Venta no encontrada.');
    }

    if (userRol === Rol.ADMIN && venta.sucursal.id !== userSucursalId) {
      throw new ForbiddenException(
        'Solo puede cambiar el estado de ventas de su propia sucursal.',
      );
    }

    const estadoActual = (venta.estado ?? 'PENDIENTE') as EstadoVenta;
    if (!TRANSICIONES_VALIDAS[estadoActual]?.includes(nuevoEstado)) {
      throw new BadRequestException(
        `No se puede cambiar de ${estadoActual} a ${nuevoEstado}.`,
      );
    }

    await this.dataSource.transaction(async (manager) => {
      if (nuevoEstado === 'PREPARADA') {
        const detalles = await manager
          .getRepository(VentaDetalle)
          .find({ where: { venta: { id: venta.id } }, relations: ['producto'] });
        for (const detalle of detalles) {
          const producto = await manager
            .getRepository(Producto)
            .findOne({ where: { id: detalle.producto.id } });
          if (!producto) continue;
          if (producto.stock_actual < detalle.cantidad) {
            throw new BadRequestException(
              `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock_actual}, solicitado: ${detalle.cantidad}.`,
            );
          }
          producto.stock_actual -= detalle.cantidad;
          await manager.save(Producto, producto);
        }
      }

      venta.estado = nuevoEstado;
      await manager.save(Venta, venta);
    });

    if (nuevoEstado === 'PREPARADA') {
      await this.notificationsService.sendPushToUser(
        venta.usuario.id,
        `¡Tu pedido #${venta.id} está listo!`,
        `Tu pedido ha sido preparado en ${venta.sucursal.nombre} y está listo para ser recogido.`,
      );
    } else if (nuevoEstado === 'CONFIRMADA') {
      await this.notificationsService.sendPushToUser(
        venta.usuario.id,
        `¡Pedido #${venta.id} completado!`,
        `Tu pedido en ${venta.sucursal.nombre} ha sido pagado y recogido. ¡Gracias por tu compra!`,
      );

      try {
        const saleData = this.getSaleDataPayload(venta);
        const txHash = await this.blockchainService.registerSaleOnChain(venta.numero_venta, saleData);
        if (txHash) {
          venta.tx_hash = txHash;
          // Update outside the transaction is fine here since it's just appending the hash
          await this.dataSource.getRepository(Venta).update(venta.id, { tx_hash: txHash });
        }
      } catch (error) {
        // Log but don't throw, we don't want to fail the completion if blockchain fails
        console.error('Failed to register sale on blockchain', error);
      }
    }

    const reloaded = await this.ventasRepository.findById(id);
    return {
      venta: this.serializeVenta(reloaded!),
      message: `Venta ${nuevoEstado.toLowerCase()} correctamente.`,
    };
  }

  async delete(id: number, userRol: string, userSucursalId: number | null) {
    if (userRol !== Rol.SUPER_ADMIN && userRol !== Rol.ADMIN) {
      throw new ForbiddenException(
        'Solo super admin o admin pueden eliminar ventas.',
      );
    }
    const venta = await this.ventasRepository.findById(id);
    if (!venta) {
      throw new NotFoundException('Venta no encontrada.');
    }
    if (userRol === Rol.ADMIN && venta.sucursal.id !== userSucursalId) {
      throw new ForbiddenException(
        'Solo puede eliminar ventas de su propia sucursal.',
      );
    }
    const snapshot = this.serializeVenta(venta);
    await this.ventasRepository.softDelete(id);
    return {
      venta: snapshot,
      message: 'Venta eliminada correctamente.',
    };
  }

  async verificarIntegridad(id: number, userRol: string, userSucursalId: number | null, userId: number) {
    const venta = await this.ventasRepository.findById(id);
    if (!venta) {
      throw new NotFoundException('Venta no encontrada.');
    }
    this.assertCanViewVenta(venta, userRol, userSucursalId, userId);

    if (!venta.tx_hash) {
      throw new BadRequestException('Esta venta no tiene un registro en la blockchain.');
    }

    // Recalculate local hash
    const saleData = this.getSaleDataPayload(venta);
    const dataBytes = ethers.toUtf8Bytes(saleData);
    const localHash = ethers.keccak256(dataBytes);

    // Fetch blockchain hash
    const blockchainHash = await this.blockchainService.getSaleHashOnChain(venta.numero_venta);
    if (!blockchainHash) {
      throw new BadRequestException('No se pudo obtener el hash de la blockchain o no está registrado.');
    }

    const isVerified = localHash === blockchainHash;
    return {
      isVerified,
      currentHash: localHash,
      blockchainHash,
    };
  }

  // ============================================================
  // Helpers privados
  // ============================================================

  private resolveFindAllParams(
    userRol: string,
    userSucursalId: number | null,
    userId: number,
    requestedSucursalId: number | null,
  ): { targetSucursalId: number | null; targetUsuarioId: number | undefined } {
    if (userRol === Rol.SUPER_ADMIN) {
      return { targetSucursalId: requestedSucursalId, targetUsuarioId: undefined };
    }
    if (userRol === Rol.ADMIN) {
      return { targetSucursalId: userSucursalId, targetUsuarioId: undefined };
    }
    if (userRol === Rol.CLIENTE) {
      return { targetSucursalId: null, targetUsuarioId: userId };
    }
    return { targetSucursalId: null, targetUsuarioId: userId };
  }

  private assertCanCreateVenta(
    userRol: string,
    userSucursalId: number | null,
    requestedSucursalId: number,
  ) {
    if (userRol === Rol.SUPER_ADMIN) {
      return;
    }
    if (userRol === Rol.ADMIN) {
      if (userSucursalId !== requestedSucursalId) {
        throw new ForbiddenException(
          'Solo puede registrar ventas en su propia sucursal.',
        );
      }
      return;
    }
    if (userRol === Rol.CLIENTE) {
      return;
    }
    throw new ForbiddenException('No tiene permiso para registrar ventas.');
  }

  private assertCanViewVenta(
    venta: Venta,
    userRol: string,
    userSucursalId: number | null,
    userId: number,
  ) {
    if (userRol === Rol.SUPER_ADMIN) return;
    if (userRol === Rol.ADMIN) {
      if (venta.sucursal.id !== userSucursalId) {
        throw new ForbiddenException(
          'No tiene permiso para ver ventas de otra sucursal.',
        );
      }
      return;
    }
    if (userRol === Rol.CLIENTE) {
      if (venta.usuario.id !== userId) {
        throw new ForbiddenException('Solo puede ver sus propias ventas.');
      }
      return;
    }
    throw new ForbiddenException('No tiene permiso para ver esta venta.');
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
      cliente_walk_in: venta.cliente_walk_in ?? false,
      cliente_nombre: venta.cliente_nombre ?? null,
      cliente_celular: venta.cliente_celular ?? null,
      cliente_codigo: venta.cliente_codigo ?? null,
      tx_hash: venta.tx_hash ?? null,
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

  private getSaleDataPayload(venta: Venta): string {
    return JSON.stringify({
      id: venta.id,
      numero: venta.numero_venta,
      total: venta.total,
      fecha: venta.fecha_venta,
      cliente: venta.cliente_nombre ?? venta.usuario?.persona?.nombre ?? 'Cliente',
    });
  }
}
