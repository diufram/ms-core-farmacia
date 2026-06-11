import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PasswordModule } from 'primeng/password';

import { ToastService } from '@/core/services/toast.service';
import { SucursalesService } from '../../services/sucursales.service';
import { Sucursal } from '../../models/sucursal.interface';

@Component({
  selector: 'app-sucursal-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    FloatLabelModule,
    CardModule,
    DividerModule,
    ProgressSpinnerModule,
    PasswordModule
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
            {{ esEdicion() ? 'Editar Sucursal' : 'Nueva Sucursal' }}
          </h1>
          <p class="text-muted-color m-0 mt-1">
            {{
              esEdicion()
                ? 'Modifica los datos de la sucursal'
                : 'Crea una nueva sucursal con su administrador'
            }}
          </p>
        </div>
      </div>

      <div *ngIf="loadingData()" class="flex justify-center py-12">
        <p-progress-spinner strokeWidth="3" />
      </div>

      <form *ngIf="!loadingData()" [formGroup]="form" (ngSubmit)="guardar()" class="space-y-4">
        <p-card>
          <ng-template pTemplate="header">
            <div class="px-6 pt-5">
              <h3 class="text-lg font-semibold text-color m-0">Datos de la sucursal</h3>
            </div>
          </ng-template>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <p-floatlabel variant="on">
                <input pInputText id="nombre" type="text" formControlName="nombre" class="w-full" />
                <label for="nombre">Nombre *</label>
              </p-floatlabel>
              <small *ngIf="invalid('nombre')" class="text-red-500 mt-1 block">
                El nombre es requerido (máx. 150 caracteres)
              </small>
            </div>

            <div>
              <p-floatlabel variant="on">
                <input pInputText id="ciudad" type="text" formControlName="ciudad" class="w-full" />
                <label for="ciudad">Ciudad</label>
              </p-floatlabel>
            </div>

            <div>
              <p-floatlabel variant="on">
                <input
                  pInputText
                  id="telefono"
                  type="text"
                  formControlName="telefono"
                  class="w-full"
                />
                <label for="telefono">Teléfono</label>
              </p-floatlabel>
            </div>

            <div>
              <p-floatlabel variant="on">
                <input
                  pInputText
                  id="direccion"
                  type="text"
                  formControlName="direccion"
                  class="w-full"
                />
                <label for="direccion">Dirección *</label>
              </p-floatlabel>
              <small *ngIf="invalid('direccion')" class="text-red-500 mt-1 block">
                La dirección es requerida
              </small>
            </div>

            <div>
              <p-floatlabel variant="on">
                <p-inputNumber
                  inputId="latitud"
                  formControlName="latitud"
                  mode="decimal"
                  [minFractionDigits]="2"
                  [maxFractionDigits]="7"
                  [min]="-90"
                  [max]="90"
                  styleClass="w-full"
                />
                <label for="latitud">Latitud</label>
              </p-floatlabel>
            </div>

            <div>
              <p-floatlabel variant="on">
                <p-inputNumber
                  inputId="longitud"
                  formControlName="longitud"
                  mode="decimal"
                  [minFractionDigits]="2"
                  [maxFractionDigits]="7"
                  [min]="-180"
                  [max]="180"
                  styleClass="w-full"
                />
                <label for="longitud">Longitud</label>
              </p-floatlabel>
            </div>
          </div>
        </p-card>

        <p-card *ngIf="!esEdicion()">
          <ng-template pTemplate="header">
            <div class="px-6 pt-5">
              <h3 class="text-lg font-semibold text-color m-0">Administrador de la sucursal</h3>
              <p class="text-muted-color text-sm m-0 mt-1">
                Se creará un usuario con rol admin para esta sucursal.
              </p>
            </div>
          </ng-template>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <p-floatlabel variant="on">
                <input
                  pInputText
                  id="nombre_admin"
                  type="text"
                  formControlName="nombre_admin"
                  class="w-full"
                />
                <label for="nombre_admin">Nombre del admin *</label>
              </p-floatlabel>
              <small *ngIf="invalid('nombre_admin')" class="text-red-500 mt-1 block">
                El nombre es requerido
              </small>
            </div>

            <div>
              <p-floatlabel variant="on">
                <input
                  pInputText
                  id="apellido_admin"
                  type="text"
                  formControlName="apellido_admin"
                  class="w-full"
                />
                <label for="apellido_admin">Apellido del admin *</label>
              </p-floatlabel>
              <small *ngIf="invalid('apellido_admin')" class="text-red-500 mt-1 block">
                El apellido es requerido
              </small>
            </div>

            <div>
              <p-floatlabel variant="on">
                <input
                  pInputText
                  id="celular_admin"
                  type="text"
                  formControlName="celular_admin"
                  class="w-full"
                />
                <label for="celular_admin">Celular del admin</label>
              </p-floatlabel>
            </div>

            <div>
              <p-floatlabel variant="on">
                <input
                  pInputText
                  id="nombre_usuario_admin"
                  type="text"
                  formControlName="nombre_usuario_admin"
                  class="w-full"
                />
                <label for="nombre_usuario_admin">Nombre de usuario *</label>
              </p-floatlabel>
              <small *ngIf="invalid('nombre_usuario_admin')" class="text-red-500 mt-1 block">
                Mínimo 3 caracteres
              </small>
            </div>

            <div class="md:col-span-2">
              <p-floatlabel variant="on">
                <input
                  pInputText
                  id="correo_admin"
                  type="email"
                  formControlName="correo_admin"
                  class="w-full"
                />
                <label for="correo_admin">Correo del admin *</label>
              </p-floatlabel>
              <small *ngIf="invalid('correo_admin')" class="text-red-500 mt-1 block">
                Ingrese un correo válido
              </small>
            </div>

            <div class="md:col-span-2">
              <p-floatlabel variant="on">
                <p-password
                  inputId="contrasena_admin"
                  formControlName="contrasena_admin"
                  [toggleMask]="true"
                  [feedback]="true"
                  styleClass="w-full"
                  inputStyleClass="w-full"
                >
                </p-password>
                <label for="contrasena_admin">Contraseña del admin *</label>
              </p-floatlabel>
              <small *ngIf="invalid('contrasena_admin')" class="text-red-500 mt-1 block">
                Mínimo 8 caracteres
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
            [label]="esEdicion() ? 'Guardar cambios' : 'Crear sucursal'"
            icon="pi pi-save"
            [loading]="saving()"
            [disabled]="form.invalid || saving()"
          />
        </div>
      </form>
    </div>
  `
})
export class SucursalFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sucursalesService = inject(SucursalesService);
  private toast = inject(ToastService);

  form!: FormGroup;
  esEdicion = signal<boolean>(false);
  loadingData = signal<boolean>(false);
  saving = signal<boolean>(false);
  sucursalId: number | null = null;

  ngOnInit(): void {
    this.construirFormulario();
    this.detectarModo();
  }

  private construirFormulario(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      telefono: ['', [Validators.maxLength(20)]],
      direccion: ['', [Validators.required, Validators.maxLength(255)]],
      ciudad: ['', [Validators.maxLength(100)]],
      latitud: [null as number | null],
      longitud: [null as number | null],

      nombre_admin: [''],
      apellido_admin: [''],
      celular_admin: [''],
      nombre_usuario_admin: ['', [Validators.minLength(3), Validators.maxLength(60)]],
      correo_admin: ['', [Validators.email]],
      contrasena_admin: ['', [Validators.minLength(8)]]
    });
  }

  private detectarModo(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.sucursalId = Number(id);
      this.esEdicion.set(true);
      this.aplicarValidadoresEdicion();
      this.cargarSucursal();
    } else {
      this.aplicarValidadoresCreacion();
    }
  }

  private aplicarValidadoresCreacion(): void {
    this.form.get('nombre_admin')!.setValidators([Validators.required]);
    this.form.get('nombre_admin')!.updateValueAndValidity();
    this.form.get('apellido_admin')!.setValidators([Validators.required]);
    this.form.get('apellido_admin')!.updateValueAndValidity();
    this.form
      .get('nombre_usuario_admin')!
      .setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(60)]);
    this.form.get('nombre_usuario_admin')!.updateValueAndValidity();
    this.form.get('correo_admin')!.setValidators([Validators.required, Validators.email]);
    this.form.get('correo_admin')!.updateValueAndValidity();
    this.form
      .get('contrasena_admin')!
      .setValidators([Validators.required, Validators.minLength(8)]);
    this.form.get('contrasena_admin')!.updateValueAndValidity();
  }

  private aplicarValidadoresEdicion(): void {
    this.form.get('nombre_admin')!.clearValidators();
    this.form.get('apellido_admin')!.clearValidators();
    this.form.get('nombre_usuario_admin')!.clearValidators();
    this.form.get('correo_admin')!.clearValidators();
    this.form.get('contrasena_admin')!.clearValidators();
    this.form.get('nombre_admin')!.updateValueAndValidity();
    this.form.get('apellido_admin')!.updateValueAndValidity();
    this.form.get('nombre_usuario_admin')!.updateValueAndValidity();
    this.form.get('correo_admin')!.updateValueAndValidity();
    this.form.get('contrasena_admin')!.updateValueAndValidity();
  }

  private cargarSucursal(): void {
    if (!this.sucursalId) return;
    this.loadingData.set(true);
    this.sucursalesService.get(this.sucursalId).subscribe({
      next: (s) => {
        this.form.patchValue({
          nombre: s.nombre,
          telefono: s.telefono ?? '',
          direccion: s.direccion,
          ciudad: s.ciudad ?? '',
          latitud: s.latitud ?? null,
          longitud: s.longitud ?? null
        });
        this.loadingData.set(false);
      },
      error: (err) => {
        this.loadingData.set(false);
        this.toast.error(err, 'No se pudo cargar la sucursal');
        this.cancelar();
      }
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
    const v = this.form.value;

    if (this.esEdicion() && this.sucursalId !== null) {
      const input: Record<string, unknown> = {
        nombre: v.nombre,
        telefono: v.telefono || null,
        direccion: v.direccion,
        ciudad: v.ciudad || null,
        latitud: v.latitud ?? null,
        longitud: v.longitud ?? null
      };

      this.sucursalesService.update(this.sucursalId, input).subscribe({
        next: (res) => {
          this.saving.set(false);
          this.toast.success(res.message);
          this.router.navigate(['/home/sucursales']);
        },
        error: (err) => {
          this.saving.set(false);
          this.toast.error(err);
        }
      });
    } else {
      const input = {
        nombre: v.nombre,
        telefono: v.telefono || undefined,
        direccion: v.direccion,
        ciudad: v.ciudad || undefined,
        latitud: v.latitud ?? undefined,
        longitud: v.longitud ?? undefined,
        nombre_admin: v.nombre_admin,
        apellido_admin: v.apellido_admin,
        celular_admin: v.celular_admin || undefined,
        nombre_usuario_admin: v.nombre_usuario_admin,
        correo_admin: v.correo_admin,
        contrasena_admin: v.contrasena_admin
      };

      this.sucursalesService.create(input).subscribe({
        next: (res) => {
          this.saving.set(false);
          this.toast.success(res.message);
          this.router.navigate(['/home/sucursales']);
        },
        error: (err) => {
          this.saving.set(false);
          this.toast.error(err);
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/home/sucursales']);
  }
}
