import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../features/auth/services/auth.service';
import { MyMenuitem } from './app.menuitem';
import { LayoutService } from '../service/layout.service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'my-menu',
    standalone: true,
    imports: [CommonModule, MyMenuitem, RouterModule],
    styles: [
        `
            .menu-wrapper {
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                overflow-x: hidden;
                width: 100%;
            }

            :host ::ng-deep .layout-menu {
                padding: 0.5rem 0;
                list-style-type: none;
                margin: 0;
            }

            :host ::ng-deep .layout-menu li {
                width: 100%;
            }

            :host ::ng-deep .layout-root-menuitem > .layout-menuitem-root-text {
                font-size: 0.85rem;
                text-transform: uppercase;
                font-weight: 700;
                color: var(--text-color-secondary);
                margin: 1.5rem 0 0.5rem 1rem;
                display: block;
                letter-spacing: 0.5px;
            }

            :host
                ::ng-deep
                .layout-menu
                > li:first-child
                .layout-menuitem-root-text {
                margin-top: 0.5rem;
            }

            :host ::ng-deep .layout-menu li a {
                margin: 2px 12px !important;
                border-radius: 12px !important;
                padding: 0.75rem 1rem !important;
                border: 1px solid transparent !important;
                cursor: pointer;
                display: flex;
                align-items: center;
                text-decoration: none;
                color: var(--text-color);
                font-weight: 600;
            }

            :host ::ng-deep .layout-menu li a:hover {
                background-color: var(--surface-hover) !important;
            }

            :host ::ng-deep .layout-menu li a.router-link-active,
            :host ::ng-deep .layout-menu li a.active-route {
                background-color: var(--surface-card) !important;
                box-shadow:
                    0 4px 12px -2px rgba(0, 0, 0, 0.08),
                    0 2px 6px -2px rgba(0, 0, 0, 0.04) !important;
                color: var(--primary-color) !important;
                font-weight: 600 !important;
                border: 1px solid var(--surface-border) !important;
                opacity: 1 !important;
            }

            :host ::ng-deep .layout-menu li a.router-link-active i,
            :host ::ng-deep .layout-menu li a.active-route i {
                color: var(--primary-color) !important;
            }

            :host ::ng-deep .layout-menu-item-icon {
                margin-right: 0.5rem;
            }
        `,
    ],
    template: `
        <div class="menu-wrapper">
            <ul class="layout-menu">
                <ng-container *ngFor="let item of model; let i = index">
                    <li class="layout-root-menuitem" *ngIf="!item.separator">
                        <div class="layout-menuitem-root-text">
                            {{ item.label }}
                        </div>

                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <ng-container
                                *ngFor="let child of item.items; let j = index"
                            >
                                <li
                                    my-menuitem
                                    *ngIf="child.visible !== false"
                                    [item]="child"
                                    [index]="j"
                                    [root]="false"
                                ></li>
                            </ng-container>
                        </ul>
                    </li>

                    <li *ngIf="item.separator" class="menu-separator"></li>
                </ng-container>
            </ul>
        </div>
    `,
})
export class MyMenu implements OnInit {
    model: MenuItem[] = [];

    public authService = inject(AuthService);
    private router = inject(Router);
    private layoutService = inject(LayoutService);

    ngOnInit() {
        this.model = this.buildModel();

        this.router.events
            .pipe(filter((e) => e instanceof NavigationEnd))
            .subscribe(() => {
                this.model = this.buildModel();
                this.layoutService.onMenuStateChange({
                    key: 'route',
                    routeEvent: true,
                });
            });
    }

    private buildModel(): MenuItem[] {
        const model: MenuItem[] = [
            {
                label: 'Principal',
                items: [
                    {
                        label: 'Inicio',
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/home'],
                    },
                ],
            },
            {
                label: 'Administración',
                items: [
                    {
                        label: 'Sucursales',
                        icon: 'pi pi-fw pi-building',
                        routerLink: ['/home/sucursales'],
                    },
                    {
                        label: 'Usuarios',
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/home/usuarios'],
                    },
                    {
                        label: 'Categorías',
                        icon: 'pi pi-fw pi-tags',
                        routerLink: ['/home/categorias'],
                    },
                    {
                        label: 'Productos',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['/home/productos'],
                    },
                    {
                        label: 'Ventas',
                        icon: 'pi pi-fw pi-shopping-cart',
                        routerLink: ['/home/ventas'],
                    },
                    {
                        label: 'Clientes',
                        icon: 'pi pi-fw pi-user',
                        routerLink: ['/home/clientes'],
                    },
                ],
            },
            {
                label: 'Reportes',
                items: [
                    {
                        label: 'Ventas',
                        icon: 'pi pi-fw pi-chart-line',
                        routerLink: ['/home/reportes/ventas'],
                    },
                    {
                        label: 'Inventario',
                        icon: 'pi pi-fw pi-warehouse',
                        routerLink: ['/home/reportes/inventario'],
                    },
                ],
            },
            {
                label: 'Documentos',
                items: [
                    {
                        label: 'Gestor de Archivos',
                        icon: 'pi pi-fw pi-folder',
                        routerLink: ['/home/documentos'],
                    },
                ],
            },
            {
                label: 'Cuenta',
                items: [
                    {
                        label: 'Cerrar Sesion',
                        icon: 'pi pi-fw pi-sign-out',
                        command: () => this.authService.logout(),
                    },
                ],
            },
        ];

        return model.filter(
            (section) =>
                !section.label ||
                section.items?.some((item) => item.visible !== false),
        );
    }
}
