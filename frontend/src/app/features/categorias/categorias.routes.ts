import { Routes } from '@angular/router';
import { authGuard } from '@/core/guards/auth.guard';
import { CategoriasListComponent } from './pages/categorias-list/categorias-list.component';
import { CategoriaFormComponent } from './pages/categoria-form/categoria-form.component';

export const CATEGORIAS_ROUTES: Routes = [
    {
        path: '',
        canActivate: [authGuard],
        children: [
            {
                path: '',
                component: CategoriasListComponent,
                title: 'Categorías',
            },
            {
                path: 'nueva',
                component: CategoriaFormComponent,
                title: 'Nueva Categoría',
            },
            {
                path: ':id/editar',
                component: CategoriaFormComponent,
                title: 'Editar Categoría',
            },
        ],
    },
];
