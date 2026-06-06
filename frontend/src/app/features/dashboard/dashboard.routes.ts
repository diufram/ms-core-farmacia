import { Routes } from '@angular/router';
import { ComingSoonComponent } from '@/shared/components/coming-soon/coming-soon.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from '@/core/guards/auth.guard';
import { MainLayout } from '@/core/layout/component/app.layout';
import { Notfound } from '@/pages/notfound/notfound';

export const DASHBOARD_ROUTES: Routes = [
    {
        path: '',
        component: MainLayout,
        canActivate: [authGuard],
        children: [
            { path: '', component: DashboardComponent, title: 'Dashboard' },
            {
                path: 'sucursales',
                loadChildren: () =>
                    import('@/features/sucursales/sucursales.routes').then(
                        (m) => m.SUCURSALES_ROUTES,
                    ),
            },
            {
                path: 'usuarios',
                loadChildren: () =>
                    import('@/features/usuarios/usuarios.routes').then(
                        (m) => m.USUARIOS_ROUTES,
                    ),
            },
            {
                path: 'categorias',
                loadChildren: () =>
                    import('@/features/categorias/categorias.routes').then(
                        (m) => m.CATEGORIAS_ROUTES,
                    ),
            },
            {
                path: 'productos',
                loadChildren: () =>
                    import('@/features/productos/productos.routes').then(
                        (m) => m.PRODUCTOS_ROUTES,
                    ),
            },
            {
                path: 'clientes',
                component: ComingSoonComponent,
                data: { title: 'Clientes' },
                title: 'Clientes',
            },
            {
                path: 'reportes/ventas',
                component: ComingSoonComponent,
                data: { title: 'Reporte de Ventas' },
                title: 'Reporte de Ventas',
            },
            {
                path: 'reportes/inventario',
                component: ComingSoonComponent,
                data: { title: 'Reporte de Inventario' },
                title: 'Reporte de Inventario',
            },
        ],
    },
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' },
];
