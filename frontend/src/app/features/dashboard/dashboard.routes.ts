import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from '@/core/guards/auth.guard';
import { roleGuard } from '@/core/guards/role.guard';
import { MainLayout } from '@/core/layout/component/app.layout';
import { Notfound } from '@/pages/notfound/notfound';

const SOLO_SUPER_ADMIN = ['super_admin'];
const EMPLEADO_ROLES = ['super_admin', 'admin'];

export const DASHBOARD_ROUTES: Routes = [
    {
        path: '',
        component: MainLayout,
        canActivate: [authGuard],
        children: [
            { path: '', component: DashboardComponent, title: 'Dashboard' },
            {
                path: 'sucursales',
                canActivate: [roleGuard],
                data: { roles: SOLO_SUPER_ADMIN },
                loadChildren: () =>
                    import('@/features/sucursales/sucursales.routes').then(
                        (m) => m.SUCURSALES_ROUTES,
                    ),
            },
            {
                path: 'usuarios',
                canActivate: [roleGuard],
                data: { roles: SOLO_SUPER_ADMIN },
                loadChildren: () =>
                    import('@/features/usuarios/usuarios.routes').then(
                        (m) => m.USUARIOS_ROUTES,
                    ),
            },
            {
                path: 'categorias',
                canActivate: [roleGuard],
                data: { roles: EMPLEADO_ROLES },
                loadChildren: () =>
                    import('@/features/categorias/categorias.routes').then(
                        (m) => m.CATEGORIAS_ROUTES,
                    ),
            },
            {
                path: 'productos',
                canActivate: [roleGuard],
                data: { roles: EMPLEADO_ROLES },
                loadChildren: () =>
                    import('@/features/productos/productos.routes').then(
                        (m) => m.PRODUCTOS_ROUTES,
                    ),
            },
            {
                path: 'ventas',
                loadChildren: () =>
                    import('@/features/ventas/ventas.routes').then(
                        (m) => m.VENTAS_ROUTES,
                    ),
            },
            {
                path: 'documentos',
                canActivate: [roleGuard],
                data: { roles: EMPLEADO_ROLES },
                loadChildren: () =>
                    import('@/features/documentos/documentos.routes').then(
                        (m) => m.DOCUMENTOS_ROUTES,
                    ),
            },
        ],
    },
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' },
];
