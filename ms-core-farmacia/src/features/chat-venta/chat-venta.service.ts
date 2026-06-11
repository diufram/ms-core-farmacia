import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Producto } from '../../database/entities/producto.entity';
import { Sucursal } from '../../database/entities/sucursal.entity';
import { Rol, Usuario } from '../../database/entities/usuario.entity';
import { UsuarioSucursal } from '../../database/entities/usuario-sucursal.entity';
import { Venta } from '../../database/entities/venta.entity';
import { VentaDetalle } from '../../database/entities/venta-detalle.entity';
import { EmailService } from '../email/email.service';
import { CrearChatVentaDto } from './dto/crear-chat-venta.dto';

interface ProductoResultado {
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
  agotado: boolean;
}

interface SucursalResultado {
  id: number;
  nombre: string;
  direccion: string;
  productos: ProductoResultado[];
}

@Injectable()
export class ChatVentaService {
  private readonly logger = new Logger(ChatVentaService.name);
  private readonly SUPER_ADMIN_ID = 1;

  constructor(
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(UsuarioSucursal)
    private readonly usuarioSucursalRepository: Repository<UsuarioSucursal>,
  ) {}

  /**
   * Busca productos por nombre en todas las sucursales
   */
  async buscarProductos(query: string): Promise<{
    resultados: SucursalResultado[];
  }> {
    const productos = await this.productoRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.sucursal', 's')
      .where('p.nombre ILIKE :query', { query: `%${query}%` })
      .andWhere('p.deleted_at IS NULL')
      .orderBy('s.nombre', 'ASC')
      .addOrderBy('p.nombre', 'ASC')
      .getMany();

    // Agrupar por sucursal
    const sucursalesMap = new Map<number, SucursalResultado>();

    for (const producto of productos) {
      const sucursalId = producto.sucursal.id;

      if (!sucursalesMap.has(sucursalId)) {
        sucursalesMap.set(sucursalId, {
          id: sucursalId,
          nombre: producto.sucursal.nombre,
          direccion: producto.sucursal.direccion || 'Sin dirección',
          productos: [],
        });
      }

      const sucursal = sucursalesMap.get(sucursalId)!;
      sucursal.productos.push({
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio: Number(producto.precio_venta),
        stock: producto.stock_actual,
        agotado: producto.stock_actual <= 0,
      });
    }

    return {
      resultados: Array.from(sucursalesMap.values()),
    };
  }

  /**
   * Crea una venta confirmada desde el bot de Telegram
   * Usa SUPER_ADMIN como usuario y confirma inmediatamente
   */
  async crearVenta(dto: CrearChatVentaDto): Promise<{
    id: number;
    numeroVenta: string;
    estado: string;
    total: number;
    sucursal: { id: number; nombre: string };
    detalles: Array<{
      producto: string;
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
    }>;
  }> {
    // 1. Validar que existe la sucursal
    const sucursal = await this.sucursalRepository.findOne({
      where: { id: dto.sucursalId },
    });

    if (!sucursal) {
      throw new NotFoundException(
        `Sucursal con ID ${dto.sucursalId} no encontrada.`,
      );
    }

    // 2. Obtener SUPER_ADMIN
    const superAdmin = await this.usuarioRepository.findOne({
      where: { id: this.SUPER_ADMIN_ID },
    });

    if (!superAdmin) {
      throw new NotFoundException(
        'Usuario SUPER_ADMIN no encontrado. Contacte al administrador.',
      );
    }

    // 3. Resolver códigos de productos a IDs
    const productosMap = new Map<
      string,
      { producto: Producto; cantidad: number }
    >();

    for (const item of dto.productos) {
      const producto = await this.productoRepository.findOne({
        where: {
          codigo: item.codigo,
          sucursal: { id: dto.sucursalId },
        },
      });

      if (!producto) {
        throw new NotFoundException(
          `Producto con código "${item.codigo}" no encontrado en la sucursal ${sucursal.nombre}.`,
        );
      }

      if (producto.stock_actual < item.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock_actual}, solicitado: ${item.cantidad}.`,
        );
      }

      productosMap.set(item.codigo, { producto, cantidad: item.cantidad });
    }

    // 4. Crear venta en transacción
    const ventaCreada = await this.dataSource.transaction(async (manager) => {
      // Calcular total
      let total = 0;
      for (const item of dto.productos) {
        const { producto } = productosMap.get(item.codigo)!;
        total += Number(producto.precio_venta) * item.cantidad;
      }

      const today = new Date();
      const fechaVenta = today.toISOString().slice(0, 10);
      const numeroVenta = `V-${Date.now()}`;

      // Crear venta en PENDIENTE
      const venta = manager.create(Venta, {
        numero_venta: numeroVenta,
        fecha_venta: fechaVenta,
        total,
        estado: 'PENDIENTE',
        sucursal: { id: dto.sucursalId },
        usuario: { id: this.SUPER_ADMIN_ID },
        cliente_walk_in: true,
        cliente_nombre: dto.clienteNombre || null,
        cliente_celular: dto.clienteCelular || null,
        cliente_codigo: null,
      });

      const ventaGuardada = await manager.save(venta);

      // Crear detalles
      for (const item of dto.productos) {
        const { producto, cantidad } = productosMap.get(item.codigo)!;
        const precioUnitario = Number(producto.precio_venta);

        const detalle = manager.create(VentaDetalle, {
          venta: ventaGuardada,
          producto: { id: producto.id },
          cantidad,
          precio_unitario: precioUnitario,
        });

        await manager.save(detalle);
      }

      // CAMBIAR A CONFIRMADA (descuenta stock)
      const detalles = await manager
        .getRepository(VentaDetalle)
        .find({
          where: { venta: { id: ventaGuardada.id } },
          relations: ['producto'],
        });

      for (const detalle of detalles) {
        const producto = await manager
          .getRepository(Producto)
          .findOne({ where: { id: detalle.producto.id } });

        if (!producto) continue;

        if (producto.stock_actual < detalle.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para "${producto.nombre}" al confirmar.`,
          );
        }

