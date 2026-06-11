import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import {
  CREATE_PRODUCTO_MUTATION,
  DELETE_PRODUCTO_MUTATION,
  PRODUCTO_QUERY,
  PRODUCTOS_QUERY,
  UPDATE_PRODUCTO_MUTATION
} from '../graphql/productos.operations';
import {
  CreateProductoInput,
  Producto,
  ProductoPayload,
  UpdateProductoInput
} from '../models/producto.interface';

export interface ProductosFilters {
  sucursalId?: number | null;
  categoriaId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apollo = inject(Apollo);

  list(filters: ProductosFilters = {}): Observable<Producto[]> {
    const sucursalId = filters.sucursalId != null ? Number(filters.sucursalId) : null;
    const categoriaId = filters.categoriaId != null ? Number(filters.categoriaId) : null;

    return this.apollo
      .watchQuery<
        { productos: Producto[] },
        {
          sucursalId?: number | null;
          categoriaId?: number | null;
        }
      >({
        query: PRODUCTOS_QUERY,
        variables: {
          sucursalId,
          categoriaId
        },
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(
        map((res) => {
          if (res.errors?.length) {
            throw new Error(res.errors[0].message);
          }

          return res.data.productos;
        })
      );
  }

  get(id: number): Observable<Producto> {
    return this.apollo
      .watchQuery<{ producto: Producto }, { id: number }>({
        query: PRODUCTO_QUERY,
        variables: { id },
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(
        map((res) => {
          if (res.errors?.length) {
            throw new Error(res.errors[0].message);
          }

          return res.data.producto;
        })
      );
  }

  create(input: CreateProductoInput): Observable<ProductoPayload> {
    return this.apollo
      .mutate<{ createProducto: ProductoPayload }, { input: CreateProductoInput }>({
        mutation: CREATE_PRODUCTO_MUTATION,
        variables: { input }
      })
      .pipe(
        map((res) => {
          const err = res.errors?.[0]?.message;

          if (err) throw new Error(err);

          if (!res.data?.createProducto) {
            throw new Error('Respuesta inválida del servidor');
          }

          return res.data.createProducto;
        })
      );
  }

  update(id: number, input: UpdateProductoInput): Observable<Producto> {
    return this.apollo
      .mutate<{ updateProducto: Producto }, { id: number; input: UpdateProductoInput }>({
        mutation: UPDATE_PRODUCTO_MUTATION,
        variables: { id, input }
      })
      .pipe(
        map((res) => {
          const err = res.errors?.[0]?.message;

          if (err) throw new Error(err);

          if (!res.data?.updateProducto) {
            throw new Error('Respuesta inválida del servidor');
          }

          return res.data.updateProducto;
        })
      );
  }

  delete(id: number): Observable<{ message: string }> {
    return this.apollo
      .mutate<{ deleteProducto: { message: string } }, { id: number }>({
        mutation: DELETE_PRODUCTO_MUTATION,
        variables: { id }
      })
      .pipe(
        map((res) => {
          const err = res.errors?.[0]?.message;

          if (err) throw new Error(err);

          if (!res.data?.deleteProducto) {
            throw new Error('Respuesta inválida del servidor');
          }

          return res.data.deleteProducto;
        })
      );
  }
}
