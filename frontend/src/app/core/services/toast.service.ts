import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ToastService {
    private messageService = inject(MessageService);

    success(detail: string, summary: string = 'Éxito') {
        this.messageService.add({
            severity: 'success',
            summary,
            detail,
            life: 4000,
            icon: 'pi pi-check-circle' // Enviamos el icono como dato
        });
    }

    // Ahora soporta recibir el objeto de error del backend directamente
    error(error: any, summary: string = 'Error') {
        let detail = 'Ocurrió un error inesperado';

        if (typeof error === 'string') {
            detail = error;
        } else if (error?.error?.message) {
            detail = error.error.message;
        } else if (error?.message) {
            detail = error.message;
        }

        this.messageService.add({
            severity: 'error',
            summary,
            detail,
            life: 5000,
            icon: 'pi pi-times-circle'
        });
    }

    info(detail: string, summary: string = 'Información') {
        this.messageService.add({
            severity: 'info',
            summary,
            detail,
            life: 4000,
            icon: 'pi pi-info-circle'
        });
    }

    warn(detail: string, summary: string = 'Advertencia') {
        this.messageService.add({
            severity: 'warn',
            summary,
            detail,
            life: 4000,
            icon: 'pi pi-exclamation-triangle'
        });
    }
}
