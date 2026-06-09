import { Routes } from '@angular/router';
import { authGuard } from '@/core/guards/auth.guard';
import { VentasListComponent } from './pages/ventas-list/ventas-list.component';
import { VentaFormComponent } from './pages/venta-form/venta-form.component';

export const VENTAS_ROUTES: Routes = [
    {
        path: '',
        canActivate: [authGuard],
        children: [
            {
                path: '',
                component: VentasListComponent,
                title: 'Ventas',
            },
            {
                path: 'nueva',
                component: VentaFormComponent,
                title: 'Nueva Venta',
            },
        ],
    },
];
