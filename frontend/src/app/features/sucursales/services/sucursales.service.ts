import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import {
    CREATE_SUCURSAL_MUTATION,
    DELETE_SUCURSAL_MUTATION,
    SUCURSALES_QUERY,
    SUCURSAL_QUERY,
    UPDATE_SUCURSAL_MUTATION,
} from '../graphql/sucursales.operations';
import {
    CreateSucursalInput,
    CreateSucursalPayload,
    Sucursal,
    SucursalPayload,
    UpdateSucursalInput,
} from '../models/sucursal.interface';

@Injectable({
    providedIn: 'root',
})
export class SucursalesService {
    private apollo = inject(Apollo);

    list(): Observable<Sucursal[]> {
        return this.apollo
            .watchQuery<{ sucursales: Sucursal[] }>({
                query: SUCURSALES_QUERY,
                fetchPolicy: 'network-only',
            })
            .valueChanges.pipe(
                map((res) => {
                    if (res.errors?.length) {
                        throw new Error(res.errors[0].message);
                    }
                    return res.data.sucursales;
                }),
            );
    }

    get(id: number): Observable<Sucursal> {
        return this.apollo
            .watchQuery<{ sucursal: Sucursal }>({
                query: SUCURSAL_QUERY,
                variables: { id },
                fetchPolicy: 'network-only',
            })
            .valueChanges.pipe(
                map((res) => {
                    if (res.errors?.length) {
                        throw new Error(res.errors[0].message);
                    }
                    return res.data.sucursal;
                }),
            );
    }

    create(input: CreateSucursalInput): Observable<CreateSucursalPayload> {
        return this.apollo
            .mutate<{ createSucursal: CreateSucursalPayload }>({
                mutation: CREATE_SUCURSAL_MUTATION,
                variables: { input },
            })
            .pipe(
                map((res) => {
                    const err = res.errors?.[0]?.message;
                    if (err) throw new Error(err);
                    if (!res.data?.createSucursal) {
                        throw new Error('Respuesta inválida del servidor');
                    }
                    return res.data.createSucursal;
                }),
            );
    }

    update(
        id: number,
        input: UpdateSucursalInput,
    ): Observable<SucursalPayload> {
        return this.apollo
            .mutate<{ updateSucursal: SucursalPayload }>({
                mutation: UPDATE_SUCURSAL_MUTATION,
                variables: { id, input },
            })
            .pipe(
                map((res) => {
                    const err = res.errors?.[0]?.message;
                    if (err) throw new Error(err);
                    if (!res.data?.updateSucursal) {
                        throw new Error('Respuesta inválida del servidor');
                    }
                    return res.data.updateSucursal;
                }),
            );
    }

    delete(id: number): Observable<{ message: string }> {
        return this.apollo
            .mutate<{ deleteSucursal: { message: string } }>({
                mutation: DELETE_SUCURSAL_MUTATION,
                variables: { id },
            })
            .pipe(
                map((res) => {
                    const err = res.errors?.[0]?.message;
                    if (err) throw new Error(err);
                    if (!res.data?.deleteSucursal) {
                        throw new Error('Respuesta inválida del servidor');
                    }
                    return res.data.deleteSucursal;
                }),
            );
    }
}
