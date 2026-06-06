export type RolGlobal = 'super_admin' | 'user';
export type RolSucursal = 'admin';

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
    rol: RolSucursal;
    activo: boolean;
}

export interface Usuario {
    id: number;
    nombre_usuario: string;
    correo_electronico: string;
    rol_global: RolGlobal;
    persona: Persona;
    asignaciones: UsuarioAsignacion[];
}

export interface UsuarioPayload {
    usuario: Usuario;
    message: string;
}

export interface SucursalAsignacionInput {
    sucursalId: number;
    rol?: RolSucursal;
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
    rol_global?: RolGlobal;
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
    rol_global?: RolGlobal;
    activo?: boolean;
}

export interface AssignSucursalInput {
    sucursalId: number;
    rol: RolSucursal;
}
