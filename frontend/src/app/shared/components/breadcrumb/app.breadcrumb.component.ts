import {
    Component,
    OnInit,
    inject,
    ViewChild,
    ElementRef,
    AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ActivatedRoute,
    NavigationEnd,
    Router,
    RouterModule,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';

@Component({
    selector: 'app-breadcrumb',
    standalone: true,
    imports: [CommonModule, BreadcrumbModule, RouterModule],
    template: `
        <div
            #container
            class="breadcrumb-container mb-2"
            *ngIf="items.length > 0"
        >
            <p-breadcrumb
                [model]="items"
                [home]="homeItem"
                styleClass="compact-breadcrumb"
            >
            </p-breadcrumb>
        </div>
    `,
    styles: [
        `
            :host ::ng-deep {
                .breadcrumb-container {
                    background: var(--surface-card);
                    border: 1px solid var(--surface-border);
                    border-radius: 8px;
                    padding: 0.5rem 0.75rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);

                    /* Scroll horizontal */
                    overflow-x: auto;
                    white-space: nowrap;
                    display: block;
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;

                    &::-webkit-scrollbar {
                        display: none;
                    }
                    scrollbar-width: none;
                }

                .compact-breadcrumb {
                    background: transparent !important;
                    border: none !important;
                    padding: 0 !important;

                    .p-breadcrumb-list {
                        display: flex;
                        align-items: center;
                        margin: 0;
                        padding: 0;
                        list-style: none;

                        li.p-breadcrumb-chevron {
                            font-size: 0.7rem;
                            margin: 0 0.4rem;
                            color: var(--text-color-secondary);
                        }

                        .p-menuitem-link {
                            display: flex;
                            align-items: center;
                            text-decoration: none;
                            transition: all 0.2s;

                            .p-menuitem-text {
                                font-size: 0.85rem;
                                color: var(
                                    --text-color-secondary
                                ); /* Color base gris */
                                white-space: nowrap;
                            }
                            .p-menuitem-icon {
                                color: var(--text-color-secondary);
                            }
                        }

                        /* ✅ SOLUCIÓN DEFINITIVA: Usamos la clase que inyectamos en TS */
                        li.active-item .p-menuitem-link {
                            cursor: default;
                            pointer-events: none;

                            .p-menuitem-text {
                                color: var(
                                    --text-color
                                ) !important; /* Blanco/Negro fuerte */
                                /* color: var(--primary-color) !important; <--- Descomenta si prefieres AZUL */
                                font-weight: 800 !important;
                                font-size: 0.9rem !important; /* Un pelín más grande */
                            }

                            .p-menuitem-icon {
                                color: var(--text-color) !important;
                            }
                        }
                    }
                }
            }
        `,
    ],
})
export class AppBreadcrumbComponent implements OnInit, AfterViewChecked {
    @ViewChild('container') containerRef!: ElementRef;

    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);

    items: MenuItem[] = [];
    homeItem: MenuItem = { icon: 'pi pi-home', routerLink: '/dashboard' };
    private scrollNeeded = false;

    ngOnInit() {
        this.generateBreadcrumbs();
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
                this.generateBreadcrumbs();
                this.scrollNeeded = true;
            });
    }

    ngAfterViewChecked() {
        if (this.scrollNeeded && this.containerRef) {
            // ✅ Agregamos setTimeout para asegurar que el DOM se pintó antes de scrollear
            setTimeout(() => {
                const el = this.containerRef.nativeElement;
                el.scrollLeft = el.scrollWidth;
                this.scrollNeeded = false;
            }, 50);
        }
    }

    private generateBreadcrumbs() {
        const crumbs = this.createBreadcrumbs(this.activatedRoute.root);

        // ✅ TRUCO: Marcar explícitamente el último item con una clase
        if (crumbs.length > 0) {
            // Limpiamos clases anteriores por si acaso
            crumbs.forEach((c) => (c.styleClass = ''));

            // Asignamos la clase al último
            const lastItem = crumbs[crumbs.length - 1];
            lastItem.styleClass = 'active-item';
        }

        this.items = crumbs;
    }

    private createBreadcrumbs(
        route: ActivatedRoute,
        url: string = '',
        breadcrumbs: MenuItem[] = [],
    ): MenuItem[] {
        const children: ActivatedRoute[] = route.children;
        if (children.length === 0) return breadcrumbs;

        for (const child of children) {
            const routeURL: string = child.snapshot.url
                .map((segment) => segment.path)
                .join('/');

            const label = child.snapshot.data['breadcrumb'];

            if (routeURL !== '') {
                url += `/${routeURL}`;
            }

            const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];

            if (label && (!lastBreadcrumb || lastBreadcrumb.label !== label)) {
                breadcrumbs.push({ label, routerLink: url || '/' });
            }

            const result = this.createBreadcrumbs(child, url, breadcrumbs);

            for (const cb of result) {
                if (!breadcrumbs.some(b => b.label === cb.label)) {
                    breadcrumbs.push(cb);
                }
            }
        }
        return breadcrumbs;
    }
}
