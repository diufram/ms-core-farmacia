import { Component, HostBinding, Input } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import {
    animate,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../service/layout.service';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: '[my-menuitem]',
    imports: [CommonModule, RouterModule, RippleModule],
    template: `
        <ng-container>
            <div
                *ngIf="root && item.visible !== false"
                class="layout-menuitem-root-text"
            >
                {{ item.label }}
            </div>

            <!-- Item con submenu o sin routerLink -->
            <a
                *ngIf="
                    (!item.routerLink || item.items) && item.visible !== false
                "
                [attr.href]="item.url"
                (click)="itemClick($event)"
                [ngClass]="item.styleClass"
                [attr.target]="item.target"
                tabindex="0"
                pRipple
            >
                <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
                <span class="layout-menuitem-text">{{ item.label }}</span>
                <i
                    class="pi pi-fw pi-angle-down layout-submenu-toggler"
                    *ngIf="item.items"
                ></i>
            </a>

            <!-- Item normal con routerLink -->
            <a
                *ngIf="item.routerLink && !item.items && item.visible !== false"
                (click)="itemClick($event)"
                [ngClass]="item.styleClass"
                [routerLink]="item.routerLink"
                routerLinkActive="active-route"
                [routerLinkActiveOptions]="
                    item.routerLinkActiveOptions || {
                        paths: 'subset',
                        queryParams: 'ignored',
                        matrixParams: 'ignored',
                        fragment: 'ignored',
                    }
                "
                [fragment]="item.fragment"
                [queryParamsHandling]="item.queryParamsHandling"
                [preserveFragment]="item.preserveFragment"
                [skipLocationChange]="item.skipLocationChange"
                [replaceUrl]="item.replaceUrl"
                [state]="item.state"
                [queryParams]="item.queryParams"
                [attr.target]="item.target"
                tabindex="0"
                pRipple
            >
                <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
                <span class="layout-menuitem-text">{{ item.label }}</span>
                <i
                    class="pi pi-fw pi-angle-down layout-submenu-toggler"
                    *ngIf="item.items"
                ></i>
            </a>

            <!-- Submenu -->
            <ul
                *ngIf="item.items && item.visible !== false"
                [@children]="submenuAnimation"
            >
                <ng-template
                    ngFor
                    let-child
                    let-i="index"
                    [ngForOf]="item.items"
                >
                    <li
                        my-menuitem
                        [item]="child"
                        [index]="i"
                        [parentKey]="key"
                        [class]="child['badgeClass']"
                    ></li>
                </ng-template>
            </ul>
        </ng-container>
    `,
    animations: [
        trigger('children', [
            state('collapsed', style({ height: '0' })),
            state('expanded', style({ height: '*' })),
            transition(
                'collapsed <=> expanded',
                animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'),
            ),
        ]),
    ],

    // ✅ IMPORTANTÍSIMO: NO PONGAS providers aquí.
    // Si lo pones, creas un LayoutService NUEVO por cada item y el menú móvil/overlay se rompe.
    // providers: [LayoutService],  <-- ❌ ELIMINADO
})
export class MyMenuitem {
    @Input() item!: MenuItem;
    @Input() index!: number;
    @Input() @HostBinding('class.layout-root-menuitem') root!: boolean;
    @Input() parentKey!: string;

    active = false;

    private menuSourceSubscription?: Subscription;
    private menuResetSubscription?: Subscription;
    private routerSubscription?: Subscription;

    key = '';

    constructor(
        public router: Router,
        private layoutService: LayoutService,
    ) {
        this.menuSourceSubscription = this.layoutService.menuSource$.subscribe(
            (value) => {
                Promise.resolve(null).then(() => {
                    if (value.routeEvent) {
                        this.active =
                            value.key === this.key ||
                            value.key.startsWith(this.key + '-');
                    } else {
                        if (
                            value.key !== this.key &&
                            !value.key.startsWith(this.key + '-')
                        ) {
                            this.active = false;
                        }
                    }
                });
            },
        );

        this.menuResetSubscription = this.layoutService.resetSource$.subscribe(
            () => {
                this.active = false;
            },
        );

        this.routerSubscription = this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
                if (this.item.routerLink) {
                    this.updateActiveStateFromRoute();
                }
            });
    }

    ngOnInit() {
        this.key = this.parentKey
            ? this.parentKey + '-' + this.index
            : String(this.index);

        if (this.item.routerLink) {
            this.updateActiveStateFromRoute();
        }
    }

    updateActiveStateFromRoute() {
        const link = Array.isArray(this.item.routerLink)
            ? this.item.routerLink[0]
            : this.item.routerLink;

        if (!link) return;

        const activeRoute = this.router.isActive(link, {
            paths: 'subset',
            queryParams: 'ignored',
            matrixParams: 'ignored',
            fragment: 'ignored',
        });

        if (activeRoute) {
            // ✅ informa al layout (y en mobile cierra el menú)
            this.layoutService.onMenuStateChange({
                key: this.key,
                routeEvent: true,
            });
        }
    }

    itemClick(event: Event) {
        if (this.item.disabled) {
            event.preventDefault();
            return;
        }

        if (this.item.command) {
            this.item.command({ originalEvent: event, item: this.item });
        }

        // si tiene hijos, solo toggle
        if (this.item.items) {
            event.preventDefault();
            this.active = !this.active;
            this.layoutService.onMenuStateChange({ key: this.key });
            return;
        }

        // item normal: notifica para que en mobile se cierre el drawer
        this.layoutService.onMenuStateChange({ key: this.key });
    }

    get submenuAnimation() {
        return this.root ? 'expanded' : this.active ? 'expanded' : 'collapsed';
    }

    @HostBinding('class.active-menuitem')
    get activeClass() {
        return this.active && !this.root;
    }

    ngOnDestroy() {
        this.menuSourceSubscription?.unsubscribe();
        this.menuResetSubscription?.unsubscribe();
        this.routerSubscription?.unsubscribe();
    }
}
