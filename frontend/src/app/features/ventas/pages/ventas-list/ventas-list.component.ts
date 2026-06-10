import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DatePickerModule } from 'primeng/datepicker';

import { SharedTableComponent } from '@/shared/components/shared-table/shared-table.component';
import {
    TableColumn,
    RowAction,
} from '@/shared/components/shared-table/interfaces/table-config.interface';
import { ToastService } from '@/core/services/toast.service';
import { AuthService } from '@/features/auth/services/auth.service';
import { SucursalesService } from '@/features/sucursales/services/sucursales.service';
import { Sucursal } from '@/features/sucursales/models/sucursal.interface';
import { VentasService } from '../../services/ventas.service';
import { Venta } from '../../models/venta.interface';

@Component({
    selector: 'app-ventas-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        ConfirmDialogModule,
        SelectModule,
        TagModule,
        InputTextModule,
        IconFieldModule,
        InputIconModule,
        DatePickerModule,
        SharedTableComponent,
    ],
    providers: [ConfirmationService],
    template: `
        <div class="card">
            <div class="flex flex-wrap items-end gap-3 mb-4">
                <div>
                    <h1 class="text-2xl font-semibold text-color m-0">
                        Ventas
                    </h1>
                    <p class="text-muted-color m-0 mt-1">
                        Historial de transacciones
                    </p>
                </div>
            </div>

            <div class="flex flex-wrap items-center gap-3 mb-3">
                <p-iconfield iconPosition="left" class="flex-1 min-w-[220px]">
                    <p-inputicon styleClass="pi pi-search" />
                    <input
                        pInputText
                        type="text"
                        [ngModel]="searchTerm()"
                        (ngModelChange)="searchTerm.set($event)"
                        placeholder="Buscar por número, estado..."
                        class="w-full"
                    />
                </p-iconfield>

                <p-select
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

                <p-date-picker
                    [(ngModel)]="filtroFechaDesde"
                    (onSelect)="cargar()"
                    (onClear)="cargar()"
                    [showClear]="true"
                    placeholder="Desde"
                    styleClass="min-w-[150px]"
                />

                <p-date-picker
                    [(ngModel)]="filtroFechaHasta"
                    (onSelect)="cargar()"
                    (onClear)="cargar()"
                    [showClear]="true"
                    placeholder="Hasta"
                    styleClass="min-w-[150px]"
                />

                <p-button
                    icon="pi pi-refresh"
                    severity="secondary"
                    [outlined]="true"
                    (onClick)="cargar()"
                    pTooltip="Recargar"
                />

                <p-button
                    icon="pi pi-plus"
                    label="Nueva Venta"
                    (onClick)="nueva()"
                />
            </div>

            <app-shared-table
                [data]="ventasFiltradas()"
                [columns]="columns"
                [rowActions]="rowActions"
                [loading]="loading()"
                [searchFields]="[]"
                title=""
                dataKey="id"
                (actionClicked)="onAction($event)"
            />
            <p-confirmDialog />
        </div>
    `,
})
export class VentasListComponent implements OnInit {
    private ventasService = inject(VentasService);
    private sucursalesService = inject(SucursalesService);
    private auth = inject(AuthService);
    private toast = inject(ToastService);
    private router = inject(Router);
    private confirmation = inject(ConfirmationService);

    ventas = signal<Venta[]>([]);
    sucursales = signal<Sucursal[]>([]);
    loading = signal<boolean>(true);
    searchTerm = signal('');
    filtroSucursalId: number | null = null;
    filtroFechaDesde: Date | null = null;
    filtroFechaHasta: Date | null = null;

    columns: TableColumn[] = [
        { field: 'id', header: 'ID', type: 'text', width: '70px' },
        {
            field: 'numero_venta',
            header: 'Número',
            type: 'text',
            width: '150px',
        },
        {
            field: 'fecha_venta',
            header: 'Fecha',
            type: 'date',
            width: '120px',
        },
        {
            field: 'total',
            header: 'Total',
            type: 'currency',
            width: '120px',
            currencyCode: 'Bs',
        },
        {
            field: 'estado',
            header: 'Estado',
            type: 'tag',
            width: '130px',
        },
        {
            field: 'cantidad_items',
            header: 'Items',
            type: 'text',
            width: '80px',
        },
        {
            field: 'acciones',
            header: 'Acciones',
            type: 'actions',
            width: '120px',
        },
    ];

    rowActions: RowAction[] = [
        {
            key: 'view',
            icon: 'pi pi-eye',
            tooltip: 'Ver detalle',
            severity: 'info',
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
        this.ventasService
            .list({
                sucursalId: this.filtroSucursalId,
                fechaDesde: this.formatDate(this.filtroFechaDesde),
                fechaHasta: this.formatDate(this.filtroFechaHasta),
            })
            .subscribe({
                next: (data) => {
                    this.ventas.set(data);
                    this.loading.set(false);
                },
                error: (err) => {
                    this.loading.set(false);
                    this.toast.error(err, 'No se pudieron cargar las ventas');
                },
            });
    }

    cargarSucursales(): void {
        this.sucursalesService.list().subscribe({
            next: (data) => this.sucursales.set(data),
            error: () => undefined,
        });
    }

    ventasFiltradas = computed<
        (Venta & { cantidad_items: number })[]
    >(() => {
        const term = this.searchTerm().trim().toLowerCase();
        const decorated = this.ventas().map((v) => ({
            ...v,
            cantidad_items: v.detalles?.length ?? 0,
        }));
        if (!term) return decorated;
        return decorated.filter(
            (v) =>
                v.numero_venta.toLowerCase().includes(term) ||
                v.estado.toLowerCase().includes(term),
        );
    });

    nueva(): void {
        this.router.navigate(['/home/ventas/nueva']);
    }

    onAction(event: { action: string; data: Venta }): void {
        if (event.action === 'view') {
            this.verDetalle(event.data);
        } else if (event.action === 'delete') {
            this.confirmarEliminar(event.data);
        }
    }

    private verDetalle(v: Venta): void {
        // Por ahora mostramos un toast con el detalle; luego se puede abrir un dialog
        const detalles = v.detalles
            .map(
                (d) =>
                    `${d.producto_nombre} x${d.cantidad} = Bs ${d.subtotal}`,
            )
            .join('\n');
        this.toast.info(detalles, `Venta ${v.numero_venta} - Total: Bs ${v.total}`);
    }

    private confirmarEliminar(v: Venta): void {
        this.confirmation.confirm({
            message: `¿Eliminar la venta "${v.numero_venta}"? Esta acción revertirá el stock de los productos.`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.eliminar(v),
        });
    }

    private eliminar(v: Venta): void {
        this.ventasService.delete(v.id).subscribe({
            next: (res) => {
                this.toast.success(res.message);
                this.cargar();
            },
            error: (err) => this.toast.error(err),
        });
    }

    private formatDate(date: Date | null): string | null {
        if (!date) return null;
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
}
