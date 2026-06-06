import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import {
  CategoriaPayloadType,
  CategoriaType,
} from './graphql/categorias.types';
import { CategoriasService } from './categorias.service';

@Resolver()
@UseGuards(JwtAuthGuard)
export class CategoriasResolver {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Query(() => [CategoriaType])
  categorias(
    @CurrentUser() user: JwtPayload,
    @Args('sucursalId', { type: () => Int, nullable: true })
    sucursalId: number | null,
  ) {
    return this.categoriasService.findAll(user.rol, user.sucursal_id, sucursalId);
  }

  @Query(() => CategoriaType)
  categoria(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.categoriasService.findOne(id, user.rol, user.sucursal_id);
  }

  @Mutation(() => CategoriaPayloadType)
  createCategoria(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: CreateCategoriaDto,
  ) {
    return this.categoriasService.create(input, user.rol, user.sucursal_id);
  }

  @Mutation(() => CategoriaType)
  updateCategoria(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateCategoriaDto,
  ) {
    return this.categoriasService.update(id, input, user.rol, user.sucursal_id);
  }

  @Mutation(() => CategoriaPayloadType)
  deleteCategoria(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.categoriasService.delete(id, user.rol, user.sucursal_id);
  }
}
