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
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { SharedTableComponent } from '@/shared/components/shared-table/shared-table.component';
import {
    TableColumn,
    RowAction,
} from '@/shared/components/shared-table/interfaces/table-config.interface';
import { ToastService } from '@/core/services/toast.service';
import { AuthService } from '@/features/auth/services/auth.service';
import { SucursalesService } from '@/features/sucursales/services/sucursales.service';
import { Sucursal } from '@/features/sucursales/models/sucursal.interface';
import { CategoriasService } from '@/features/categorias/services/categorias.service';
import { Categoria } from '@/features/categorias/models/categoria.interface';
import { ProductosService } from '../../services/productos.service';
import { Producto } from '../../models/producto.interface';

const STOCK_BAJO_UMBRAL = 10;

@Component({
    selector: 'app-productos-list',
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
        ProgressSpinnerModule,
        SharedTableComponent,
    ],
    providers: [ConfirmationService],
    template: `
        <div class="card">
            <div class="flex flex-wrap items-end gap-3 mb-4">
                <div>
                    <h1 class="text-2xl font-semibold text-color m-0">
                        Productos
                    </h1>
                    <p class="text-muted-color m-0 mt-1">
                        Inventario y precios
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
                        placeholder="Buscar por código, nombre..."
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

                <p-select
                    [options]="categorias()"
                    [(ngModel)]="filtroCategoriaId"
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Todas las categorías"
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
                    label="Nuevo Producto"
                    (onClick)="nuevo()"
                />
            </div>

            <app-shared-table
                [data]="productosFiltrados()"
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
export class ProductosListComponent implements OnInit {
    private productosService = inject(ProductosService);
    private categoriasService = inject(CategoriasService);
    private sucursalesService = inject(SucursalesService);
    private auth = inject(AuthService);
    private toast = inject(ToastService);
    private router = inject(Router);
    private confirmation = inject(ConfirmationService);

    productos = signal<Producto[]>([]);
    categorias = signal<Categoria[]>([]);
    sucursales = signal<Sucursal[]>([]);
    loading = signal<boolean>(true);
    searchTerm = signal('');
    filtroSucursalId: number | null = null;
    filtroCategoriaId: number | null = null;

    columns: TableColumn[] = [
        { field: 'id', header: 'ID', type: 'text', width: '70px' },
        { field: 'codigo', header: 'Código', type: 'text', width: '140px' },
        { field: 'nombre', header: 'Nombre', type: 'text' },
        {
            field: 'precio_venta',
            header: 'Precio',
            type: 'currency',
            width: '120px',
            currencyCode: 'Bs',
        },
        {
            field: 'stock_actual',
            header: 'Stock',
            type: 'text',
            width: '100px',
        },
        {
            field: 'stock_estado',
            header: 'Estado',
            type: 'tag',
            width: '130px',
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
        this.cargarCategorias();
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
        this.productosService
            .list({
                sucursalId: this.filtroSucursalId,
                categoriaId: this.filtroCategoriaId,
            })
            .subscribe({
                next: (data) => {
                    this.productos.set(data);
                    this.loading.set(false);
                },
                error: (err) => {
                    this.loading.set(false);
                    this.toast.error(err, 'No se pudieron cargar los productos');
                },
            });
    }

    cargarCategorias(): void {
        this.categoriasService
            .list(this.filtroSucursalId)
            .subscribe({
                next: (data) => this.categorias.set(data),
                error: () => undefined,
            });
    }

    cargarSucursales(): void {
        this.sucursalesService.list().subscribe({
            next: (data) => this.sucursales.set(data),
            error: () => undefined,
        });
    }

    productosFiltrados = computed<(Producto & { stock_estado: string })[]>(() => {
        const term = this.searchTerm().trim().toLowerCase();
        const decorated = this.productos().map((p) => ({
            ...p,
            stock_estado:
                p.stock_actual <= 0
                    ? 'OUTOFSTOCK'
                    : p.stock_actual < STOCK_BAJO_UMBRAL
                      ? 'LOWSTOCK'
                      : 'INSTOCK',
        }));
        if (!term) return decorated;
        return decorated.filter(
            (p) =>
                p.codigo.toLowerCase().includes(term) ||
                p.nombre.toLowerCase().includes(term),
        );
    });

    nuevo(): void {
        this.router.navigate(['/home/productos/nuevo']);
    }

    onAction(event: { action: string; data: Producto }): void {
        if (event.action === 'edit') {
            this.router.navigate(['/home/productos', event.data.id, 'editar']);
        } else if (event.action === 'delete') {
            this.confirmarEliminar(event.data);
        }
    }

    private confirmarEliminar(p: Producto): void {
        this.confirmation.confirm({
            message: `¿Eliminar el producto "${p.nombre}"? Sus ventas históricas no se borrarán.`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.eliminar(p),
        });
    }

    private eliminar(p: Producto): void {
        this.productosService.delete(p.id).subscribe({
            next: (res) => {
                this.toast.success(res.message);
                this.cargar();
            },
            error: (err) => this.toast.error(err),
        });
    }
}
