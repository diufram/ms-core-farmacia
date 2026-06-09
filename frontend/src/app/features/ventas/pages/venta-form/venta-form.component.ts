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
                                styleClass="text-lg"
                            />
                        </div>
                    </ng-template>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div *ngIf="esSuperAdmin()">
                            <p-floatlabel variant="on">
                                <p-select
                                    inputId="sucursalId"
                                    formControlName="sucursalId"
                                    [options]="sucursales()"
                                    optionLabel="nombre"
                                    optionValue="id"
                                    placeholder="Seleccionar sucursal"
                                    styleClass="w-full"
                                    (onChange)="onCambioSucursal()"
                                />
                                <label for="sucursalId">Sucursal *</label>
                            </p-floatlabel>
                            <small
                                *ngIf="invalid('sucursalId')"
                                class="text-red-500 mt-1 block"
                            >
                                La sucursal es requerida
                            </small>
                        </div>

                        <div *ngIf="!esSuperAdmin()">
                            <p-floatlabel variant="on">
                                <input
                                    pInputText
                                    id="sucursalDisplay"
                                    type="text"
                                    [value]="sucursalNombre()"
                                    disabled
                                    class="w-full"
                                />
                                <label for="sucursalDisplay">Sucursal</label>
                            </p-floatlabel>
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
                        class="text-center py-8 text-muted-color"
                    >
                        <i class="pi pi-shopping-cart text-4xl mb-3 block"></i>
                        <p>
                            Agrega al menos un producto para registrar la
                            venta.
                        </p>
                    </div>

                    <div
                        formArrayName="detalles"
                        class="space-y-4"
                    >
                        <div
                            *ngFor="let linea of detalles.controls; let i = index"
                            [formGroupName]="i"
                            class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 border border-surface-border rounded-lg bg-surface-50"
                        >
                            <div class="md:col-span-5">
                                <p-floatlabel variant="on">
                                    <p-select
                                        inputId="producto-{{ i }}"
                                        formControlName="productoId"
                                        [options]="productos()"
                                        optionLabel="nombre"
                                        optionValue="id"
                                        placeholder="Seleccionar producto"
                                        styleClass="w-full"
                                        [filter]="true"
                                        filterBy="nombre,codigo"
                                        (onChange)="onProductoChange(i)"
                                    />
                                    <label [for]="'producto-' + i"
                                    >Producto *</label>
                                </p-floatlabel>
                            </div>

                            <div class="md:col-span-2">
                                <p-floatlabel variant="on">
                                    <p-inputNumber
                                        [inputId]="'cantidad-' + i"
                                        formControlName="cantidad"
                                        [min]="1"
                                        styleClass="w-full"
                                    />
                                    <label [for]="'cantidad-' + i"
                                    >Cantidad *</label>
                                </p-floatlabel>
                            </div>

                            <div class="md:col-span-3">
                                <p-floatlabel variant="on">
                                    <p-inputNumber
                                        [inputId]="'precio-' + i"
                                        formControlName="precioUnitario"
                                        mode="decimal"
                                        [minFractionDigits]="2"
                                        [maxFractionDigits]="2"
                                        [min]="0"
                                        styleClass="w-full"
                                    />
                                    <label [for]="'precio-' + i"
                                    >Precio unit.</label>
                                </p-floatlabel>
                                <small class="text-muted-color block mt-1"
                                >
                                    Default: Bs
                                    {{ getPrecioProducto(i) }}
                                </small>
                            </div>

                            <div class="md:col-span-2 flex justify-end">
                                <p-button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    [text]="true"
                                    (onClick)="eliminarLinea(i)"
                                    [disabled]="saving()"
                                />
                            </div>

                            <div class="md:col-span-12">
                                <p-divider />
                                <div class="flex justify-between text-sm">
                                    <span class="text-muted-color">
                                        Stock disponible: {{
                                            getStockProducto(i)
                                        }}
                                    </span>
                                    <span class="font-semibold">
                                        Subtotal: Bs
                                        {{ subtotalLinea(i) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </p-card>

                <div class="flex justify-end gap-2 pt-2">
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
