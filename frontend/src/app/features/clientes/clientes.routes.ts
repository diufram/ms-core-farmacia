import { Routes } from '@angular/router';
import { authGuard } from '@/core/guards/auth.guard';
import { ClientesListComponent } from './pages/clientes-list/clientes-list.component';
import { ClienteFormComponent } from './pages/cliente-form/cliente-form.component';

export const CLIENTES_ROUTES: Routes = [
    {
        path: '',
        canActivate: [authGuard],
        children: [
            {
                path: '',
                component: ClientesListComponent,
                title: 'Clientes',
            },
            {
                path: 'nuevo',
                component: ClienteFormComponent,
                title: 'Nuevo Cliente',
            },
            {
                path: ':id/editar',
                component: ClienteFormComponent,
                title: 'Editar Cliente',
            },
        ],
    },
];
