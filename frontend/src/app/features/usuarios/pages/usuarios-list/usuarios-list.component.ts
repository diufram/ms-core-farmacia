import { Component, OnInit, inject, signal } from '@angular/core';
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

import { SharedTableComponent } from '@/shared/components/shared-table/shared-table.component';
import {
    TableColumn,
    RowAction,
} from '@/shared/components/shared-table/interfaces/table-config.interface';
import { ToastService } from '@/core/services/toast.service';
import { SucursalesService } from '@/features/sucursales/services/sucursales.service';
import { Sucursal } from '@/features/sucursales/models/sucursal.interface';
import { UsuariosService } from '../../services/usuarios.service';
import {
    Rol,
    Usuario,
} from '../../models/usuario.interface';

@Component({
    selector: 'app-usuarios-list',
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
        SharedTableComponent,
    ],
    providers: [ConfirmationService],
    template: `
        <div class="card">
            <div class="flex flex-wrap items-end gap-3 mb-4">
                <div>
                    <h1 class="text-2xl font-semibold text-color m-0">
                        Usuarios
                    </h1>
                    <p class="text-muted-color m-0 mt-1">
                        Gestiona los usuarios del sistema
                    </p>
                </div>
            </div>

            <div class="flex flex-wrap items-center gap-3 mb-3">
                <p-iconfield iconPosition="left" class="flex-1 min-w-[220px]">
                    <p-inputicon styleClass="pi pi-search" />
                    <input
                        pInputText
                        type="text"
                        [(ngModel)]="searchTerm"
                        placeholder="Buscar por nombre, usuario, correo..."
                        class="w-full"
                    />
                </p-iconfield>

                <p-select
                    [options]="sucursalOptions()"
                    [(ngModel)]="filtroSucursalId"
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Todas las sucursales"
                    [showClear]="true"
                    (onChange)="aplicarFiltros()"
                    appendTo="body"
                    styleClass="min-w-[200px]"
                />

                <p-select
                    [options]="rolOptions"
                    [(ngModel)]="filtroRol"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Todos los roles"
                    [showClear]="true"
                    (onChange)="aplicarFiltros()"
                    appendTo="body"
                    styleClass="min-w-[180px]"
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
                    label="Nuevo Usuario"
                    (onClick)="nuevo()"
                />
            </div>

            <app-shared-table
                [data]="usuariosFiltrados()"
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
export class UsuariosListComponent implements OnInit {
    private usuariosService = inject(UsuariosService);
    private sucursalesService = inject(SucursalesService);
    private toast = inject(ToastService);
    private router = inject(Router);
    private confirmation = inject(ConfirmationService);

    usuarios = signal<Usuario[]>([]);
    sucursales = signal<Sucursal[]>([]);
    loading = signal<boolean>(true);
    searchTerm = '';
    filtroSucursalId: number | null = null;
    filtroRol: Rol | null = null;

    sucursalOptions = (): Sucursal[] => this.sucursales();

    rolOptions = [
        { label: 'Super Administrador', value: 'super_admin' as Rol },
        { label: 'Administrador', value: 'admin' as Rol },
    ];

    columns: TableColumn[] = [
        { field: 'id', header: 'ID', type: 'text', width: '70px' },
        {
            field: 'persona.nombre',
            header: 'Nombre',
            type: 'text',
        },
        {
            field: 'nombre_usuario',
            header: 'Usuario',
            type: 'text',
        },
        {
            field: 'correo_electronico',
            header: 'Correo',
            type: 'text',
        },
        {
            field: 'rol',
            header: 'Rol',
            type: 'tag',
            width: '160px',
        },
        {
            field: 'asignaciones',
            header: 'Sucursales',
            type: 'text',
        },
        {
            field: 'acciones',
            header: 'Acciones',
            type: 'actions',
            width: '160px',
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
            key: 'reset',
            icon: 'pi pi-key',
            tooltip: 'Restablecer contraseña',
            severity: 'warn',
        },
        {
            key: 'delete',
            icon: 'pi pi-trash',
            tooltip: 'Eliminar',
            severity: 'danger',
        },
    ];

    ngOnInit(): void {
        this.cargarSucursales();
        this.cargar();
    }

    cargar(): void {
        this.loading.set(true);
        this.usuariosService
            .list({
                sucursalId: this.filtroSucursalId,
                rol: this.filtroRol,
            })
            .subscribe({
                next: (data) => {
                    this.usuarios.set(data);
                    this.loading.set(false);
                },
                error: (err) => {
                    this.loading.set(false);
                    this.toast.error(err, 'No se pudieron cargar los usuarios');
                },
            });
    }

    aplicarFiltros(): void {
        this.cargar();
    }

    cargarSucursales(): void {
        this.sucursalesService.list().subscribe({
            next: (data) => this.sucursales.set(data),
            error: () => undefined,
        });
    }

    usuariosFiltrados(): Usuario[] {
        const term = this.searchTerm.trim().toLowerCase();
        if (!term) return this.usuarios();
        return this.usuarios().filter((u) => {
            const nombreCompleto = `${u.persona.nombre} ${u.persona.apellido}`.toLowerCase();
            return (
                nombreCompleto.includes(term) ||
                u.nombre_usuario.toLowerCase().includes(term) ||
                u.correo_electronico.toLowerCase().includes(term)
            );
        });
    }

    nuevo(): void {
        this.router.navigate(['/home/usuarios/nuevo']);
    }

    onAction(event: { action: string; data: Usuario }): void {
        if (event.action === 'edit') {
            this.router.navigate(['/home/usuarios', event.data.id, 'editar']);
        } else if (event.action === 'delete') {
            this.confirmarEliminar(event.data);
        } else if (event.action === 'reset') {
            this.confirmarReset(event.data);
        }
    }

    private confirmarEliminar(usuario: Usuario): void {
        this.confirmation.confirm({
            message: `¿Eliminar al usuario "${usuario.nombre_usuario}"? Se revocarán sus sesiones activas.`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.eliminar(usuario),
        });
    }

    private confirmarReset(usuario: Usuario): void {
        this.confirmation.confirm({
            message: `¿Restablecer la contraseña de "${usuario.nombre_usuario}"? Se generará una temporal y deberá cambiarla al iniciar sesión.`,
            header: 'Restablecer contraseña',
            icon: 'pi pi-key',
            acceptLabel: 'Restablecer',
            rejectLabel: 'Cancelar',
            accept: () => this.resetear(usuario),
        });
    }

    private eliminar(usuario: Usuario): void {
        this.usuariosService.delete(usuario.id).subscribe({
            next: (res) => {
                this.toast.success(res.message);
                this.cargar();
            },
            error: (err) => this.toast.error(err),
        });
    }

    private resetear(usuario: Usuario): void {
        this.usuariosService
            .adminResetPassword(usuario.id, 'Temporal1234')
            .subscribe({
                next: (res) => {
                    this.toast.success(
                        res.message +
                            ' (contraseña temporal: Temporal1234)',
                    );
                },
                error: (err) => this.toast.error(err),
            });
    }
}
