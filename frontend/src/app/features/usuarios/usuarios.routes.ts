import { Routes } from '@angular/router';
import { authGuard } from '@/core/guards/auth.guard';
import { UsuariosListComponent } from './pages/usuarios-list/usuarios-list.component';
import { UsuarioFormComponent } from './pages/usuario-form/usuario-form.component';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: UsuariosListComponent,
        title: 'Usuarios'
      },
      {
        path: 'nuevo',
        component: UsuarioFormComponent,
        title: 'Nuevo Usuario'
      },
      {
        path: ':id/editar',
        component: UsuarioFormComponent,
        title: 'Editar Usuario'
      }
    ]
  }
];
