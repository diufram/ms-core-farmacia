import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import {
    ADMIN_RESET_PASSWORD_MUTATION,
    ASSIGN_USUARIO_SUCURSAL_MUTATION,
    CREATE_USUARIO_MUTATION,
    DELETE_USUARIO_MUTATION,
    UNASSIGN_USUARIO_SUCURSAL_MUTATION,
    UPDATE_USUARIO_MUTATION,
    USUARIO_QUERY,
    USUARIOS_QUERY,
} from '../graphql/usuarios.operations';
import {
    AssignSucursalInput,
    CreateUsuarioInput,
    Rol,
    UpdateUsuarioInput,
    Usuario,
    UsuarioPayload,
} from '../models/usuario.interface';

export interface UsuariosFilters {
    sucursalId?: number | null;
    rol?: Rol | null;
}

@Injectable({
    providedIn: 'root',
})
export class UsuariosService {
    private apollo = inject(Apollo);

    list(filters: UsuariosFilters = {}): Observable<Usuario[]> {
        const sucursalId =
            filters.sucursalId != null ? Number(filters.sucursalId) : null;
        return this.apollo
            .watchQuery<
                { usuarios: Usuario[] },
                { sucursalId?: number | null; rol?: string | null }
            >({
                query: USUARIOS_QUERY,
                variables: {
                    sucursalId,
                    rol: filters.rol ?? null,
                },
                fetchPolicy: 'network-only',
            })
            .valueChanges.pipe(
                map((res) => {
                    if (res.errors?.length) {
                        throw new Error(res.errors[0].message);
                    }
                    return res.data.usuarios;
                }),
            );
    }

    get(id: number): Observable<Usuario> {
        return this.apollo
            .watchQuery<{ usuario: Usuario }, { id: number }>({
                query: USUARIO_QUERY,
                variables: { id },
                fetchPolicy: 'network-only',
            })
            .valueChanges.pipe(
                map((res) => {
                    if (res.errors?.length) {
                        throw new Error(res.errors[0].message);
                    }
                    return res.data.usuario;
                }),
            );
    }

    create(input: CreateUsuarioInput): Observable<UsuarioPayload> {
        return this.apollo
            .mutate<{ createUsuario: UsuarioPayload }, { input: CreateUsuarioInput }>({
                mutation: CREATE_USUARIO_MUTATION,
                variables: { input },
            })
            .pipe(
                map((res) => {
                    const err = res.errors?.[0]?.message;
                    if (err) throw new Error(err);
                    if (!res.data?.createUsuario) {
                        throw new Error('Respuesta inválida del servidor');
                    }
                    return res.data.createUsuario;
                }),
            );
    }

    update(
        id: number,
        input: UpdateUsuarioInput,
    ): Observable<UsuarioPayload> {
        return this.apollo
            .mutate<
                { updateUsuario: UsuarioPayload },
                { id: number; input: UpdateUsuarioInput }
            >({
                mutation: UPDATE_USUARIO_MUTATION,
                variables: { id, input },
            })
            .pipe(
                map((res) => {
                    const err = res.errors?.[0]?.message;
                    if (err) throw new Error(err);
                    if (!res.data?.updateUsuario) {
                        throw new Error('Respuesta inválida del servidor');
                    }
                    return res.data.updateUsuario;
                }),
            );
    }

    delete(id: number): Observable<{ message: string }> {
        return this.apollo
            .mutate<{ deleteUsuario: { message: string } }, { id: number }>({
                mutation: DELETE_USUARIO_MUTATION,
                variables: { id },
            })
            .pipe(
                map((res) => {
                    const err = res.errors?.[0]?.message;
                    if (err) throw new Error(err);
                    if (!res.data?.deleteUsuario) {
                        throw new Error('Respuesta inválida del servidor');
                    }
                    return res.data.deleteUsuario;
                }),
            );
    }

    assignSucursal(
        usuarioId: number,
        input: AssignSucursalInput,
    ): Observable<UsuarioPayload> {
        return this.apollo
            .mutate<
                { assignUsuarioSucursal: UsuarioPayload },
                { usuarioId: number; input: AssignSucursalInput }
            >({
                mutation: ASSIGN_USUARIO_SUCURSAL_MUTATION,
                variables: { usuarioId, input },
            })
            .pipe(
                map((res) => {
                    const err = res.errors?.[0]?.message;
                    if (err) throw new Error(err);
                    if (!res.data?.assignUsuarioSucursal) {
                        throw new Error('Respuesta inválida del servidor');
                    }
                    return res.data.assignUsuarioSucursal;
                }),
            );
    }

    unassignSucursal(
        usuarioId: number,
        sucursalId: number,
    ): Observable<UsuarioPayload> {
        return this.apollo
            .mutate<
                { unassignUsuarioSucursal: UsuarioPayload },
                { usuarioId: number; sucursalId: number }
            >({
                mutation: UNASSIGN_USUARIO_SUCURSAL_MUTATION,
                variables: { usuarioId, sucursalId },
            })
            .pipe(
                map((res) => {
                    const err = res.errors?.[0]?.message;
                    if (err) throw new Error(err);
                    if (!res.data?.unassignUsuarioSucursal) {
                        throw new Error('Respuesta inválida del servidor');
                    }
                    return res.data.unassignUsuarioSucursal;
                }),
            );
    }

    adminResetPassword(
        id: number,
        nuevaContrasena: string,
    ): Observable<{ message: string }> {
        return this.apollo
            .mutate<
                { adminResetUsuarioPassword: { message: string } },
                { id: number; input: { nueva_contrasena: string } }
            >({
                mutation: ADMIN_RESET_PASSWORD_MUTATION,
                variables: {
                    id,
                    input: { nueva_contrasena: nuevaContrasena },
                },
            })
            .pipe(
                map((res) => {
                    const err = res.errors?.[0]?.message;
                    if (err) throw new Error(err);
                    if (!res.data?.adminResetUsuarioPassword) {
                        throw new Error('Respuesta inválida del servidor');
                    }
                    return res.data.adminResetUsuarioPassword;
                }),
            );
    }
}
