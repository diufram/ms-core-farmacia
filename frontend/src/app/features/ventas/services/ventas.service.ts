import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import {
    CREATE_VENTA_MUTATION,
    DELETE_VENTA_MUTATION,
    VENTA_QUERY,
    VENTAS_QUERY,
} from '../graphql/ventas.operations';
import {
    CreateVentaInput,
    Venta,
    VentaPayload,
    VentasFilters,
} from '../models/venta.interface';

@Injectable({
    providedIn: 'root',
})
export class VentasService {
    private apollo = inject(Apollo);

    list(filters: VentasFilters = {}): Observable<Venta[]> {
        return this.apollo
            .watchQuery<
                { ventas: Venta[] },
                {
                    sucursalId?: number | null;
                    fechaDesde?: string | null;
                    fechaHasta?: string | null;
                }
            >({
                query: VENTAS_QUERY,
                variables: {
                    sucursalId: filters.sucursalId ?? null,
                    fechaDesde: filters.fechaDesde ?? null,
                    fechaHasta: filters.fechaHasta ?? null,
                },
                fetchPolicy: 'network-only',
            })
            .valueChanges.pipe(
                map((res) => {
                    if (res.errors?.length) {
                        throw new Error(res.errors[0].message);
                    }
                    return res.data.ventas;
                }),
            );
    }

    get(id: number): Observable<Venta> {
        return this.apollo
            .watchQuery<{ venta: Venta }, { id: number }>({
                query: VENTA_QUERY,
                variables: { id },
                fetchPolicy: 'network-only',
            })
            .valueChanges.pipe(
                map((res) => {
                    if (res.errors?.length) {
                        throw new Error(res.errors[0].message);
                    }
                    return res.data.venta;
                }),
            );
    }

    create(input: CreateVentaInput): Observable<VentaPayload> {
        return this.apollo
            .mutate<
                { createVenta: VentaPayload },
                { input: CreateVentaInput }
            >({
                mutation: CREATE_VENTA_MUTATION,
                variables: { input },
            })
            .pipe(
                map((res) => {
                    const err = res.errors?.[0]?.message;
                    if (err) throw new Error(err);
                    if (!res.data?.createVenta) {
                        throw new Error('Respuesta inválida del servidor');
                    }
                    return res.data.createVenta;
                }),
            );
    }

    delete(id: number): Observable<{ message: string }> {
        return this.apollo
            .mutate<
                { deleteVenta: { message: string } },
                { id: number }
            >({
                mutation: DELETE_VENTA_MUTATION,
                variables: { id },
            })
            .pipe(
                map((res) => {
                    const err = res.errors?.[0]?.message;
                    if (err) throw new Error(err);
                    if (!res.data?.deleteVenta) {
                        throw new Error('Respuesta inválida del servidor');
                    }
                    return res.data.deleteVenta;
                }),
            );
    }
}
