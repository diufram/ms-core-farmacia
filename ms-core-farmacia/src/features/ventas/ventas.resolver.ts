import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Rol } from '../../database/entities/usuario.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateVentaDto } from './dto/create-venta.dto';
import {
  VentaPayloadType,
  VentaType,
} from './graphql/ventas.types';
import { VentasService } from './ventas.service';

@Resolver()
@UseGuards(JwtAuthGuard)
export class VentasResolver {
  constructor(private readonly ventasService: VentasService) {}

  @Query(() => [VentaType])
  ventas(
    @CurrentUser() user: JwtPayload,
    @Args('sucursalId', { type: () => Int, nullable: true })
    sucursalId: number | null,
    @Args('fechaDesde', { type: () => String, nullable: true })
    fechaDesde: string | null,
    @Args('fechaHasta', { type: () => String, nullable: true })
    fechaHasta: string | null,
  ) {
    return this.ventasService.findAll(user.sub, user.rol, user.sucursal_id, {
      sucursalId: sucursalId ?? undefined,
      fechaDesde: fechaDesde ?? undefined,
      fechaHasta: fechaHasta ?? undefined,
    });
  }

  @Query(() => VentaType)
  venta(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.ventasService.findOne(
      id,
      user.rol,
      user.sucursal_id,
      user.sub,
    );
  }

  @Mutation(() => VentaPayloadType)
  createVenta(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: CreateVentaDto,
  ) {
    return this.ventasService.create(
      input,
      user.sub,
      user.rol,
      user.sucursal_id,
    );
  }

  @Mutation(() => VentaPayloadType)
  @UseGuards(RolesGuard)
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  cambiarEstadoVenta(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => Int }) id: number,
    @Args('nuevoEstado') nuevoEstado: string,
  ) {
    return this.ventasService.cambiarEstado(
      id,
      nuevoEstado as 'CONFIRMADA' | 'RECHAZADA' | 'ENTREGADA',
      user.rol,
      user.sucursal_id,
    );
  }

  @Mutation(() => VentaPayloadType)
  @UseGuards(RolesGuard)
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  deleteVenta(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.ventasService.delete(id, user.rol, user.sucursal_id);
  }
}
