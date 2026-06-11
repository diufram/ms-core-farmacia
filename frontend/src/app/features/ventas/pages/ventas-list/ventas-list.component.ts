import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { SelectButtonModule } from 'primeng/selectbutton';

import { SharedTableComponent } from '@/shared/components/shared-table/shared-table.component';
import {
    TableColumn,
    RowAction,
    SelectButtonOption,
} from '@/shared/components/shared-table/interfaces/table-config.interface';
import { ToastService } from '@/core/services/toast.service';
import { AuthService } from '@/features/auth/services/auth.service';
import { SucursalesService } from '@/features/sucursales/services/sucursales.service';
import { Sucursal } from '@/features/sucursales/models/sucursal.interface';
import { VentasService } from '../../services/ventas.service';
import { EstadoVenta, Venta } from '../../models/venta.interface';

const TRANSICIONES_VALIDAS: Record<EstadoVenta, EstadoVenta[]> = {
    PENDIENTE: ['PREPARADA', 'RECHAZADA'],
    PREPARADA: ['CONFIRMADA', 'RECHAZADA'],
    CONFIRMADA: [],
    RECHAZADA: [],
};

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
        DatePickerModule,
        SelectButtonModule,
        SharedTableComponent,
        DialogModule,
    ],
    providers: [ConfirmationService],
    template: `
        <div class="card">
            <app-shared-table
                [data]="ventas()"
                [columns]="columns"
                [rowActions]="rowActions"
                [loading]="loading()"
                [updatingId]="updatingId()"
                [searchFields]="['numero_venta', 'estado', 'cliente_nombre']"
                [title]="esCliente() ? 'Mis Pedidos' : 'Ventas'"
                dataKey="id"
                (actionClicked)="onAction($event)"
                (cellChange)="onCellChange($event)"
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

                <p-date-picker
                    table-filters
                    *ngIf="!esCliente()"
                    [(ngModel)]="filtroFechaDesde"
                    (onSelect)="cargar()"
                    (onClear)="cargar()"
                    [showClear]="true"
                    placeholder="Desde"
                    styleClass="min-w-[150px]"
                />

                <p-date-picker
                    table-filters
                    *ngIf="!esCliente()"
                    [(ngModel)]="filtroFechaHasta"
                    (onSelect)="cargar()"
                    (onClear)="cargar()"
                    [showClear]="true"
                    placeholder="Hasta"
                    styleClass="min-w-[150px]"
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
                    *ngIf="!esCliente()"
                    icon="pi pi-plus"
                    label="Nuevo"
                    (onClick)="nueva()"
                />
            </app-shared-table>
            <p-confirmDialog />
            
            <p-dialog header="Verificación de Blockchain" [(visible)]="verifyDialogVisible" [modal]="true" [style]="{ width: '450px' }">
                <div *ngIf="isVerifying()" class="flex flex-col items-center justify-center py-5">
                    <i class="pi pi-spin pi-spinner text-4xl text-primary mb-3"></i>
                    <p class="m-0 text-color-secondary">Verificando criptográficamente en la blockchain...</p>
                </div>
                
                <div *ngIf="!isVerifying() && verificationResult()" class="py-3">
                    <div *ngIf="verificationResult()?.isVerified" class="flex flex-col items-center">
                        <i class="pi pi-check-circle text-green-500 text-6xl mb-3"></i>
                        <h3 class="text-green-500 font-bold text-xl m-0 mb-2">¡Integridad Verificada!</h3>
                        <p class="text-center text-color-secondary m-0 mb-4">Los datos de esta venta coinciden exactamente con el registro inmutable en la blockchain.</p>
                        
                        <div class="w-full bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs break-all">
                            <span class="font-bold text-color block mb-1">Hash Almacenado:</span>
                            <span class="text-color-secondary block mb-3">{{ verificationResult()?.blockchainHash }}</span>
                            
                            <span class="font-bold text-color block mb-1">Hash Actual:</span>
                            <span class="text-color-secondary">{{ verificationResult()?.currentHash }}</span>
                        </div>
                    </div>
                    
                    <div *ngIf="!verificationResult()?.isVerified" class="flex flex-col items-center">
                        <i class="pi pi-times-circle text-red-500 text-6xl mb-3"></i>
                        <h3 class="text-red-500 font-bold text-xl m-0 mb-2">¡Alerta de Manipulación!</h3>
                        <p class="text-center text-color-secondary m-0 mb-4">Los datos de esta venta en la base de datos han sido alterados y ya no coinciden con el registro original de la blockchain.</p>
                        
                        <div class="w-full bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-xs break-all border border-red-200 dark:border-red-800">
                            <span class="font-bold text-red-700 dark:text-red-400 block mb-1">Hash Original (Blockchain):</span>
                            <span class="text-red-600 dark:text-red-300 block mb-3">{{ verificationResult()?.blockchainHash }}</span>
                            
                            <span class="font-bold text-red-700 dark:text-red-400 block mb-1">Hash Alterado (Base de Datos):</span>
                            <span class="text-red-600 dark:text-red-300">{{ verificationResult()?.currentHash }}</span>
                        </div>
                    </div>
                </div>
            </p-dialog>
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
    filtroSucursalId: number | null = null;
    filtroFechaDesde: Date | null = null;
    filtroFechaHasta: Date | null = null;

    verifyDialogVisible = signal<boolean>(false);
    isVerifying = signal<boolean>(false);
    verificationResult = signal<{isVerified: boolean; currentHash: string; blockchainHash: string} | null>(null);
    updatingId = signal<number | null>(null);

    columns: TableColumn[] = [
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
            type: 'selectbutton',
            width: '360px',
            selectOptions: (row: Venta) => this.opcionesEstadoParaFila(row),
        },
        {
            field: 'acciones',
            header: 'Acciones',
            type: 'actions',
            width: '90px',
        },
    ];

    rowActions: RowAction[] = [];

    ngOnInit(): void {
        const user = this.auth.currentUser();
        if (!this.esCliente() && user?.sucursal_id) {
            this.filtroSucursalId = Number(user.sucursal_id);
        }
        if (this.esSuperAdmin()) {
            this.cargarSucursales();
        }
        this.rebuildRowActions();
        this.cargar();
    }

    esSuperAdmin(): boolean {
        return this.auth.currentUser()?.rol === 'super_admin';
    }

    esAdmin(): boolean {
        return this.auth.currentUser()?.rol === 'admin';
    }

    esCliente(): boolean {
        return this.auth.currentUser()?.rol === 'cliente';
    }

    esEmpleado(): boolean {
        return this.esSuperAdmin() || this.esAdmin();
    }

    cargar(): void {
        this.loading.set(true);
        this.ventasService
            .list({
                sucursalId: this.esCliente() ? null : this.filtroSucursalId,
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

    ventasDecoradas = signal<Venta[]>([]);

    nueva(): void {
        this.router.navigate(['/home/ventas/nueva']);
    }

    onAction(event: { action: string; data: Venta }): void {
        if (event.action === 'view') {
            this.verDetalle(event.data);
        } else if (event.action === 'delete') {
            this.confirmarEliminar(event.data);
        } else if (event.action === 'verify') {
            this.verificarIntegridad(event.data);
        } else if (event.action === 'etherscan') {
            window.open(`https://sepolia.etherscan.io/tx/${event.data.tx_hash}`, '_blank');
        }
    }

    private rebuildRowActions(): void {
        const actions: RowAction[] = [
            {
                key: 'view',
                icon: 'pi pi-eye',
                tooltip: 'Ver detalle',
                severity: 'info',
            },
        ];

        if (this.esEmpleado()) {
            actions.push({
                key: 'delete',
                icon: 'pi pi-trash',
                tooltip: 'Eliminar',
                severity: 'danger',
                visible: (row: Venta) => row.estado === 'PENDIENTE' || row.estado === 'RECHAZADA'
            });
        }
        
        actions.push({
            key: 'etherscan',
            icon: 'pi pi-link',
            tooltip: 'Ver en Blockchain',
            severity: 'help',
            visible: (row: Venta) => !!row.tx_hash
        });
        
        actions.push({
            key: 'verify',
            icon: 'pi pi-shield',
            tooltip: 'Verificar Integridad',
            severity: 'success',
            visible: (row: Venta) => !!row.tx_hash
        });

        this.rowActions = actions;
    }

    isActionVisible(action: string, venta: Venta): boolean {
        return true;
    }

    private opcionesEstadoParaFila(venta: Venta): SelectButtonOption[] {
        const permitidas = TRANSICIONES_VALIDAS[venta.estado] ?? [];
        const todas: EstadoVenta[] = [
            'PENDIENTE',
            'PREPARADA',
            'CONFIRMADA',
            'RECHAZADA',
        ];
        const labelMap: Record<EstadoVenta, string> = {
            PENDIENTE: 'Pendiente',
            PREPARADA: 'Preparada',
            CONFIRMADA: 'Confirmada',
            RECHAZADA: 'Rechazada',
        };
        return todas.map((estado) => ({
            label: labelMap[estado],
            value: estado,
            disabled: !permitidas.includes(estado),
        }));
    }

    onCellChange(event: { field: string; value: any; data: Venta }): void {
        if (event.field !== 'estado') return;
        if (event.value === event.data.estado) return;
        if (!this.esEmpleado()) return;
        this.confirmarCambioEstado(event.data, event.value as EstadoVenta);
    }

    private verDetalle(v: Venta): void {
        const detalles = v.detalles
            .map(
                (d) =>
                    `${d.producto_nombre} x${d.cantidad} = Bs ${d.subtotal}`,
            )
            .join('\n');
        this.toast.info(detalles, `Venta ${v.numero_venta} - Total: Bs ${v.total}`);
    }

    private confirmarCambioEstado(v: Venta, nuevoEstado: EstadoVenta): void {
        const mensajes: Record<EstadoVenta, string> = {
            PENDIENTE: 'volver a pendiente',
            PREPARADA: 'preparar',
            CONFIRMADA: 'confirmar',
            RECHAZADA: 'rechazar',
        };
        this.confirmation.confirm({
            message: `¿Deseas ${mensajes[nuevoEstado]} la venta "${v.numero_venta}"?`,
            header: 'Confirmar cambio de estado',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: nuevoEstado,
            rejectLabel: 'Cancelar',
            accept: () => this.cambiarEstado(v, nuevoEstado),
        });
    }

    private cambiarEstado(v: Venta, nuevoEstado: EstadoVenta): void {
        this.updatingId.set(v.id);
        this.ventasService.cambiarEstado(v.id, nuevoEstado).subscribe({
            next: (res) => {
                this.toast.success(res.message);
                this.updatingId.set(null);
                this.cargar();
            },
            error: (err) => {
                this.toast.error(err, 'Error al cambiar el estado');
                this.updatingId.set(null);
            },
        });
    }

    private confirmarEliminar(v: Venta): void {
        this.confirmation.confirm({
            message: `¿Eliminar la venta "${v.numero_venta}"?`,
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

    private verificarIntegridad(v: Venta): void {
        this.isVerifying.set(true);
        this.verifyDialogVisible.set(true);
        this.verificationResult.set(null);
        
        this.ventasService.verificarIntegridad(v.id).subscribe({
            next: (res) => {
                this.verificationResult.set(res);
                this.isVerifying.set(false);
            },
            error: (err) => {
                this.toast.error(err, 'Error de Verificación');
                this.isVerifying.set(false);
                this.verifyDialogVisible.set(false);
            }
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
