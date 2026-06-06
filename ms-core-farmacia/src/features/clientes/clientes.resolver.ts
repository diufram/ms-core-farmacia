import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import {
  ClientePayloadType,
  ClienteType,
} from './graphql/clientes.types';
import { ClientesService } from './clientes.service';

@Resolver()
@UseGuards(JwtAuthGuard)
export class ClientesResolver {
  constructor(private readonly clientesService: ClientesService) {}

  @Query(() => [ClienteType])
  clientes(
    @CurrentUser() user: JwtPayload,
    @Args('sucursalId', { type: () => Int, nullable: true })
    sucursalId: number | null,
  ) {
    return this.clientesService.findAll(user.rol, user.sucursal_id, sucursalId);
  }

  @Query(() => ClienteType)
  cliente(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.clientesService.findOne(id, user.rol, user.sucursal_id);
  }

  @Mutation(() => ClientePayloadType)
  createCliente(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: CreateClienteDto,
  ) {
    return this.clientesService.create(input, user.rol, user.sucursal_id);
  }

  @Mutation(() => ClienteType)
  updateCliente(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, input, user.rol, user.sucursal_id);
  }

  @Mutation(() => ClientePayloadType)
  deleteCliente(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.clientesService.delete(id, user.rol, user.sucursal_id);
  }
}
