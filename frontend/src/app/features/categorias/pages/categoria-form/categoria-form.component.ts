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

import { ToastService } from '@/core/services/toast.service';
import { AuthService } from '@/features/auth/services/auth.service';
import { SucursalesService } from '@/features/sucursales/services/sucursales.service';
import { Sucursal } from '@/features/sucursales/models/sucursal.interface';
import { CategoriasService } from '../../services/categorias.service';

@Component({
    selector: 'app-categoria-form',
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
    ],
    template: `
        <div class="max-w-2xl mx-auto">
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
                                ? 'Editar Categoría'
                                : 'Nueva Categoría'
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
                                El código es requerido (máx. 160 caracteres)
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
                                El nombre es requerido (máx. 120 caracteres)
                            </small>
                        </div>

                        <div class="md:col-span-2" *ngIf="mostrarSucursal()">
                            <p-floatlabel variant="on">
                                <p-select
                                    inputId="sucursalId"
                                    formControlName="sucursalId"
                                    [options]="sucursales()"
                                    optionLabel="nombre"
                                    optionValue="id"
                                    placeholder="Seleccionar sucursal"
                                    styleClass="w-full"
                                    [filter]="true"
                                    filterBy="nombre"
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
                                : 'Crear categoría'
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
export class CategoriaFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private categoriasService = inject(CategoriasService);
    private sucursalesService = inject(SucursalesService);
    private auth = inject(AuthService);
    private toast = inject(ToastService);

    form!: FormGroup;
    sucursales = signal<Sucursal[]>([]);

    esEdicion = signal<boolean>(false);
    loadingData = signal<boolean>(false);
    saving = signal<boolean>(false);
    categoriaId: number | null = null;

    ngOnInit(): void {
        this.construirFormulario();
        this.detectarModo();
    }

    private construirFormulario(): void {
        const user = this.auth.currentUser();
        const defaultSucursalId =
            user?.rol_global === 'super_admin' ? null : user?.sucursal_id ?? null;

        this.form = this.fb.group({
            codigo: ['', [Validators.required, Validators.maxLength(160)]],
            nombre: ['', [Validators.required, Validators.maxLength(120)]],
            sucursalId: [defaultSucursalId, [Validators.required]],
        });
    }

    private detectarModo(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.categoriaId = Number(id);
            this.esEdicion.set(true);
            this.sucursalControl?.clearValidators();
            this.sucursalControl?.disable();
            this.cargarCategoria();
        } else {
            if (this.auth.currentUser()?.rol_global === 'super_admin') {
                this.cargarSucursales();
            } else {
                this.sucursalControl?.disable();
            }
        }
    }

    private get sucursalControl() {
        return this.form.get('sucursalId');
    }

    private cargarCategoria(): void {
        if (!this.categoriaId) return;
        this.loadingData.set(true);
        this.categoriasService.get(this.categoriaId).subscribe({
            next: (c) => {
                this.form.patchValue({
                    codigo: c.codigo,
                    nombre: c.nombre,
                    sucursalId: c.sucursal_id ?? null,
                });
                this.loadingData.set(false);
            },
            error: (err) => {
                this.loadingData.set(false);
                this.toast.error(err, 'No se pudo cargar la categoría');
                this.cancelar();
            },
        });
    }

    private cargarSucursales(): void {
        this.sucursalesService.list().subscribe({
            next: (data) => this.sucursales.set(data),
            error: () => undefined,
        });
    }

    mostrarSucursal(): boolean {
        if (this.esEdicion()) return false;
        return this.auth.currentUser()?.rol_global === 'super_admin';
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
        const v = this.form.value;

        if (this.esEdicion() && this.categoriaId !== null) {
            this.categoriasService
                .update(this.categoriaId, {
                    codigo: v.codigo,
                    nombre: v.nombre,
                })
                .subscribe({
                    next: () => {
                        this.saving.set(false);
                        this.toast.success('Categoría actualizada correctamente.');
                        this.router.navigate(['/home/categorias']);
                    },
                    error: (err) => {
                        this.saving.set(false);
                        this.toast.error(err);
                    },
                });
        } else {
            this.categoriasService
                .create({
                    codigo: v.codigo,
                    nombre: v.nombre,
                    sucursalId: v.sucursalId,
                })
                .subscribe({
                    next: (res) => {
                        this.saving.set(false);
                        this.toast.success(res.message);
                        this.router.navigate(['/home/categorias']);
                    },
                    error: (err) => {
                        this.saving.set(false);
                        this.toast.error(err);
                    },
                });
        }
    }

    cancelar(): void {
        this.router.navigate(['/home/categorias']);
    }
}
