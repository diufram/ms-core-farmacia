import { Routes } from '@angular/router';
import { ComingSoonComponent } from '@/shared/components/coming-soon/coming-soon.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from '@/core/guards/auth.guard';
import { roleGuard } from '@/core/guards/role.guard';
import { MainLayout } from '@/core/layout/component/app.layout';
import { Notfound } from '@/pages/notfound/notfound';

const EMPLEADO_ROLES = ['super_admin', 'admin'];
const SOLO_SUPER_ADMIN = ['super_admin'];

export const DASHBOARD_ROUTES: Routes = [
    {
        path: '',
        component: MainLayout,
        canActivate: [authGuard],
        children: [
            { path: '', component: DashboardComponent, title: 'Dashboard' },
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
