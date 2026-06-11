import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Rol } from '../../database/entities/usuario.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AssignSucursalDto } from './dto/assign-sucursal.dto';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { UsuarioPayloadType, UsuarioType } from './graphql/usuarios.types';
import { UsuariosService } from './usuarios.service';

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosResolver {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Query(() => [UsuarioType])
  @Roles(Rol.SUPER_ADMIN)
  usuarios(
    @Args('sucursalId', { type: () => Int, nullable: true })
    sucursalId: number | null,
    @Args('rol', { type: () => String, nullable: true })
    rol: string | null,
  ) {
    return this.usuariosService.findAll({
      ...(sucursalId ? { sucursalId } : {}),
      ...(rol ? { rol: rol as Rol } : {}),
    });
  }

  @Query(() => UsuarioType)
  @Roles(Rol.SUPER_ADMIN)
  usuario(@Args('id', { type: () => Int }) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Mutation(() => UsuarioPayloadType)
  @Roles(Rol.SUPER_ADMIN)
  createUsuario(@Args('input') input: CreateUsuarioDto) {
    return this.usuariosService.create(input);
  }

  @Mutation(() => UsuarioPayloadType)
  @Roles(Rol.SUPER_ADMIN)
  updateUsuario(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, input);
  }

  @Mutation(() => UsuarioPayloadType)
  @Roles(Rol.SUPER_ADMIN)
  deleteUsuario(@Args('id', { type: () => Int }) id: number) {
    return this.usuariosService.delete(id);
  }

  @Mutation(() => UsuarioPayloadType)
  @Roles(Rol.SUPER_ADMIN)
  assignUsuarioSucursal(
    @Args('usuarioId', { type: () => Int }) usuarioId: number,
    @Args('input') input: AssignSucursalDto,
  ) {
    return this.usuariosService.assignSucursal(usuarioId, input);
  }

  @Mutation(() => UsuarioPayloadType)
  @Roles(Rol.SUPER_ADMIN)
  unassignUsuarioSucursal(
    @Args('usuarioId', { type: () => Int }) usuarioId: number,
    @Args('sucursalId', { type: () => Int }) sucursalId: number,
  ) {
    return this.usuariosService.unassignSucursal(usuarioId, sucursalId);
  }

  @Mutation(() => UsuarioPayloadType)
  @Roles(Rol.SUPER_ADMIN)
  adminResetUsuarioPassword(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: AdminResetPasswordDto,
  ) {
    return this.usuariosService.adminResetPassword(id, input);
  }
}
