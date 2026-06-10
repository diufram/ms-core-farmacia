import {
    ApplicationConfig,
    APP_INITIALIZER,
} from '@angular/core';
import {
    provideHttpClient,
    withFetch,
    withInterceptors,
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
    provideRouter,
    withEnabledBlockingInitialNavigation,
    withInMemoryScrolling,
} from '@angular/router';

import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { provideApollo } from 'apollo-angular';

import { appRoutes } from './app.routes';
import { AuthService } from '@/features/auth/services/auth.service';
import { apolloOptionsFactory } from '@/core/graphql/apollo.config';
import { authHttpInterceptor } from '@/core/interceptors/auth-http.interceptor';

export function initializeAppFactory(authService: AuthService) {
    return () => authService.loadSession();
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(
            appRoutes,
            withInMemoryScrolling({
                anchorScrolling: 'enabled',
                scrollPositionRestoration: 'enabled',
            }),
            withEnabledBlockingInitialNavigation(),
        ),
        provideHttpClient(withFetch(), withInterceptors([authHttpInterceptor])),
        provideAnimationsAsync(),
        provideApollo(apolloOptionsFactory),

        {
            provide: APP_INITIALIZER,
            useFactory: initializeAppFactory,
            deps: [AuthService],
            multi: true,
        },

        providePrimeNG({
            theme: {
                options: {
                    darkModeSelector: '.app-dark',
                },
            },
        }),

        MessageService,
    ],
};
