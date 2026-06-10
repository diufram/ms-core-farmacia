import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

import { SharedTableComponent } from '@/shared/components/shared-table/shared-table.component';
import {
    TableColumn,
    RowAction,
} from '@/shared/components/shared-table/interfaces/table-config.interface';
import { ToastService } from '@/core/services/toast.service';
import { AuthService } from '@/features/auth/services/auth.service';
import { SucursalesService } from '@/features/sucursales/services/sucursales.service';
import { Sucursal } from '@/features/sucursales/models/sucursal.interface';
import { CategoriasService } from '../../services/categorias.service';
import { Categoria } from '../../models/categoria.interface';

@Component({
    selector: 'app-categorias-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        ConfirmDialogModule,
        SelectModule,
        SharedTableComponent,
    ],
    providers: [ConfirmationService],
    template: `
        <div class="card">
            <app-shared-table
                [data]="categorias()"
                [columns]="columns"
                [rowActions]="rowActions"
                [loading]="loading()"
                [searchFields]="['nombre', 'codigo']"
                title="Categorías"
                dataKey="id"
                (actionClicked)="onAction($event)"
            >
                <p-select
                    table-filters
                    *ngIf="esSuperAdmin()"
                    [options]="sucursales()"
                    [(ngModel)]="filtroSucursalId"
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Todas las sucursales"
                    [showClear]="true"
                    (onChange)="cargar()"
                    appendTo="body"
                    styleClass="min-w-[200px]"
                />

                <p-button
                    table-filters
                    icon="pi pi-refresh"
                    severity="secondary"
                    [outlined]="true"
                    (onClick)="cargar()"
                    pTooltip="Recargar"
                />

                <p-button
                    table-actions
                    icon="pi pi-plus"
                    label="Nueva Categoría"
                    (onClick)="nueva()"
                />
            </app-shared-table>
            <p-confirmDialog />
        </div>
    `,
})
export class CategoriasListComponent implements OnInit {
    private categoriasService = inject(CategoriasService);
    private sucursalesService = inject(SucursalesService);
    private auth = inject(AuthService);
    private toast = inject(ToastService);
    private router = inject(Router);
    private confirmation = inject(ConfirmationService);

    categorias = signal<Categoria[]>([]);
    sucursales = signal<Sucursal[]>([]);
    loading = signal<boolean>(true);
    filtroSucursalId: number | null = null;

    columns: TableColumn[] = [
        { field: 'id', header: 'ID', type: 'text', width: '70px' },
        { field: 'codigo', header: 'Código', type: 'text', width: '180px' },
        { field: 'nombre', header: 'Nombre', type: 'text' },
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
        const user = this.auth.currentUser();
        if (user?.sucursal_id) {
            this.filtroSucursalId = user.sucursal_id;
        }
        if (this.esSuperAdmin()) {
            this.cargarSucursales();
        }
        this.cargar();
    }

    esSuperAdmin(): boolean {
        return this.auth.currentUser()?.rol === 'super_admin';
    }

    cargar(): void {
        this.loading.set(true);
        this.categoriasService
            .list(this.filtroSucursalId)
            .subscribe({
                next: (data) => {
                    this.categorias.set(data);
                    this.loading.set(false);
                },
                error: (err) => {
                    this.loading.set(false);
                    this.toast.error(err, 'No se pudieron cargar las categorías');
                },
            });
    }

    cargarSucursales(): void {
        this.sucursalesService.list().subscribe({
            next: (data) => this.sucursales.set(data),
            error: () => undefined,
        });
    }

    nueva(): void {
        this.router.navigate(['/home/categorias/nueva']);
    }

    onAction(event: { action: string; data: Categoria }): void {
        if (event.action === 'edit') {
            this.router.navigate(['/home/categorias', event.data.id, 'editar']);
        } else if (event.action === 'delete') {
            this.confirmarEliminar(event.data);
        }
    }

    private confirmarEliminar(cat: Categoria): void {
        this.confirmation.confirm({
            message: `¿Eliminar la categoría "${cat.nombre}"? Los productos que la usen no se borrarán, pero quedarán sin categoría válida.`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.eliminar(cat),
        });
    }

    private eliminar(cat: Categoria): void {
        this.categoriasService.delete(cat.id).subscribe({
            next: (res) => {
                this.toast.success(res.message);
                this.cargar();
            },
            error: (err) => this.toast.error(err),
        });
    }
}
