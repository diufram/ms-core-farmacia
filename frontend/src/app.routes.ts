import { Routes } from '@angular/router';
import { authGuard } from '@/core/guards/auth.guard';
import { Notfound } from '@/pages/notfound/notfound';

export const appRoutes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  {
    path: 'auth',
    loadChildren: () => import('@/features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },

  {
    path: 'home',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@/features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES)
  },

  { path: 'notfound', component: Notfound },
  { path: '**', redirectTo: '/notfound' }
];
