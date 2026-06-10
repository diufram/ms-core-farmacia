export type Rol = 'super_admin' | 'admin' | 'cliente';

export interface Persona {
    id: number;
    nombre: string;
    apellido: string;
    celular?: string | null;
}

export interface SucursalSimple {
    id: number;
    nombre: string;
}

export interface UsuarioAsignacion {
    id: number;
    sucursal: SucursalSimple;
    activo: boolean;
}

export interface Usuario {
    id: number;
    nombre_usuario: string;
    correo_electronico: string;
    rol: Rol;
    persona: Persona;
    asignaciones: UsuarioAsignacion[];
}

export interface UsuarioPayload {
    usuario: Usuario;
    message: string;
}

export interface SucursalAsignacionInput {
    sucursalId: number;
}

export interface CreateUsuarioInput {
    persona: {
        nombre: string;
        apellido: string;
        celular?: string;
    };
    nombre_usuario: string;
    correo_electronico: string;
    contrasena: string;
    rol?: Rol;
    sucursales?: SucursalAsignacionInput[];
}

export interface UpdateUsuarioInput {
    persona?: {
        nombre?: string;
        apellido?: string;
        celular?: string;
    };
    nombre_usuario?: string;
    correo_electronico?: string;
    rol?: Rol;
    activo?: boolean;
}

export interface AssignSucursalInput {
    sucursalId: number;
}
