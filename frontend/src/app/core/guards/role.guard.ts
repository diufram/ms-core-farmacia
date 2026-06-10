import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@/features/auth/services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    const allowedRoles = (route.data?.['roles'] as string[] | undefined) ?? [];
    if (allowedRoles.length === 0) {
        return true;
    }

    const user = authService.currentUser();
    if (!user) {
        localStorage.setItem('redirect_url', state.url);
        router.navigate(['/auth/login']);
        return false;
    }

    if (allowedRoles.includes(user.rol)) {
        return true;
    }

    router.navigate(['/home']);
    return false;
};
