import { Routes } from '@angular/router';
import { authGuard } from '@/core/guards/auth.guard';
import { ProductosListComponent } from './pages/productos-list/productos-list.component';
import { ProductoFormComponent } from './pages/producto-form/producto-form.component';

export const PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ProductosListComponent,
        title: 'Productos'
      },
      {
        path: 'nuevo',
        component: ProductoFormComponent,
        title: 'Nuevo Producto'
      },
      {
        path: ':id/editar',
        component: ProductoFormComponent,
        title: 'Editar Producto'
      }
    ]
  }
];
