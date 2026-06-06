import { Component, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router'; // Importante para routerLink
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { MyConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '@/features/auth/services/auth.service';

@Component({
    selector: 'my-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, MyConfigurator],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button
                class="layout-menu-button layout-topbar-action"
                (click)="layoutService.onMenuToggle()"
            >
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/dashboard">
                <div class="logo-mask" role="img" aria-label="Logo"></div>
                <span>Compex</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button
                    type="button"
                    class="layout-topbar-action"
                    (click)="toggleDarkMode()"
                >
                    <i
                        [ngClass]="{
                            'pi ': true,
                            'pi-moon': layoutService.isDarkTheme(),
                            'pi-sun': !layoutService.isDarkTheme(),
                        }"
                    ></i>
                </button>
                <div class="relative">
                    <!-- <button
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                    >
                        <i class="pi pi-palette"></i>
                    </button> -->
                    <my-configurator />
                </div>
            </div>
        </div>
    </div>`,
})
export class AppTopbar {
    items!: MenuItem[];

    private authService = inject(AuthService);

    constructor(public layoutService: LayoutService) {}

    toggleDarkMode() {
        this.layoutService.toggleTheme();
    }

    logout() {
        this.authService.logout();
    }
}
