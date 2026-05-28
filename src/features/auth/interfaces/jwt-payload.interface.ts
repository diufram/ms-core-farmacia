import { AppRole } from './app-role.type';

export interface JwtPayload {
  sub: number;
  correo_electronico: string;
  rol: AppRole;
  sucursal_id: number | null;
}
