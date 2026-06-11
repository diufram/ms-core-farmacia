import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ProductoPayloadType, ProductoType } from './graphql/productos.types';
import { ProductosService } from './productos.service';

@Resolver()
@UseGuards(JwtAuthGuard)
export class ProductosResolver {
  constructor(private readonly productosService: ProductosService) {}

  @Query(() => [ProductoType])
  productos(
    @CurrentUser() user: JwtPayload,
    @Args('sucursalId', { type: () => Int, nullable: true })
    sucursalId: number | null,
    @Args('categoriaId', { type: () => Int, nullable: true })
    categoriaId: number | null,
  ) {
    return this.productosService.findAll(user.rol, user.sucursal_id, {
      sucursalId: sucursalId ?? undefined,
      categoriaId: categoriaId ?? undefined,
    });
  }

  @Query(() => ProductoType)
  producto(@CurrentUser() user: JwtPayload, @Args('id', { type: () => Int }) id: number) {
    return this.productosService.findOne(id, user.rol, user.sucursal_id);
  }

  @Mutation(() => ProductoPayloadType)
  createProducto(@CurrentUser() user: JwtPayload, @Args('input') input: CreateProductoDto) {
    return this.productosService.create(input, user.rol, user.sucursal_id);
  }

  @Mutation(() => ProductoType)
  updateProducto(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateProductoDto,
  ) {
    return this.productosService.update(id, input, user.rol, user.sucursal_id);
  }

  @Mutation(() => ProductoPayloadType)
  deleteProducto(@CurrentUser() user: JwtPayload, @Args('id', { type: () => Int }) id: number) {
    return this.productosService.delete(id, user.rol, user.sucursal_id);
  }
}
