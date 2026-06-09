import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormArray,
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

import { ToastService } from '@/core/services/toast.service';
import { AuthService } from '@/features/auth/services/auth.service';
import { SucursalesService } from '@/features/sucursales/services/sucursales.service';
import { Sucursal } from '@/features/sucursales/models/sucursal.interface';
import { ProductosService } from '@/features/productos/services/productos.service';
import { Producto } from '@/features/productos/models/producto.interface';
import { VentasService } from '../../services/ventas.service';
import { VentaDetalleInput } from '../../models/venta.interface';

interface DetalleLinea {
    productoId: number | null;
    cantidad: number;
    precioUnitario: number | null;
}

@Component({
    selector: 'app-venta-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        ButtonModule,
        InputTextModule,
        FloatLabelModule,
        CardModule,
        ProgressSpinnerModule,
        SelectModule,
        InputNumberModule,
        DividerModule,
        TagModule,
    ],
    styles: [`
        .venta-linea {
            background: var(--surface-card);
            border: 1px solid var(--surface-border);
            border-radius: 12px;
            padding: 1.25rem;
            transition: box-shadow 0.2s;
        }
        .venta-linea:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .field-label {
            display: block;
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-color-secondary);
            margin-bottom: 0.35rem;
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }
        .field-label .req {
            color: var(--red-500);
        }
        .venta-linea ::ng-deep p-inputnumber .p-inputnumber-input {
            width: 100% !important;
            min-width: 0 !important;
        }
        .venta-linea ::ng-deep p-select .p-select {
            width: 100% !important;
            min-width: 0 !important;
        }
        .venta-linea ::ng-deep .p-button {
            min-width: auto;
        }
    `],
    template: `
        <div class="max-w-4xl mx-auto">
            <div class="flex items-center gap-3 mb-4">
                <p-button
                    icon="pi pi-arrow-left"
                    severity="secondary"
                    [text]="true"
                    (onClick)="cancelar()"
                />
                <div>
                    <h1 class="text-2xl font-semibold text-color m-0">
                        Nueva Venta
                    </h1>
                </div>
            </div>

            <form
                [formGroup]="form"
                (ngSubmit)="guardar()"
                class="space-y-4"
            >
                <p-card>
                    <ng-template pTemplate="header">
                        <div class="px-6 pt-5 flex justify-between items-center">
                            <h3 class="text-lg font-semibold text-color m-0">
                                Datos generales
                            </h3>
                            <p-tag
                                [value]="'Total: Bs ' + total()"
                                severity="success"
                                styleClass="text-lg font-bold"
                            />
                        </div>
                    </ng-template>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div *ngIf="esSuperAdmin()">
                            <label class="field-label">Sucursal <span class="req">*</span></label>
                            <p-select
                                formControlName="sucursalId"
                                [options]="sucursales()"
                                optionLabel="nombre"
                                optionValue="id"
                                placeholder="Seleccionar sucursal"
                                styleClass="w-full"
                                (onChange)="onCambioSucursal()"
                            />
                            <small
                                *ngIf="invalid('sucursalId')"
                                class="text-red-500 mt-1 block"
                            >
                                La sucursal es requerida
                            </small>
                        </div>

                        <div *ngIf="!esSuperAdmin()">
                            <label class="field-label">Sucursal</label>
                            <input
                                pInputText
                                type="text"
                                [value]="sucursalNombre()"
                                disabled
                                class="w-full"
                            />
                        </div>
                    </div>
                </p-card>

                <p-card>
                    <ng-template pTemplate="header">
                        <div class="px-6 pt-5 flex justify-between items-center">
                            <h3 class="text-lg font-semibold text-color m-0">
                                Productos
                            </h3>
                            <p-button
                                icon="pi pi-plus"
                                label="Agregar producto"
                                severity="secondary"
                                [outlined]="true"
                                (onClick)="agregarLinea()"
                            />
                        </div>
                    </ng-template>

                    <div
                        *ngIf="detalles.length === 0"
                        class="text-center py-10 text-muted-color"
                    >
                        <i class="pi pi-shopping-cart text-5xl mb-4 block opacity-60"></i>
                        <p class="text-base">
                            Agrega al menos un producto para registrar la venta.
                        </p>
                    </div>

                    <div
                        formArrayName="detalles"
                        class="space-y-4"
                    >
                        <div
                            *ngFor="let linea of detalles.controls; let i = index"
                            [formGroupName]="i"
                            class="venta-linea"
                        >
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-start">
                                <div class="sm:col-span-2 lg:col-span-5 min-w-0">
                                    <label class="field-label">Producto <span class="req">*</span></label>
                                    <p-select
                                        formControlName="productoId"
                                        [options]="productos()"
                                        optionLabel="nombre"
                                        optionValue="id"
                                        placeholder="Buscar producto..."
                                        styleClass="w-full"
                                        [filter]="true"
                                        filterBy="nombre,codigo"
                                        (onChange)="onProductoChange(i)"
                                    />
                                </div>

                                <div class="sm:col-span-1 lg:col-span-2 min-w-0">
                                    <label class="field-label">Cantidad <span class="req">*</span></label>
                                    <p-inputNumber
                                        formControlName="cantidad"
                                        [min]="1"
                                        styleClass="w-full"
                                    />
                                </div>

                                <div class="sm:col-span-1 lg:col-span-3 min-w-0">
                                    <label class="field-label">Precio unitario</label>
                                    <p-inputNumber
                                        formControlName="precioUnitario"
                                        mode="decimal"
                                        [minFractionDigits]="2"
                                        [maxFractionDigits]="2"
                                        [min]="0"
                                        styleClass="w-full"
                                    />
                                    <small class="text-muted-color block mt-1">
                                        Default: Bs {{ getPrecioProducto(i) | number:'1.2-2' }}
                                    </small>
                                </div>

                                <div class="sm:col-span-2 lg:col-span-2 flex items-start justify-end lg:pt-6">
                                    <p-button
                                        icon="pi pi-trash"
                                        severity="danger"
                                        [outlined]="true"
                                        (onClick)="eliminarLinea(i)"
                                        [disabled]="saving()"
                                        pTooltip="Eliminar línea"
                                    />
                                </div>
                            </div>

                            <div class="mt-4 pt-3 border-t border-surface-border">
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-muted-color">
                                        <i class="pi pi-box mr-1"></i>
                                        Stock disponible: <strong>{{ getStockProducto(i) }}</strong>
                                    </span>
                                    <span class="font-bold text-color">
                                        Subtotal: Bs {{ subtotalLinea(i) | number:'1.2-2' }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </p-card>

                <div class="flex justify-end gap-3 pt-2">
                    <p-button
                        type="button"
                        label="Cancelar"
                        severity="secondary"
                        [outlined]="true"
                        (onClick)="cancelar()"
                        [disabled]="saving()"
                    />
                    <p-button
                        type="submit"
                        label="Registrar venta"
                        icon="pi pi-check"
                        [loading]="saving()"
                        [disabled]="form.invalid || detalles.length === 0 || saving()"
                    />
                </div>
            </form>
        </div>
    `,
})
export class VentaFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private ventasService = inject(VentasService);
    private productosService = inject(ProductosService);
    private sucursalesService = inject(SucursalesService);
    private auth = inject(AuthService);
    private toast = inject(ToastService);

    form!: FormGroup;
    productos = signal<Producto[]>([]);
    sucursales = signal<Sucursal[]>([]);

    saving = signal<boolean>(false);
    sucursalNombre = signal<string>('');

    ngOnInit(): void {
        this.construirFormulario();
        this.cargarSucursales();
        this.cargarProductos();
    }

    private construirFormulario(): void {
        const user = this.auth.currentUser();
        const sucursalId = user?.sucursal_id ?? null;

        this.form = this.fb.group({
            sucursalId: [
                this.esSuperAdmin() ? null : sucursalId,
                Validators.required,
            ],
            detalles: this.fb.array<FormGroup>([], [
                (arr) => ((arr as FormArray).length > 0 ? null : { minLength: true }),
            ]),
        });

        if (!this.esSuperAdmin() && user?.sucursal_id) {
            this.sucursalNombre.set(user.sucursal?.nombre ?? `Sucursal #${user.sucursal_id}`);
        }
    }

    get detalles(): FormArray<FormGroup> {
        return this.form.get('detalles') as FormArray<FormGroup>;
    }

    esSuperAdmin(): boolean {
        return this.auth.currentUser()?.rol_global === 'super_admin';
    }

    cargarSucursales(): void {
        if (!this.esSuperAdmin()) return;
        this.sucursalesService.list().subscribe({
            next: (data) => this.sucursales.set(data),
            error: () => undefined,
        });
    }

    onCambioSucursal(): void {
        this.cargarProductos();
        // Limpiar detalles al cambiar sucursal porque los productos cambian
        while (this.detalles.length > 0) {
            this.detalles.removeAt(0);
        }
    }

    cargarProductos(): void {
        const sucursalId = this.form?.get('sucursalId')?.value;
        this.productosService
            .list({ sucursalId, categoriaId: null })
            .subscribe({
                next: (data) => this.productos.set(data),
                error: () => undefined,
            });
    }

    agregarLinea(): void {
        const linea = this.fb.group({
            productoId: [null as number | null, Validators.required],
            cantidad: [1, [Validators.required, Validators.min(1)]],
            precioUnitario: [null as number | null],
        });
        this.detalles.push(linea);
    }

    eliminarLinea(index: number): void {
        this.detalles.removeAt(index);
    }

    onProductoChange(index: number): void {
        const linea = this.detalles.at(index);
        const productoId = linea.get('productoId')?.value as number;
        const producto = this.productos().find((p) => p.id === productoId);
        if (producto) {
            linea.patchValue({
                precioUnitario: producto.precio_venta,
            });
        }
    }

    getPrecioProducto(index: number): number {
        const linea = this.detalles.at(index);
        const productoId = linea.get('productoId')?.value as number;
        const producto = this.productos().find((p) => p.id === productoId);
        return producto?.precio_venta ?? 0;
    }

    getStockProducto(index: number): number {
        const linea = this.detalles.at(index);
        const productoId = linea.get('productoId')?.value as number;
        const producto = this.productos().find((p) => p.id === productoId);
        return producto?.stock_actual ?? 0;
    }

    subtotalLinea(index: number): number {
        const linea = this.detalles.at(index);
        const cantidad = Number(linea.get('cantidad')?.value ?? 0);
        const precio =
            Number(linea.get('precioUnitario')?.value) ||
            this.getPrecioProducto(index);
        return cantidad * precio;
    }

    total = computed(() => {
        let sum = 0;
        for (let i = 0; i < this.detalles.length; i++) {
            sum += this.subtotalLinea(i);
        }
        return sum.toFixed(2);
    });

    invalid(field: string): boolean {
        const c = this.form.get(field);
        return !!(c && c.invalid && (c.dirty || c.touched));
    }

    guardar(): void {
        if (this.form.invalid || this.detalles.length === 0) {
            this.form.markAllAsTouched();
            return;
        }

        this.saving.set(true);
        const v = this.form.getRawValue();

        const detalles: VentaDetalleInput[] = (
            v.detalles as DetalleLinea[]
        ).map((d) => ({
            productoId: Number(d.productoId),
            cantidad: Number(d.cantidad),
            precioUnitario: d.precioUnitario
                ? Number(d.precioUnitario)
                : undefined,
        }));

        this.ventasService
            .create({
                sucursalId: Number(v.sucursalId),
                detalles,
            })
            .subscribe({
                next: (res) => {
                    this.saving.set(false);
                    this.toast.success(res.message);
                    this.router.navigate(['/home/ventas']);
                },
                error: (err) => {
                    this.saving.set(false);
                    this.toast.error(err);
                },
            });
    }

    cancelar(): void {
        this.router.navigate(['/home/ventas']);
    }
}
