export interface Sucursal {
  id: number;
  nombre: string;
  slug: string;
  telefono?: string | null;
  direccion: string;
  ciudad?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  logo?: string | null;
}

export interface SucursalAdmin {
  id: number;
  nombre_usuario: string;
  correo_electronico: string;
}

export interface SucursalPayload {
  sucursal: Sucursal;
  message: string;
}

export interface CreateSucursalPayload extends SucursalPayload {
  admin: SucursalAdmin;
}

export interface CreateSucursalInput {
  nombre: string;
  telefono?: string;
  direccion: string;
  ciudad?: string;
  latitud?: number;
  longitud?: number;
  nombre_admin: string;
  apellido_admin: string;
  celular_admin?: string;
  nombre_usuario_admin: string;
  correo_admin: string;
  contrasena_admin: string;
}

export type UpdateSucursalInput = Partial<
  Pick<CreateSucursalInput, 'nombre' | 'telefono' | 'direccion' | 'ciudad' | 'latitud' | 'longitud'>
>;
