import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RolGlobal } from '../../database/entities/usuario.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import {
  CreateSucursalPayloadType,
  SucursalType,
} from './graphql/sucursales.types';
import { SucursalesService } from './sucursales.service';

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
export class SucursalesResolver {
  constructor(private readonly sucursalesService: SucursalesService) {}

  @Query(() => [SucursalType])
  @Roles(RolGlobal.SUPER_ADMIN)
  sucursales() {
    return this.sucursalesService.findAll();
  }

  @Query(() => SucursalType)
  @Roles(RolGlobal.SUPER_ADMIN)
  sucursal(@Args('id', { type: () => Int }) id: number) {
    return this.sucursalesService.findOne(id);
  }

  @Mutation(() => CreateSucursalPayloadType)
  @Roles(RolGlobal.SUPER_ADMIN)
  createSucursal(@Args('input') input: CreateSucursalDto) {
    return this.sucursalesService.create(input);
  }
}
