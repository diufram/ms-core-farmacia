import { Routes } from '@angular/router';
import { authGuard } from '@/core/guards/auth.guard';
import { SucursalesListComponent } from './pages/sucursales-list/sucursales-list.component';
import { SucursalFormComponent } from './pages/sucursal-form/sucursal-form.component';

export const SUCURSALES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: SucursalesListComponent,
        title: 'Sucursales'
      },
      {
        path: 'nueva',
        component: SucursalFormComponent,
        title: 'Nueva Sucursal'
      },
      {
        path: ':id/editar',
        component: SucursalFormComponent,
        title: 'Editar Sucursal'
      }
    ]
  }
];
