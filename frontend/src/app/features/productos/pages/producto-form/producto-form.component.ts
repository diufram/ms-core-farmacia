import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';

import { ToastService } from '@/core/services/toast.service';
import { AuthService } from '@/features/auth/services/auth.service';
import { CategoriasService } from '@/features/categorias/services/categorias.service';
import { Categoria } from '@/features/categorias/models/categoria.interface';
import { ProductosService } from '../../services/productos.service';

@Component({
    selector: 'app-producto-form',
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
    ],
    template: `
        <div class="max-w-3xl mx-auto">
            <div class="flex items-center gap-3 mb-4">
                <p-button
                    icon="pi pi-arrow-left"
                    severity="secondary"
                    [text]="true"
                    (onClick)="cancelar()"
                />
                <div>
                    <h1 class="text-2xl font-semibold text-color m-0">
                        {{
                            esEdicion()
                                ? 'Editar Producto'
                                : 'Nuevo Producto'
                        }}
                    </h1>
                </div>
            </div>

            <div *ngIf="loadingData()" class="flex justify-center py-12">
                <p-progress-spinner strokeWidth="3" />
            </div>

            <form
                *ngIf="!loadingData()"
                [formGroup]="form"
                (ngSubmit)="guardar()"
                class="space-y-4"
            >
                <p-card>
                    <ng-template pTemplate="header">
                        <div class="px-6 pt-5">
                            <h3 class="text-lg font-semibold text-color m-0">
                                Datos del producto
                            </h3>
                        </div>
                    </ng-template>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                            <p-floatlabel variant="on">
                                <input
                                    pInputText
                                    id="codigo"
                                    type="text"
                                    formControlName="codigo"
                                    class="w-full"
                                />
                                <label for="codigo">Código *</label>
                            </p-floatlabel>
                            <small
                                *ngIf="invalid('codigo')"
                                class="text-red-500 mt-1 block"
                            >
                                El código es requerido (máx. 60 caracteres)
                            </small>
                        </div>

                        <div>
                            <p-floatlabel variant="on">
                                <input
                                    pInputText
                                    id="nombre"
                                    type="text"
                                    formControlName="nombre"
                                    class="w-full"
                                />
                                <label for="nombre">Nombre *</label>
                            </p-floatlabel>
                            <small
                                *ngIf="invalid('nombre')"
                                class="text-red-500 mt-1 block"
                            >
                                El nombre es requerido (máx. 180 caracteres)
                            </small>
                        </div>

                        <div>
                            <p-floatlabel variant="on">
                                <p-inputNumber
                                    inputId="precio_venta"
                                    formControlName="precio_venta"
                                    mode="decimal"
                                    [minFractionDigits]="2"
                                    [maxFractionDigits]="2"
                                    [min]="0"
                                    styleClass="w-full"
                                />
                                <label for="precio_venta">Precio venta *</label>
                            </p-floatlabel>
                            <small
                                *ngIf="invalid('precio_venta')"
                                class="text-red-500 mt-1 block"
                            >
                                El precio es requerido (>= 0)
                            </small>
                        </div>

                        <div>
                            <p-floatlabel variant="on">
                                <p-inputNumber
                                    inputId="stock_actual"
                                    formControlName="stock_actual"
                                    [min]="0"
                                    styleClass="w-full"
                                />
                                <label for="stock_actual">Stock actual</label>
                            </p-floatlabel>
                        </div>

                        <div class="md:col-span-2">
                            <p-floatlabel variant="on">
                                <p-select
                                    inputId="categoriaId"
                                    formControlName="categoriaId"
                                    [options]="categorias()"
                                    optionLabel="nombre"
                                    optionValue="id"
                                    placeholder="Seleccionar categoría"
                                    styleClass="w-full"
                                    [filter]="true"
                                    filterBy="nombre,codigo"
                                />
                                <label for="categoriaId">Categoría *</label>
                            </p-floatlabel>
                            <small
                                *ngIf="invalid('categoriaId')"
                                class="text-red-500 mt-1 block"
                            >
                                La categoría es requerida
                            </small>
                            <small
                                *ngIf="categorias().length === 0"
                                class="text-muted-color mt-1 block"
                            >
                                No hay categorías disponibles en tu sucursal.
                                Crea una primero.
                            </small>
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
                        [label]="
                            esEdicion()
                                ? 'Guardar cambios'
                                : 'Crear producto'
                        "
                        icon="pi pi-save"
                        [loading]="saving()"
                        [disabled]="form.invalid || saving()"
                    />
                </div>
            </form>
        </div>
    `,
})
export class ProductoFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private productosService = inject(ProductosService);
    private categoriasService = inject(CategoriasService);
    private auth = inject(AuthService);
    private toast = inject(ToastService);

    form!: FormGroup;
    categorias = signal<Categoria[]>([]);

    esEdicion = signal<boolean>(false);
    loadingData = signal<boolean>(false);
    saving = signal<boolean>(false);
    productoId: number | null = null;

    ngOnInit(): void {
        this.construirFormulario();
        this.cargarCategorias();
        this.detectarModo();
    }

    private construirFormulario(): void {
        this.form = this.fb.group({
            codigo: ['', [Validators.required, Validators.maxLength(60)]],
            nombre: ['', [Validators.required, Validators.maxLength(180)]],
            precio_venta: [
                0,
                [Validators.required, Validators.min(0)],
            ],
            stock_actual: [0, [Validators.min(0)]],
            categoriaId: [null as number | null, Validators.required],
        });

        if (this.esEdicion()) {
            this.form.get('codigo')?.disable();
        }
    }

    private detectarModo(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.productoId = Number(id);
            this.esEdicion.set(true);
            this.cargarProducto();
        }
    }

    private cargarProducto(): void {
        if (!this.productoId) return;
        this.loadingData.set(true);
        this.productosService.get(this.productoId).subscribe({
            next: (p) => {
                this.form.patchValue({
                    codigo: p.codigo,
                    nombre: p.nombre,
                    precio_venta: p.precio_venta,
                    stock_actual: p.stock_actual,
                    categoriaId: p.categoria_id,
                });
                this.form.get('codigo')?.disable();
                this.loadingData.set(false);
            },
            error: (err) => {
                this.loadingData.set(false);
                this.toast.error(err, 'No se pudo cargar el producto');
                this.cancelar();
            },
        });
    }

    private cargarCategorias(): void {
        const user = this.auth.currentUser();
        const sucursalId =
            user?.rol_global === 'super_admin' ? null : user?.sucursal_id;
        this.categoriasService
            .list(sucursalId ?? undefined)
            .subscribe({
                next: (data) => this.categorias.set(data),
                error: () => undefined,
            });
    }

    invalid(field: string): boolean {
        const c = this.form.get(field);
        return !!(c && c.invalid && (c.dirty || c.touched));
    }

    guardar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.saving.set(true);
        const v = this.form.getRawValue();

        if (this.esEdicion() && this.productoId !== null) {
            const input: Record<string, unknown> = {
                nombre: v.nombre,
                precio_venta: Number(v.precio_venta),
                stock_actual: Number(v.stock_actual),
                categoriaId: v.categoriaId,
            };
            this.productosService
                .update(this.productoId, input)
                .subscribe({
                    next: () => {
                        this.saving.set(false);
                        this.toast.success('Producto actualizado correctamente.');
                        this.router.navigate(['/home/productos']);
                    },
                    error: (err) => {
                        this.saving.set(false);
                        this.toast.error(err);
                    },
                });
        } else {
            this.productosService
                .create({
                    codigo: v.codigo,
                    nombre: v.nombre,
                    precio_venta: Number(v.precio_venta),
                    stock_actual: Number(v.stock_actual),
                    categoriaId: v.categoriaId,
                })
                .subscribe({
                    next: (res) => {
                        this.saving.set(false);
                        this.toast.success(res.message);
                        this.router.navigate(['/home/productos']);
                    },
                    error: (err) => {
                        this.saving.set(false);
                        this.toast.error(err);
                    },
                });
        }
    }

    cancelar(): void {
        this.router.navigate(['/home/productos']);
    }
}
