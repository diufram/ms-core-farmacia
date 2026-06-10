import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Rol } from '../../database/entities/usuario.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import {
  ClientePayloadType,
  ClienteType,
} from './graphql/clientes.types';
import { ClientesService } from './clientes.service';

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientesResolver {
  constructor(private readonly clientesService: ClientesService) {}

  @Query(() => [ClienteType])
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  clientes(
    @CurrentUser() user: JwtPayload,
    @Args('sucursalId', { type: () => Int, nullable: true })
    sucursalId: number | null,
  ) {
    return this.clientesService.findAll(user.rol, user.sucursal_id, sucursalId);
  }

  @Query(() => ClienteType)
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  cliente(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.clientesService.findOne(id, user.rol, user.sucursal_id);
  }

  @Mutation(() => ClientePayloadType)
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  createCliente(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: CreateClienteDto,
  ) {
    return this.clientesService.create(input, user.rol, user.sucursal_id);
  }

  @Mutation(() => ClienteType)
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  updateCliente(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, input, user.rol, user.sucursal_id);
  }

  @Mutation(() => ClientePayloadType)
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  deleteCliente(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.clientesService.delete(id, user.rol, user.sucursal_id);
  }
}
