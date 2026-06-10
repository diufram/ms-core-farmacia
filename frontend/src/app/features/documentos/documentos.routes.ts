import { Routes } from '@angular/router';
import { authGuard } from '@/core/guards/auth.guard';
import { DocumentosListComponent } from './pages/documentos-list/documentos-list.component';
import { DocumentoUploadComponent } from './pages/documento-upload/documento-upload.component';
import { DocumentoDetailComponent } from './pages/documento-detail/documento-detail.component';

export const DOCUMENTOS_ROUTES: Routes = [
    {
        path: '',
        canActivate: [authGuard],
        children: [
            {
                path: '',
                component: DocumentosListComponent,
                title: 'Documentos',
            },
            {
                path: 'subir',
                component: DocumentoUploadComponent,
                title: 'Subir Documento',
            },
            {
                path: ':id',
                component: DocumentoDetailComponent,
                title: 'Detalle Documento',
            },
        ],
    },
];
