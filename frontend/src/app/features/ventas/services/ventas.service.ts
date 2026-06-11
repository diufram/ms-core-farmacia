import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import {
    CAMBIAR_ESTADO_VENTA_MUTATION,
    CREATE_VENTA_MUTATION,
    DELETE_VENTA_MUTATION,
    VENTA_QUERY,
    VENTAS_QUERY,
    VERIFICAR_INTEGRIDAD_QUERY,
} from '../graphql/ventas.operations';
import {
    CreateVentaInput,
    EstadoVenta,
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
        const sucursalId =
            filters.sucursalId != null ? Number(filters.sucursalId) : null;
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
                    sucursalId,
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

    cambiarEstado(
        id: number,
        nuevoEstado: EstadoVenta,
    ): Observable<VentaPayload> {
        return this.apollo
            .mutate<
                { cambiarEstadoVenta: VentaPayload },
                { id: number; nuevoEstado: string }
            >({
                mutation: CAMBIAR_ESTADO_VENTA_MUTATION,
                variables: { id, nuevoEstado },
            })
            .pipe(
                map((res) => {
                    const err = res.errors?.[0]?.message;
                    if (err) throw new Error(err);
                    if (!res.data?.cambiarEstadoVenta) {
                        throw new Error('Respuesta inválida del servidor');
                    }
                    return res.data.cambiarEstadoVenta;
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

    verificarIntegridad(id: number): Observable<{ isVerified: boolean; currentHash: string; blockchainHash: string }> {
        return this.apollo
            .query<any>({
                query: VERIFICAR_INTEGRIDAD_QUERY,
                variables: { id },
                fetchPolicy: 'network-only',
            })
            .pipe(
                map((res) => res.data.verificarIntegridadVenta),
            );
    }
}
