export interface Sucursal {
  id: number;
  nombre: string;
  slug: string;
}

export interface Usuario {
  id: number;
  nombre_usuario: string;
  correo_electronico: string;
  rol: 'super_admin' | 'admin' | 'cliente';
  sucursal?: Sucursal | null;
  sucursal_id?: number | null;
}

export interface AuthPayload {
  access_token: string;
  refresh_token: string;
  message: string;
  usuario: Usuario;
}

export interface LoginRequest {
  correo_electronico: string;
  contrasena: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  nombre_usuario: string;
  correo_electronico: string;
  contrasena: string;
  celular?: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}
