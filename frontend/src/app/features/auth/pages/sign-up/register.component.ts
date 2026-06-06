import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '@/core/services/toast.service';
import { MyFloatingConfigurator } from '@/core/layout/component/app.floatingconfigurator';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        FloatLabelModule,
        RouterModule,
        MyFloatingConfigurator,
    ],
    templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private authService = inject(AuthService);
    private toast = inject(ToastService);

    form: FormGroup;
    loading = false;

    constructor() {
        this.form = this.fb.group(
            {
                nombre: ['', Validators.required],
                apellido: ['', Validators.required],
                nombre_usuario: [
                    '',
                    [Validators.required, Validators.minLength(3)],
                ],
                correo_electronico: [
                    '',
                    [Validators.required, Validators.email],
                ],
                celular: [''],
                contrasena: [
                    '',
                    [Validators.required, Validators.minLength(8)],
                ],
                confirmarContrasena: ['', Validators.required],
            },
            { validators: this.passwordMatchValidator },
        );
    }

    ngOnInit(): void {
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/home']);
        }
    }

    passwordMatchValidator(group: FormGroup) {
        const password = group.get('contrasena')?.value;
        const confirm = group.get('confirmarContrasena')?.value;
        return password === confirm ? null : { mismatch: true };
    }

    isInvalid(fieldName: string): boolean {
        const control = this.form.get(fieldName);
        return !!(
            control &&
            control.invalid &&
            (control.dirty || control.touched)
        );
    }

    hasPasswordMismatch(): boolean {
        return !!(
            this.form.errors?.['mismatch'] &&
            this.form.get('confirmarContrasena')?.dirty &&
            this.form.get('confirmarContrasena')?.touched
        );
    }

    onRegister(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading = true;

        const {
            nombre,
            apellido,
            nombre_usuario,
            correo_electronico,
            celular,
            contrasena,
        } = this.form.value;

        this.authService
            .register({
                nombre,
                apellido,
                nombre_usuario,
                correo_electronico,
                celular: celular || undefined,
                contrasena,
            })
            .subscribe({
                next: () => {
                    this.toast.success('Exito', 'Cuenta creada correctamente.');
                    this.loading = false;
                    this.router.navigate(['/home']);
                },
                error: (err) => {
                    console.error('Error en registro:', err);
                    this.loading = false;
                    const msg = err?.message || 'No se pudo crear la cuenta.';
                    this.toast.error('Error', msg);
                },
            });
    }
}
