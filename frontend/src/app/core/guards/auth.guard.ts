import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@/features/auth/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    if (authService.isAuthenticated()) return true;

    const token = localStorage.getItem('token');
    if (token) return true;

    localStorage.setItem('redirect_url', state.url);
    router.navigate(['/auth/login']);
    return false;
};
