import { Injectable, effect, signal, computed } from '@angular/core';
import { Subject } from 'rxjs';
import { $t, definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export interface layoutConfig {
    preset?: string;
    primary?: string;
    surface?: string | undefined | null;
    darkTheme?: boolean;
    menuMode?: string; // 'static' | 'overlay'
}

interface LayoutState {
    staticMenuDesktopInactive?: boolean; // desktop static collapsed
    overlayMenuActive?: boolean; // desktop overlay open
    configSidebarVisible?: boolean;
    staticMenuMobileActive?: boolean; // mobile drawer open
    menuHoverActive?: boolean;
}

interface MenuChangeEvent {
    key: string;
    routeEvent?: boolean;
}

type ThemePreference = 'system' | 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class LayoutService {
    private readonly THEME_KEY = 'theme_preference';

    // ✅ persistencia de layout
    private readonly LAYOUT_KEY = 'layout_config_v1';
    private readonly SURFACE_USER_KEY = 'surface_user_selected';

    // ✅ defaults deseados
    private readonly DEFAULT_PRESET = 'Aura';
    private readonly DEFAULT_PRIMARY = 'emerald';
    private readonly DEFAULT_LIGHT_SURFACE = 'slate';
    private readonly DEFAULT_DARK_SURFACE = 'zinc';
    private readonly DEFAULT_MENU_MODE = 'static';

    // breakpoint típico del template (ajústalo si quieres)
    private readonly DESKTOP_BREAKPOINT = 991;

    private readonly EmeraldPreset = definePreset(Aura, {
        semantic: {
            primary: {
                50: '#ecfdf5',
                100: '#d1fae5',
                200: '#a7f3d0',
                300: '#6ee7b7',
                400: '#34d399',
                500: '#10b981',
                600: '#059669',
                700: '#047857',
                800: '#065f46',
                900: '#064e3b',
                950: '#022c22',
            },
        },
    });

    private mediaQuery: MediaQueryList | null =
        typeof window !== 'undefined' && window.matchMedia
            ? window.matchMedia('(prefers-color-scheme: dark)')
            : null;

    _config: layoutConfig = {
        preset: this.DEFAULT_PRESET,
        primary: this.DEFAULT_PRIMARY,
        surface: this.DEFAULT_LIGHT_SURFACE,
        darkTheme: false,
        menuMode: this.DEFAULT_MENU_MODE,
    };

    _state: LayoutState = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false,
    };

    layoutConfig = signal<layoutConfig>(this._config);
    layoutState = signal<LayoutState>(this._state);

    private configUpdate = new Subject<layoutConfig>();
    private overlayOpen = new Subject<any>();
    private menuSource = new Subject<MenuChangeEvent>();
    private resetSource = new Subject();

    menuSource$ = this.menuSource.asObservable();
    resetSource$ = this.resetSource.asObservable();
    configUpdate$ = this.configUpdate.asObservable();
    overlayOpen$ = this.overlayOpen.asObservable();

    theme = computed(() => (this.layoutConfig().darkTheme ? 'dark' : 'light'));
    isDarkTheme = computed(() => !!this.layoutConfig().darkTheme);

    getPrimary = computed(() => this.layoutConfig().primary);
    getSurface = computed(() => this.layoutConfig().surface);

    transitionComplete = signal<boolean>(false);
    private initialized = false;

    constructor() {
        // ✅ 0) cargar config persistida
        this.restoreLayoutConfig();

        // ✅ 1) aplicar tema inicial
        this.applyInitialThemePreference();

        // ✅ 2) publicar cambios
        effect(() => {
            const config = this.layoutConfig();
            if (config) this.onConfigUpdate();
        });

        // ✅ 3) transiciones (solo después de init)
        effect(() => {
            const config = this.layoutConfig();
            if (!this.initialized || !config) {
                this.initialized = true;
                return;
            }
            this.handleDarkModeTransition(config);
        });
    }

    // ------------------------------------------------------------------
    // ✅ Helpers responsive
    // ------------------------------------------------------------------
    private isDesktop(): boolean {
        if (typeof window === 'undefined') return true;
        return window.innerWidth > this.DESKTOP_BREAKPOINT;
    }

    // ------------------------------------------------------------------
    // ✅ Persistencia layoutConfig (preset/primary/surface/menuMode)
    // ------------------------------------------------------------------
    private restoreLayoutConfig() {
        if (typeof localStorage === 'undefined') return;

        try {
            const raw = localStorage.getItem(this.LAYOUT_KEY);
            if (!raw) return;

            const parsed = JSON.parse(raw) as Partial<layoutConfig>;
            if (!parsed || typeof parsed !== 'object') return;

            this.layoutConfig.update((s) => ({
                ...s,
                preset: parsed.preset ?? s.preset,
                primary: parsed.primary ?? s.primary,
                surface: parsed.surface ?? s.surface,
                menuMode: parsed.menuMode ?? s.menuMode,
            }));
        } catch {
            // ignore corrupt
        }
    }

    private persistLayoutConfig() {
        if (typeof localStorage === 'undefined') return;

        const cfg = this.layoutConfig();
        const toStore: Partial<layoutConfig> = {
            preset: cfg.preset,
            primary: cfg.primary,
            surface: cfg.surface,
            menuMode: cfg.menuMode,
        };

        try {
            localStorage.setItem(this.LAYOUT_KEY, JSON.stringify(toStore));
        } catch {}
    }

    // ------------------------------------------------------------------
    // ✅ API limpia para configurador
    // ------------------------------------------------------------------
    setPreset(preset: string) {
        this.layoutConfig.update((s) => ({ ...s, preset }));
        this.persistLayoutConfig();
    }

    setPrimary(primary: string) {
        this.layoutConfig.update((s) => ({ ...s, primary }));
        this.persistLayoutConfig();
    }

    setMenuMode(menuMode: string) {
        this.layoutConfig.update((s) => ({ ...s, menuMode }));
        this.persistLayoutConfig();
    }

    setSurface(surface: string, fromUser: boolean = true) {
        this.layoutConfig.update((s) => ({ ...s, surface }));
        this.persistLayoutConfig();

        if (typeof localStorage !== 'undefined' && fromUser) {
            localStorage.setItem(this.SURFACE_USER_KEY, 'true');
        }
    }

    private isSurfaceChosenByUser(): boolean {
        if (typeof localStorage === 'undefined') return false;
        return localStorage.getItem(this.SURFACE_USER_KEY) === 'true';
    }

    // ------------------------------------------------------------------
    // ✅ Defaults surface según dark/light (NO pisar elección del usuario)
    // ------------------------------------------------------------------
    private applyDefaultSurfaceForTheme(dark: boolean) {
        if (this.isSurfaceChosenByUser()) return;

        const current = this.layoutConfig().surface;

        if (dark && current === this.DEFAULT_LIGHT_SURFACE) {
            this.layoutConfig.update((s) => ({
                ...s,
                surface: this.DEFAULT_DARK_SURFACE,
            }));
            this.persistLayoutConfig();
            return;
        }

        if (!dark && current === this.DEFAULT_DARK_SURFACE) {
            this.layoutConfig.update((s) => ({
                ...s,
                surface: this.DEFAULT_LIGHT_SURFACE,
            }));
            this.persistLayoutConfig();
        }
    }

    // ------------------------------------------------------------------
    // ✅ Tema: init + persistencia
    // ------------------------------------------------------------------
    private applyInitialThemePreference(): void {
        const pref =
            (localStorage.getItem(this.THEME_KEY) as ThemePreference) ||
            'system';

        const dark = this.resolveDarkFromPreference(pref);

        this.layoutConfig.update((s) => ({ ...s, darkTheme: dark }));
        this.applyDefaultSurfaceForTheme(dark);
        this.applyThemeClasses(dark);
        this.bindSystemListener(pref);
        this.persistLayoutConfig();
        this.applyEmeraldTheme();
    }

    private applyEmeraldTheme(): void {
        $t().preset(this.EmeraldPreset).use({ useDefaultOptions: true });
    }

    setThemePreference(pref: ThemePreference) {
        localStorage.setItem(this.THEME_KEY, pref);

        const dark = this.resolveDarkFromPreference(pref);
        this.layoutConfig.update((s) => ({ ...s, darkTheme: dark }));

        this.applyDefaultSurfaceForTheme(dark);
        this.applyThemeClasses(dark);
        this.bindSystemListener(pref);

        this.persistLayoutConfig();
        this.applyEmeraldTheme();
    }

    toggleTheme() {
        const nextDark = !this.layoutConfig().darkTheme;
        localStorage.setItem(this.THEME_KEY, nextDark ? 'dark' : 'light');

        this.layoutConfig.update((s) => ({ ...s, darkTheme: nextDark }));

        this.applyDefaultSurfaceForTheme(nextDark);
        this.applyThemeClasses(nextDark);
        this.bindSystemListener(nextDark ? 'dark' : 'light');

        this.persistLayoutConfig();
        this.applyEmeraldTheme();
    }

    private resolveDarkFromPreference(pref: ThemePreference): boolean {
        if (pref === 'dark') return true;
        if (pref === 'light') return false;
        return this.mediaQuery?.matches ?? false;
    }

    private systemHandler = () => {
        const pref =
            (localStorage.getItem(this.THEME_KEY) as ThemePreference) ||
            'system';
        if (pref !== 'system') return;

        const dark = this.mediaQuery?.matches ?? false;

        this.layoutConfig.update((s) => ({ ...s, darkTheme: dark }));
        this.applyDefaultSurfaceForTheme(dark);
        this.applyThemeClasses(dark);

        this.persistLayoutConfig();
    };

    private bindSystemListener(pref: ThemePreference) {
        if (!this.mediaQuery) return;

        try {
            this.mediaQuery.removeEventListener('change', this.systemHandler);
        } catch {
            // @ts-ignore
            this.mediaQuery.removeListener(this.systemHandler);
        }

        if (pref === 'system') {
            try {
                this.mediaQuery.addEventListener('change', this.systemHandler);
            } catch {
                // @ts-ignore
                this.mediaQuery.addListener(this.systemHandler);
            }
        }
    }

    // ------------------------------------------------------------------
    // Transición dark mode
    // ------------------------------------------------------------------
    private handleDarkModeTransition(config: layoutConfig): void {
        if ((document as any).startViewTransition) {
            const transition = (document as any).startViewTransition(() => {
                this.toggleDarkMode(config);
            });

            transition.ready.then(() => this.onTransitionEnd()).catch(() => {});
        } else {
            this.toggleDarkMode(config);
            this.onTransitionEnd();
        }
    }

    toggleDarkMode(config?: layoutConfig): void {
        const _config = config || this.layoutConfig();
        this.applyThemeClasses(!!_config.darkTheme);
    }

    private applyThemeClasses(dark: boolean) {
        document.documentElement.classList.toggle('app-dark', dark);
        document.documentElement.classList.toggle('dark', dark);
    }

    private onTransitionEnd() {
        this.transitionComplete.set(true);
        setTimeout(() => this.transitionComplete.set(false));
    }

    // ------------------------------------------------------------------
    // ✅ MENU (ESTO ES LO QUE TE FALTABA)
    // ------------------------------------------------------------------
    onConfigUpdate() {
        this._config = { ...this.layoutConfig() };
        this.configUpdate.next(this.layoutConfig());
    }

    // ✅ toggle del menú (hamburguesa)
    onMenuToggle() {
        const isDesktop = this.isDesktop();
        const mode = this.layoutConfig().menuMode;

        this.layoutState.update((s) => {
            if (isDesktop) {
                if (mode === 'overlay') {
                    return {
                        ...s,
                        overlayMenuActive: !s.overlayMenuActive,
                        staticMenuMobileActive: false,
                    };
                }
                // static desktop: colapsar
                return {
                    ...s,
                    staticMenuDesktopInactive: !s.staticMenuDesktopInactive,
                    overlayMenuActive: false,
                };
            }

            // mobile: drawer
            return {
                ...s,
                staticMenuMobileActive: !s.staticMenuMobileActive,
                overlayMenuActive: false,
            };
        });

        // notifica que se abrió overlay (para máscara/backdrop si existe)
        if (!isDesktop || mode === 'overlay') {
            this.overlayOpen.next(true);
        }
    }

    // ✅ se llama al navegar/click en item; en móvil debe cerrar
    onMenuStateChange(_event: MenuChangeEvent) {
        const isDesktop = this.isDesktop();
        const mode = this.layoutConfig().menuMode;

        if (!isDesktop) {
            this.closeMobileMenu();
            return;
        }

        if (mode === 'overlay') {
            this.layoutState.update((s) => ({
                ...s,
                overlayMenuActive: false,
            }));
        }
    }

    closeMobileMenu() {
        this.layoutState.update((s) => ({
            ...s,
            staticMenuMobileActive: false,
        }));
    }

    closeOverlayMenu() {
        this.layoutState.update((s) => ({ ...s, overlayMenuActive: false }));
    }

    reset() {
        this.resetSource.next(true);
    }
}
