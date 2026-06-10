import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { ToastService } from '@/core/services/toast.service';
import { SucursalesService } from '@/features/sucursales/services/sucursales.service';
import { Sucursal } from '@/features/sucursales/models/sucursal.interface';
import { UsuariosService } from '../../services/usuarios.service';
import {
    AssignSucursalInput,
    Rol,
    Usuario,
    UsuarioAsignacion,
} from '../../models/usuario.interface';

@Component({
    selector: 'app-usuario-form',
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
        DividerModule,
        ProgressSpinnerModule,
        PasswordModule,
        SelectModule,
        TagModule,
        TooltipModule,
        TableModule,
        ConfirmDialogModule,
    ],
    providers: [ConfirmationService],
    template: `
        <div class="max-w-5xl mx-auto">
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
                                ? 'Editar Usuario'
                                : 'Nuevo Usuario'
                        }}
                    </h1>
                    <p class="text-muted-color m-0 mt-1">
                        {{
                            esEdicion()
                                ? 'Modifica los datos del usuario y sus sucursales'
                                : 'Crea un nuevo usuario y asígnalo a una sucursal'
                        }}
                    </p>
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
                                Datos personales
                            </h3>
                        </div>
                    </ng-template>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
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
                                El nombre es requerido
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
                                El apellido es requerido
                            </small>
                        </div>

                        <div>
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

                <p-card>
                    <ng-template pTemplate="header">
                        <div class="px-6 pt-5">
                            <h3 class="text-lg font-semibold text-color m-0">
                                Datos de cuenta
                            </h3>
                        </div>
                    </ng-template>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                            <p-floatlabel variant="on">
                                <input
                                    pInputText
                                    id="nombre_usuario"
                                    type="text"
                                    formControlName="nombre_usuario"
                                    class="w-full"
                                />
                                <label for="nombre_usuario"
                                    >Nombre de usuario *</label
                                >
                            </p-floatlabel>
                            <small
                                *ngIf="invalid('nombre_usuario')"
                                class="text-red-500 mt-1 block"
                            >
                                Mínimo 3 caracteres
                            </small>
                        </div>

                        <div>
                            <p-floatlabel variant="on">
                                <input
                                    pInputText
                                    id="correo_electronico"
                                    type="email"
                                    formControlName="correo_electronico"
                                    class="w-full"
                                />
                                <label for="correo_electronico"
                                    >Correo electrónico *</label
                                >
                            </p-floatlabel>
                            <small
                                *ngIf="invalid('correo_electronico')"
                                class="text-red-500 mt-1 block"
                            >
                                Ingrese un correo válido
                            </small>
                        </div>

                        <div *ngIf="!esEdicion()">
                            <p-floatlabel variant="on">
                                <p-password
                                    inputId="contrasena"
                                    formControlName="contrasena"
                                    [toggleMask]="true"
                                    [feedback]="true"
                                    styleClass="w-full"
                                    inputStyleClass="w-full"
                                />
                                <label for="contrasena">Contraseña *</label>
                            </p-floatlabel>
                            <small
                                *ngIf="invalid('contrasena')"
                                class="text-red-500 mt-1 block"
                            >
                                Mínimo 8 caracteres
                            </small>
                        </div>

                        <div>
                            <p-floatlabel variant="on">
                                <p-select
                                    inputId="rol"
                                    formControlName="rol"
                                    [options]="rolOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    styleClass="w-full"
                                />
                                <label for="rol">Rol *</label>
                            </p-floatlabel>
                        </div>
                    </div>
                </p-card>

                <p-card *ngIf="!esEdicion()">
                    <ng-template pTemplate="header">
                        <div class="px-6 pt-5">
                            <h3 class="text-lg font-semibold text-color m-0">
                                Sucursales iniciales
                            </h3>
                            <p class="text-muted-color text-sm m-0 mt-1">
                                Asigna al usuario a una o más sucursales. Podrás
                                administrarlas más tarde.
                            </p>
                        </div>
                    </ng-template>

                    <div class="space-y-3 pt-2">
                        <div
                            *ngFor="
                                let ctrl of sucursalesControls.controls;
                                let i = index
                            "
                            [formGroup]="sucursalesControls.at(i)"
                            class="flex items-end gap-3"
                        >
                            <div class="flex-1">
                                <p-floatlabel variant="on">
                                    <p-select
                                        [inputId]="'sucursal-' + i"
                                        formControlName="sucursalId"
                                        [options]="sucursalesDisponibles()"
                                        optionLabel="nombre"
                                        optionValue="id"
                                        placeholder="Seleccionar sucursal"
                                        styleClass="w-full"
                                        [filter]="true"
                                        filterBy="nombre"
                                    />
                                    <label [for]="'sucursal-' + i"
                                        >Sucursal</label
                                    >
                                </p-floatlabel>
                            </div>
                            <p-button
                                icon="pi pi-trash"
                                severity="danger"
                                [text]="true"
                                (onClick)="quitarSucursalInicial(i)"
                                pTooltip="Quitar"
                            />
                        </div>
                        <p-button
                            icon="pi pi-plus"
                            label="Agregar sucursal"
                            severity="secondary"
                            [outlined]="true"
                            (onClick)="agregarSucursalInicial()"
                        />
                    </div>
                </p-card>

                <p-card *ngIf="esEdicion()">
                    <ng-template pTemplate="header">
                        <div class="px-6 pt-5 flex items-center justify-between">
                            <div>
                                <h3 class="text-lg font-semibold text-color m-0">
                                    Sucursales asignadas
                                </h3>
                                <p class="text-muted-color text-sm m-0 mt-1">
                                    Gestiona las sucursales a las que pertenece
                                    este usuario.
                                </p>
                            </div>
                        </div>
                    </ng-template>

                    <div class="space-y-3 pt-2">
                        <p-table
                            [value]="usuario()?.asignaciones ?? []"
                            styleClass="p-datatable-sm"
                        >
                            <ng-template pTemplate="header">
                                <tr>
                                <th>Sucursal</th>
                                <th>Estado</th>
                                    <th class="text-right">Acciones</th>
                                </tr>
                            </ng-template>
                            <ng-template
                                pTemplate="body"
                                let-asig
                            >
                                <tr>
                                    <td>{{ asig.sucursal.nombre }}</td>
                                    <td>
                                        <p-tag
                                            [value]="
                                                asig.activo
                                                    ? 'Activo'
                                                    : 'Inactivo'
                                            "
                                            [severity]="
                                                asig.activo
                                                    ? 'success'
                                                    : 'danger'
                                            "
                                        />
                                    </td>
                                    <td class="text-right">
                                        <p-button
                                            icon="pi pi-times"
                                            severity="danger"
                                            [text]="true"
                                            (onClick)="
                                                quitarAsignacion(asig)
                                            "
                                            pTooltip="Quitar de esta sucursal"
                                        />
                                    </td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="emptymessage">
                                <tr>
                                    <td
                                        colspan="3"
                                        class="text-center text-muted-color py-4"
                                    >
                                        El usuario no está asignado a ninguna
                                        sucursal.
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>

                        <div class="flex flex-wrap items-end gap-3 pt-3">
                            <div class="flex-1 min-w-[200px]">
                                <p-floatlabel variant="on">
                                    <p-select
                                        inputId="nueva-sucursal"
                                        [options]="sucursalesParaAsignar()"
                                        [(ngModel)]="nuevaAsignacionSucursalId"
                                        [ngModelOptions]="{
                                            standalone: true
                                        }"
                                        optionLabel="nombre"
                                        optionValue="id"
                                        placeholder="Seleccionar sucursal"
                                        styleClass="w-full"
                                        [filter]="true"
                                        filterBy="nombre"
                                    />
                                    <label for="nueva-sucursal"
                                        >Agregar a sucursal</label
                                    >
                                </p-floatlabel>
                            </div>
                            <p-button
                                icon="pi pi-plus"
                                label="Asignar"
                                (onClick)="asignarSucursal()"
                                [disabled]="!nuevaAsignacionSucursalId"
                            />
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
                            esEdicion() ? 'Guardar cambios' : 'Crear usuario'
                        "
                        icon="pi pi-save"
                        [loading]="saving()"
                        [disabled]="form.invalid || saving()"
                    />
                </div>
            </form>
        </div>
        <p-confirmDialog />
    `,
})
export class UsuarioFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private usuariosService = inject(UsuariosService);
    private sucursalesService = inject(SucursalesService);
    private toast = inject(ToastService);
    private confirmation = inject(ConfirmationService);

    form!: FormGroup;
    sucursalesIniciales: FormGroup[] = [];

    esEdicion = signal<boolean>(false);
    loadingData = signal<boolean>(false);
    saving = signal<boolean>(false);
    usuario = signal<Usuario | null>(null);
    usuarioId: number | null = null;

    sucursales = signal<Sucursal[]>([]);
    nuevaAsignacionSucursalId: number | null = null;

    rolOptions = [
        { label: 'Administrador', value: 'admin' as Rol },
        { label: 'Super Administrador', value: 'super_admin' as Rol },
    ];

    get sucursalesControls(): FormArray<FormGroup> {
        return this.form.get('sucursalesIniciales') as FormArray<FormGroup>;
    }

    ngOnInit(): void {
        this.construirFormulario();
        this.cargarSucursales();
        this.detectarModo();
    }

    private construirFormulario(): void {
        this.form = this.fb.group({
            nombre: ['', [Validators.required, Validators.maxLength(120)]],
            apellido: ['', [Validators.required, Validators.maxLength(120)]],
            celular: ['', [Validators.maxLength(20)]],
            nombre_usuario: [
                '',
                [Validators.required, Validators.minLength(3), Validators.maxLength(60)],
            ],
            correo_electronico: ['', [Validators.required, Validators.email]],
            contrasena: ['', [Validators.minLength(8)]],
            rol: ['admin' as Rol, Validators.required],
            sucursalesIniciales: this.fb.array<FormGroup>([]),
        });
    }

    private detectarModo(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.usuarioId = Number(id);
            this.esEdicion.set(true);
            this.cargarUsuario();
        } else {
            this.aplicarValidadoresCreacion();
        }
    }

    private aplicarValidadoresCreacion(): void {
        this.form
            .get('contrasena')!
            .setValidators([Validators.required, Validators.minLength(8)]);
        this.form.get('contrasena')!.updateValueAndValidity();
    }

    private cargarUsuario(): void {
        if (!this.usuarioId) return;
        this.loadingData.set(true);
        this.usuariosService.get(this.usuarioId).subscribe({
            next: (u) => {
                this.usuario.set(u);
                this.form.patchValue({
                    nombre: u.persona.nombre,
                    apellido: u.persona.apellido,
                    celular: u.persona.celular ?? '',
                    nombre_usuario: u.nombre_usuario,
                    correo_electronico: u.correo_electronico,
                    rol: u.rol,
                });
                this.loadingData.set(false);
            },
            error: (err) => {
                this.loadingData.set(false);
                this.toast.error(err, 'No se pudo cargar el usuario');
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

    sucursalesDisponibles(): Sucursal[] {
        const asignadas = new Set(
            this.sucursalesIniciales
                .map((g) => g.get('sucursalId')?.value)
                .filter((v) => v != null),
        );
        return this.sucursales().filter((s) => !asignadas.has(s.id));
    }

    sucursalesParaAsignar(): Sucursal[] {
        const asignadasIds = new Set(
            (this.usuario()?.asignaciones ?? []).map((a) => a.sucursal.id),
        );
        return this.sucursales().filter((s) => !asignadasIds.has(s.id));
    }

    agregarSucursalInicial(): void {
        const grupo = this.fb.group({
            sucursalId: [null as number | null, Validators.required],
        });
        this.sucursalesIniciales.push(grupo);
        this.sucursalesControls.push(grupo);
    }

    quitarSucursalInicial(index: number): void {
        this.sucursalesIniciales.splice(index, 1);
        this.sucursalesControls.removeAt(index);
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

        if (this.esEdicion() && this.usuarioId !== null) {
            const input: Record<string, unknown> = {
                persona: {
                    nombre: v.nombre,
                    apellido: v.apellido,
                    celular: v.celular || null,
                },
                nombre_usuario: v.nombre_usuario,
                correo_electronico: v.correo_electronico,
                rol: v.rol,
            };
            this.usuariosService
                .update(this.usuarioId, input)
                .subscribe({
                    next: (res) => {
                        this.saving.set(false);
                        this.toast.success(res.message);
                        this.router.navigate(['/home/usuarios']);
                    },
                    error: (err) => {
                        this.saving.set(false);
                        this.toast.error(err);
                    },
                });
        } else {
            const input = {
                persona: {
                    nombre: v.nombre,
                    apellido: v.apellido,
                    celular: v.celular || undefined,
                },
                nombre_usuario: v.nombre_usuario,
                correo_electronico: v.correo_electronico,
                contrasena: v.contrasena,
                rol: v.rol,
                sucursales: this.sucursalesIniciales
                    .map((g) => ({
                        sucursalId: g.get('sucursalId')?.value,
                    }))
                    .filter((s) => s.sucursalId != null) as {
                    sucursalId: number;
                }[],
            };
            this.usuariosService.create(input).subscribe({
                next: (res) => {
                    this.saving.set(false);
                    this.toast.success(res.message);
                    this.router.navigate(['/home/usuarios']);
                },
                error: (err) => {
                    this.saving.set(false);
                    this.toast.error(err);
                },
            });
        }
    }

    asignarSucursal(): void {
        if (!this.usuarioId || !this.nuevaAsignacionSucursalId) return;
        const input: AssignSucursalInput = {
            sucursalId: this.nuevaAsignacionSucursalId,
        };
        this.usuariosService
            .assignSucursal(this.usuarioId, input)
            .subscribe({
                next: (res) => {
                    this.toast.success(res.message);
                    this.usuario.set(res.usuario);
                    this.nuevaAsignacionSucursalId = null;
                },
                error: (err) => this.toast.error(err),
            });
    }

    quitarAsignacion(asig: UsuarioAsignacion): void {
        if (!this.usuarioId) return;
        this.confirmation.confirm({
            message: `¿Quitar al usuario de la sucursal "${asig.sucursal.nombre}"?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Quitar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.usuariosService
                    .unassignSucursal(this.usuarioId!, asig.sucursal.id)
                    .subscribe({
                        next: (res) => {
                            this.toast.success(res.message);
                            this.usuario.set(res.usuario);
                        },
                        error: (err) => this.toast.error(err),
                    });
            },
        });
    }

    cancelar(): void {
        this.router.navigate(['/home/usuarios']);
    }
}
