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
import { ClientesService } from '../../services/clientes.service';

@Component({
    selector: 'app-cliente-form',
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
                                ? 'Editar Cliente'
                                : 'Nuevo Cliente'
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
                                Datos del cliente
                            </h3>
                        </div>
                    </ng-template>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                            <p-floatlabel variant="on">
                                <input
                                    pInputText
                                    id="codigo_cliente"
                                    type="text"
                                    formControlName="codigo_cliente"
                                    class="w-full"
                                />
                                <label for="codigo_cliente">Código cliente *</label>
                            </p-floatlabel>
                            <small
                                *ngIf="invalid('codigo_cliente')"
                                class="text-red-500 mt-1 block"
                            >
                                El código es requerido (máx. 60 caracteres)
                            </small>
                        </div>

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
                        <div class="px-6 pt-5">
                            <h3 class="text-lg font-semibold text-color m-0">
                                Datos personales
                            </h3>
                        </div>
                    </ng-template>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
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

                        <div>
                            <p-floatlabel variant="on">
                                <input
                                    pInputText
                                    id="apellido"
                                    type="text"
                                    formControlName="apellido"
                                    class="w-full"
                                />
                                <label for="apellido">Apellido *</label>
                            </p-floatlabel>
                            <small
                                *ngIf="invalid('apellido')"
                                class="text-red-500 mt-1 block"
                            >
                                El apellido es requerido (máx. 120 caracteres)
                            </small>
                        </div>

                        <div class="md:col-span-2">
                            <p-floatlabel variant="on">
                                <input
                                    pInputText
                                    id="celular"
                                    type="text"
                                    formControlName="celular"
                                    class="w-full"
                                />
                                <label for="celular">Celular</label>
                            </p-floatlabel>
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
                                : 'Crear cliente'
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
export class ClienteFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private clientesService = inject(ClientesService);
    private sucursalesService = inject(SucursalesService);
    private auth = inject(AuthService);
    private toast = inject(ToastService);

    form!: FormGroup;
    sucursales = signal<Sucursal[]>([]);

    esEdicion = signal<boolean>(false);
    loadingData = signal<boolean>(false);
    saving = signal<boolean>(false);
    sucursalNombre = signal<string>('');
    clienteId: number | null = null;

    ngOnInit(): void {
        this.construirFormulario();
        if (this.esSuperAdmin()) {
            this.cargarSucursales();
        } else {
            const user = this.auth.currentUser();
            if (user?.sucursal_id) {
                this.sucursalNombre.set(
                    user.sucursal?.nombre ?? `Sucursal #${user.sucursal_id}`,
                );
            }
        }
        this.detectarModo();
    }

    private construirFormulario(): void {
        const user = this.auth.currentUser();
        const sucursalId = user?.sucursal_id ?? null;

        this.form = this.fb.group({
            codigo_cliente: [
                '',
                [Validators.required, Validators.maxLength(60)],
            ],
            sucursalId: [
                this.esSuperAdmin() ? null : sucursalId,
                Validators.required,
            ],
            nombre: ['', [Validators.required, Validators.maxLength(120)]],
            apellido: ['', [Validators.required, Validators.maxLength(120)]],
            celular: ['', Validators.maxLength(20)],
        });
    }

    esSuperAdmin(): boolean {
        return this.auth.currentUser()?.rol_global === 'super_admin';
    }

    cargarSucursales(): void {
        this.sucursalesService.list().subscribe({
            next: (data) => this.sucursales.set(data),
            error: () => undefined,
        });
    }

    private detectarModo(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.clienteId = Number(id);
            this.esEdicion.set(true);
            this.cargarCliente();
        }
    }

    private cargarCliente(): void {
        if (!this.clienteId) return;
        this.loadingData.set(true);
        this.clientesService.get(this.clienteId).subscribe({
            next: (c) => {
                this.form.patchValue({
                    codigo_cliente: c.codigo_cliente,
                    sucursalId: c.sucursal_id,
                    nombre: c.persona.nombre,
                    apellido: c.persona.apellido,
                    celular: c.persona.celular ?? '',
                });
                this.loadingData.set(false);
            },
            error: (err) => {
                this.loadingData.set(false);
                this.toast.error(err, 'No se pudo cargar el cliente');
                this.cancelar();
            },
        });
    }

    invalid(field: string): boolean {
        const ctrl = this.form.get(field);
        return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
    }

    guardar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.saving.set(true);
        const v = this.form.getRawValue();

        if (this.esEdicion() && this.clienteId !== null) {
            const input: import('../../models/cliente.interface').UpdateClienteInput = {};
            if (v.codigo_cliente) input['codigo_cliente'] = v.codigo_cliente;
            input['persona'] = {
                nombre: v.nombre,
                apellido: v.apellido,
                celular: v.celular || null,
            };

            this.clientesService
                .update(this.clienteId, input)
                .subscribe({
                    next: () => {
                        this.saving.set(false);
                        this.toast.success(
                            'Cliente actualizado correctamente.',
                        );
                        this.router.navigate(['/home/clientes']);
                    },
                    error: (err) => {
                        this.saving.set(false);
                        this.toast.error(err);
                    },
                });
        } else {
            this.clientesService
                .create({
                    codigo_cliente: v.codigo_cliente,
                    sucursalId: Number(v.sucursalId),
                    persona: {
                        nombre: v.nombre,
                        apellido: v.apellido,
                        celular: v.celular || null,
                    },
                })
                .subscribe({
                    next: (res) => {
                        this.saving.set(false);
                        this.toast.success(res.message);
                        this.router.navigate(['/home/clientes']);
                    },
                    error: (err) => {
                        this.saving.set(false);
                        this.toast.error(err);
                    },
                });
        }
    }

    cancelar(): void {
        this.router.navigate(['/home/clientes']);
    }
}
