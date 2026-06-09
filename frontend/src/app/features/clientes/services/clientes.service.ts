import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import {
    CREATE_CLIENTE_MUTATION,
    DELETE_CLIENTE_MUTATION,
    CLIENTE_QUERY,
    CLIENTES_QUERY,
    UPDATE_CLIENTE_MUTATION,
} from '../graphql/clientes.operations';
import {
    Cliente,
    ClientePayload,
    CreateClienteInput,
    UpdateClienteInput,
    ClientesFilters,
} from '../models/cliente.interface';

@Injectable({
    providedIn: 'root',
})
export class ClientesService {
    private apollo = inject(Apollo);

    list(filters: ClientesFilters = {}): Observable<Cliente[]> {
        return this.apollo
            .watchQuery<
                { clientes: Cliente[] },
                { sucursalId?: number | null }
            >({
                query: CLIENTES_QUERY,
                variables: {
                    sucursalId: filters.sucursalId ?? null,
                },
                fetchPolicy: 'network-only',
            })
            .valueChanges.pipe(
                map((res) => {
                    if (res.errors?.length) {
                        throw new Error(res.errors[0].message);
                    }
                    return res.data.clientes;
                }),
            );
    }

    get(id: number): Observable<Cliente> {
        return this.apollo
            .watchQuery<{ cliente: Cliente }, { id: number }>({
                query: CLIENTE_QUERY,
                variables: { id },
                fetchPolicy: 'network-only',
            })
            .valueChanges.pipe(
                map((res) => {
                    if (res.errors?.length) {
                        throw new Error(res.errors[0].message);
                    }
                    return res.data.cliente;
                }),
            );
    }

    create(input: CreateClienteInput): Observable<ClientePayload> {
        return this.apollo
            .mutate<
                { createCliente: ClientePayload },
                { input: CreateClienteInput }
            >({
                mutation: CREATE_CLIENTE_MUTATION,
                variables: { input },
            })
            .pipe(
                map((res) => {
                    const err = res.errors?.[0]?.message;
                    if (err) throw new Error(err);
                    if (!res.data?.createCliente) {
                        throw new Error('Respuesta inválida del servidor');
                    }
                    return res.data.createCliente;
                }),
            );
    }

    update(id: number, input: UpdateClienteInput): Observable<Cliente> {
        return this.apollo
            .mutate<
                { updateCliente: Cliente },
                { id: number; input: UpdateClienteInput }
            >({
                mutation: UPDATE_CLIENTE_MUTATION,
                variables: { id, input },
            })
            .pipe(
                map((res) => {
                    const err = res.errors?.[0]?.message;
                    if (err) throw new Error(err);
                    if (!res.data?.updateCliente) {
                        throw new Error('Respuesta inválida del servidor');
                    }
                    return res.data.updateCliente;
                }),
            );
    }

    delete(id: number): Observable<{ message: string }> {
        return this.apollo
            .mutate<
                { deleteCliente: { message: string } },
                { id: number }
            >({
                mutation: DELETE_CLIENTE_MUTATION,
                variables: { id },
            })
            .pipe(
                map((res) => {
                    const err = res.errors?.[0]?.message;
                    if (err) throw new Error(err);
                    if (!res.data?.deleteCliente) {
                        throw new Error('Respuesta inválida del servidor');
                    }
                    return res.data.deleteCliente;
                }),
            );
    }
}
