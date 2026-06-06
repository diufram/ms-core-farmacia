import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { MyConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';

@Component({
    selector: 'my-floating-configurator',
    standalone: true,
    imports: [CommonModule, ButtonModule, StyleClassModule, MyConfigurator],
    template: `
        <div class="flex gap-4 top-8 right-8" [ngClass]="{ fixed: float() }">
            <p-button
                type="button"
                (onClick)="toggleDarkMode()"
                [rounded]="true"
                [icon]="isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun'"
                severity="secondary"
            />
            <div class="relative">
                <!-- <p-button
                    icon="pi pi-palette"
                    pStyleClass="@next"
                    enterFromClass="hidden"
                    enterActiveClass="animate-scalein"
                    leaveToClass="hidden"
                    leaveActiveClass="animate-fadeout"
                    [hideOnOutsideClick]="true"
                    type="button"
                    rounded
                /> -->
                <my-configurator />
            </div>
        </div>
    `,
})
export class MyFloatingConfigurator {
    private layoutService = inject(LayoutService);

    float = input<boolean>(true);

    isDarkTheme = computed(() => !!this.layoutService.layoutConfig().darkTheme);

    toggleDarkMode() {
        this.layoutService.toggleTheme(); // ✅ persiste theme_preference + aplica ocean default si no hay elección user
    }
}
