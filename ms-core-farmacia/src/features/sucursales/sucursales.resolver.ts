import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Rol } from '../../database/entities/usuario.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import {
  CreateSucursalPayloadType,
  SucursalPayloadType,
  SucursalType,
} from './graphql/sucursales.types';
import { SucursalesService } from './sucursales.service';

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
export class SucursalesResolver {
  constructor(private readonly sucursalesService: SucursalesService) {}

  @Query(() => [SucursalType])
  sucursales() {
    return this.sucursalesService.findAll();
  }

  @Query(() => SucursalType)
  sucursal(@Args('id', { type: () => Int }) id: number) {
    return this.sucursalesService.findOne(id);
  }

  @Mutation(() => CreateSucursalPayloadType)
  @Roles(Rol.SUPER_ADMIN)
  createSucursal(@Args('input') input: CreateSucursalDto) {
    return this.sucursalesService.create(input);
  }

  @Mutation(() => SucursalPayloadType)
  @Roles(Rol.SUPER_ADMIN)
  updateSucursal(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateSucursalDto,
  ) {
    return this.sucursalesService.update(id, input);
  }

  @Mutation(() => SucursalPayloadType)
  @Roles(Rol.SUPER_ADMIN)
  deleteSucursal(@Args('id', { type: () => Int }) id: number) {
    return this.sucursalesService.delete(id);
  }
}