        producto.stock_actual -= detalle.cantidad;
        await manager.save(Producto, producto);
      }

      ventaGuardada.estado = 'CONFIRMADA';
      await manager.save(Venta, ventaGuardada);

      return ventaGuardada;
    });

    // 5. Recargar venta con relaciones
    const ventaCompleta = await this.dataSource
      .getRepository(Venta)
      .findOne({
        where: { id: ventaCreada.id },
        relations: ['sucursal', 'detalles', 'detalles.producto'],
      });

    if (!ventaCompleta) {
      throw new NotFoundException('Error al recargar la venta creada.');
    }

    return {
      id: ventaCompleta.id,
      numeroVenta: ventaCompleta.numero_venta,
      estado: ventaCompleta.estado,
      total: Number(ventaCompleta.total),
      sucursal: {
        id: ventaCompleta.sucursal.id,
        nombre: ventaCompleta.sucursal.nombre,
      },
      detalles:
        ventaCompleta.detalles?.map((d) => ({
          producto: d.producto?.nombre || '',
          cantidad: d.cantidad,
          precioUnitario: Number(d.precio_unitario),
          subtotal: Number(d.precio_unitario) * d.cantidad,
        })) || [],
    };
  }

  /**
   * Envía email de notificación al admin de la sucursal
   */
  async enviarEmailVenta(ventaId: number): Promise<{
    enviado: boolean;
    destinatario: string;
    ventaId: number;
  }> {
    // 1. Buscar venta
    const venta = await this.dataSource.getRepository(Venta).findOne({
      where: { id: ventaId },
      relations: ['sucursal', 'detalles', 'detalles.producto'],
    });

    if (!venta) {
      throw new NotFoundException(`Venta con ID ${ventaId} no encontrada.`);
    }

    // 2. Buscar admin de la sucursal
    const adminSucursal = await this.usuarioSucursalRepository.findOne({
      where: {
        sucursal: { id: venta.sucursal.id },
        usuario: { rol: Rol.ADMIN },
        activo: true,
      },
      relations: ['usuario', 'usuario.persona'],
    });

    if (!adminSucursal) {
      throw new BadRequestException(
        `No se encontró un administrador activo para la sucursal ${venta.sucursal.nombre}.`,
      );
    }

    const destinatario = adminSucursal.usuario.correo_electronico;

    // 3. Preparar datos para el email
    const emailData = {
      numeroVenta: venta.numero_venta,
      fecha: venta.fecha_venta,
      total: Number(venta.total),
      sucursal: {
        nombre: venta.sucursal.nombre,
        direccion: venta.sucursal.direccion || 'Sin dirección',
      },
      cliente: venta.cliente_nombre
        ? {
            nombre: venta.cliente_nombre,
            celular: venta.cliente_celular || undefined,
          }
        : undefined,
      detalles:
        venta.detalles?.map((d) => ({
          producto: d.producto?.nombre || '',
          cantidad: d.cantidad,
          precioUnitario: Number(d.precio_unitario),
          subtotal: Number(d.precio_unitario) * d.cantidad,
        })) || [],
    };

    // 4. Enviar email
    await this.emailService.enviarVentaCreada(destinatario, emailData);

    return {
      enviado: true,
      destinatario,
      ventaId,
    };
  }
}
