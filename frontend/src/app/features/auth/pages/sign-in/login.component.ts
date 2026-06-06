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
    selector: 'app-login',
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
    templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private authService = inject(AuthService);
    private toast = inject(ToastService);

    form: FormGroup;
    loading = false;

    constructor() {
        this.form = this.fb.group({
            correo_electronico: ['', [Validators.required, Validators.email]],
            contrasena: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/home']);
        }
    }

    isInvalid(fieldName: string): boolean {
        const control = this.form.get(fieldName);
        return !!(
            control &&
            control.invalid &&
            (control.dirty || control.touched)
        );
    }

    onLogin(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading = true;

        const { correo_electronico, contrasena } = this.form.value;

        this.authService.login({ correo_electronico, contrasena }).subscribe({
            next: () => {
                this.toast.success(
                    '¡Bienvenido!',
                    'Sesión iniciada correctamente',
                );
                this.loading = false;
                this.router.navigate(['/home']);
            },
            error: (err) => {
                console.error('Error en login:', err);
                this.loading = false;
                const msg = err?.message || 'Error al iniciar sesión';
                this.toast.error('Error', msg);
            },
        });
    }
}
