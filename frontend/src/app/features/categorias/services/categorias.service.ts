import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import {
    CATEGORIAS_QUERY,
    CATEGORIA_QUERY,
    CREATE_CATEGORIA_MUTATION,
    DELETE_CATEGORIA_MUTATION,
    UPDATE_CATEGORIA_MUTATION,
} from '../graphql/categorias.operations';
import {
    Categoria,
    CategoriaPayload,
    CreateCategoriaInput,
    UpdateCategoriaInput,
} from '../models/categoria.interface';

@Injectable({
    providedIn: 'root',
})
export class CategoriasService {
    private apollo = inject(Apollo);

    list(sucursalId?: number | null): Observable<Categoria[]> {
        return this.apollo
            .watchQuery<
                { categorias: Categoria[] },
                { sucursalId?: number | null }
            >({
                query: CATEGORIAS_QUERY,
                variables: { sucursalId: sucursalId ?? null },
                fetchPolicy: 'network-only',
            })
            .valueChanges.pipe(
                map((res) => {
                    if (res.errors?.length) {
                        throw new Error(res.errors[0].message);
                    }
                    return res.data.categorias;
                }),
            );
    }

    get(id: number): Observable<Categoria> {
        return this.apollo
            .watchQuery<{ categoria: Categoria }, { id: number }>({
                query: CATEGORIA_QUERY,
                variables: { id },
                fetchPolicy: 'network-only',
            })
            .valueChanges.pipe(
                map((res) => {
                    if (res.errors?.length) {
                        throw new Error(res.errors[0].message);
                    }
                    return res.data.categoria;
                }),
            );
    }

    create(input: CreateCategoriaInput): Observable<CategoriaPayload> {
        return this.apollo
            .mutate<
                { createCategoria: CategoriaPayload },
                { input: CreateCategoriaInput }
            >({
                mutation: CREATE_CATEGORIA_MUTATION,
                variables: { input },
            })
            .pipe(
                map((res) => {
                    const err = res.errors?.[0]?.message;
                    if (err) throw new Error(err);
                    if (!res.data?.createCategoria) {
                        throw new Error('Respuesta inválida del servidor');
                    }
                    return res.data.createCategoria;
                }),
            );
    }

    update(
        id: number,
        input: UpdateCategoriaInput,
    ): Observable<Categoria> {
        return this.apollo
            .mutate<
                { updateCategoria: Categoria },
                { id: number; input: UpdateCategoriaInput }
            >({
                mutation: UPDATE_CATEGORIA_MUTATION,
                variables: { id, input },
            })
            .pipe(
                map((res) => {
                    const err = res.errors?.[0]?.message;
                    if (err) throw new Error(err);
                    if (!res.data?.updateCategoria) {
                        throw new Error('Respuesta inválida del servidor');
                    }
                    return res.data.updateCategoria;
                }),
            );
    }

    delete(id: number): Observable<{ message: string }> {
        return this.apollo
            .mutate<{ deleteCategoria: { message: string } }, { id: number }>({
                mutation: DELETE_CATEGORIA_MUTATION,
                variables: { id },
            })
            .pipe(
                map((res) => {
                    const err = res.errors?.[0]?.message;
                    if (err) throw new Error(err);
                    if (!res.data?.deleteCategoria) {
                        throw new Error('Respuesta inválida del servidor');
                    }
                    return res.data.deleteCategoria;
                }),
            );
    }
}
