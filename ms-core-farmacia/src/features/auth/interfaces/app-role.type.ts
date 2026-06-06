import { RolGlobal } from '../../../database/entities/usuario.entity';
import { RolSucursal } from '../../../database/entities/usuario-sucursal.entity';

export type AppRole = RolGlobal | RolSucursal;
