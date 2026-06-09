import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { SharedTableComponent } from '@/shared/components/shared-table/shared-table.component';
import {
    TableColumn,
    RowAction,
} from '@/shared/components/shared-table/interfaces/table-config.interface';
import { ToastService } from '@/core/services/toast.service';
import { AuthService } from '@/features/auth/services/auth.service';
import { SucursalesService } from '@/features/sucursales/services/sucursales.service';
import { Sucursal } from '@/features/sucursales/models/sucursal.interface';
import { ClientesService } from '../../services/clientes.service';
import { Cliente } from '../../models/cliente.interface';

@Component({
    selector: 'app-clientes-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        ConfirmDialogModule,
        SelectModule,
        InputTextModule,
        IconFieldModule,
        InputIconModule,
        SharedTableComponent,
    ],
    providers: [ConfirmationService],
    template: `
        <div class="card">
            <div class="flex flex-wrap items-end gap-3 mb-4">
                <div>
                    <h1 class="text-2xl font-semibold text-color m-0">
                        Clientes
                    </h1>
                    <p class="text-muted-color m-0 mt-1">
                        Gestión de clientes por sucursal
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
                        placeholder="Buscar por código, nombre, celular..."
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

                <p-button
                    icon="pi pi-refresh"
                    severity="secondary"
                    [outlined]="true"
                    (onClick)="cargar()"
                    pTooltip="Recargar"
                />

                <p-button
                    icon="pi pi-plus"
                    label="Nuevo Cliente"
                    (onClick)="nuevo()"
                />
            </div>

            <app-shared-table
                [data]="clientesFiltrados()"
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
export class ClientesListComponent implements OnInit {
    private clientesService = inject(ClientesService);
    private sucursalesService = inject(SucursalesService);
    private auth = inject(AuthService);
    private toast = inject(ToastService);
    private router = inject(Router);
    private confirmation = inject(ConfirmationService);

    clientes = signal<Cliente[]>([]);
    sucursales = signal<Sucursal[]>([]);
    loading = signal<boolean>(true);
    searchTerm = signal('');
    filtroSucursalId: number | null = null;

    columns: TableColumn[] = [
        { field: 'id', header: 'ID', type: 'text', width: '70px' },
        {
            field: 'codigo_cliente',
            header: 'Código',
            type: 'text',
            width: '140px',
        },
        {
            field: 'nombre_completo',
            header: 'Nombre',
            type: 'text',
        },
        {
            field: 'celular',
            header: 'Celular',
            type: 'text',
            width: '140px',
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
        return this.auth.currentUser()?.rol_global === 'super_admin';
    }

    cargar(): void {
        this.loading.set(true);
        this.clientesService
            .list({ sucursalId: this.filtroSucursalId })
            .subscribe({
                next: (data) => {
                    this.clientes.set(data);
                    this.loading.set(false);
                },
                error: (err) => {
                    this.loading.set(false);
                    this.toast.error(err, 'No se pudieron cargar los clientes');
                },
            });
    }

    cargarSucursales(): void {
        this.sucursalesService.list().subscribe({
            next: (data) => this.sucursales.set(data),
            error: () => undefined,
        });
    }

    clientesFiltrados = computed<
        (Cliente & { nombre_completo: string; celular: string })[]
    >(() => {
        const term = this.searchTerm().trim().toLowerCase();
        const decorated = this.clientes().map((c) => ({
            ...c,
            nombre_completo: `${c.persona.nombre} ${c.persona.apellido}`,
            celular: c.persona.celular ?? '-',
        }));
        if (!term) return decorated;
        return decorated.filter(
            (c) =>
                c.codigo_cliente.toLowerCase().includes(term) ||
                c.nombre_completo.toLowerCase().includes(term) ||
                c.celular.toLowerCase().includes(term),
        );
    });

    nuevo(): void {
        this.router.navigate(['/home/clientes/nuevo']);
    }

    onAction(event: { action: string; data: Cliente }): void {
        if (event.action === 'edit') {
            this.router.navigate([
                '/home/clientes',
                event.data.id,
                'editar',
            ]);
        } else if (event.action === 'delete') {
            this.confirmarEliminar(event.data);
        }
    }

    private confirmarEliminar(c: Cliente): void {
        const nombre = `${c.persona.nombre} ${c.persona.apellido}`;
        this.confirmation.confirm({
            message: `¿Eliminar al cliente "${nombre}" (${c.codigo_cliente})?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.eliminar(c),
        });
    }

    private eliminar(c: Cliente): void {
        this.clientesService.delete(c.id).subscribe({
            next: (res) => {
                this.toast.success(res.message);
                this.cargar();
            },
            error: (err) => this.toast.error(err),
        });
    }
}
