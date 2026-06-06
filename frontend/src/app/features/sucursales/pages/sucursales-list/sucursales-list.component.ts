import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { SharedTableComponent } from '@/shared/components/shared-table/shared-table.component';
import {
    TableColumn,
    RowAction,
} from '@/shared/components/shared-table/interfaces/table-config.interface';
import { ToastService } from '@/core/services/toast.service';
import { SucursalesService } from '../../services/sucursales.service';
import { Sucursal } from '../../models/sucursal.interface';

@Component({
    selector: 'app-sucursales-list',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        ConfirmDialogModule,
        SharedTableComponent,
    ],
    providers: [ConfirmationService],
    template: `
        <div class="card">
            <app-shared-table
                [data]="sucursales()"
                [columns]="columns"
                [rowActions]="rowActions"
                [loading]="loading()"
                [searchFields]="['nombre', 'slug', 'ciudad', 'direccion', 'telefono']"
                title="Sucursales"
                dataKey="id"
                (actionClicked)="onAction($event)"
            >
                <p-button
                    icon="pi pi-plus"
                    label="Nueva Sucursal"
                    (onClick)="nueva()"
                />
            </app-shared-table>
        </div>
        <p-confirmDialog />
    `,
})
export class SucursalesListComponent implements OnInit {
    private sucursalesService = inject(SucursalesService);
    private toast = inject(ToastService);
    private router = inject(Router);
    private confirmation = inject(ConfirmationService);

    sucursales = signal<Sucursal[]>([]);
    loading = signal<boolean>(true);

    columns: TableColumn[] = [
        { field: 'id', header: 'ID', type: 'text', width: '80px' },
        { field: 'nombre', header: 'Nombre', type: 'text' },
        { field: 'slug', header: 'Slug', type: 'text', width: '180px' },
        { field: 'ciudad', header: 'Ciudad', type: 'text' },
        { field: 'direccion', header: 'Dirección', type: 'text' },
        { field: 'telefono', header: 'Teléfono', type: 'text', width: '140px' },
        { field: 'acciones', header: 'Acciones', type: 'actions', width: '120px' },
    ];

    rowActions: RowAction[] = [
        {
            key: 'edit',
            icon: 'pi pi-pencil',
            tooltip: 'Editar',
            severity: 'primary',
        },
        {
            key: 'delete',
            icon: 'pi pi-trash',
            tooltip: 'Eliminar',
            severity: 'danger',
        },
    ];

    ngOnInit(): void {
        this.cargar();
    }

    cargar(): void {
        this.loading.set(true);
        this.sucursalesService.list().subscribe({
            next: (data) => {
                this.sucursales.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                this.loading.set(false);
                this.toast.error(err, 'No se pudieron cargar las sucursales');
            },
        });
    }

    nueva(): void {
        this.router.navigate(['/home/sucursales/nueva']);
    }

    onAction(event: { action: string; data: Sucursal }): void {
        if (event.action === 'edit') {
            this.router.navigate(['/home/sucursales', event.data.id, 'editar']);
        } else if (event.action === 'delete') {
            this.confirmarEliminar(event.data);
        }
    }

    private confirmarEliminar(sucursal: Sucursal): void {
        this.confirmation.confirm({
            message: `¿Eliminar la sucursal "${sucursal.nombre}"? Esta acción no se puede deshacer.`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.eliminar(sucursal),
        });
    }

    private eliminar(sucursal: Sucursal): void {
        this.sucursalesService.delete(sucursal.id).subscribe({
            next: (res) => {
                this.toast.success(res.message);
                this.cargar();
            },
            error: (err) => this.toast.error(err),
        });
    }
}
