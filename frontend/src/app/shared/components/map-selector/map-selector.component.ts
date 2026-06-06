import {
    Component,
    EventEmitter,
    inject,
    Input,
    Output,
    OnChanges,
    SimpleChanges,
    AfterViewInit,
    OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '@/core/services/http/api.service';
import * as L from 'leaflet';

export interface MapLocation {
    lat: number;
    lng: number;
    address?: string;
}

interface ReverseGeocodeResult {
    address: string;
}

@Component({
    selector: 'app-map-selector',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, TooltipModule],
    templateUrl: './map-selector.component.html',
    styleUrls: ['./map-selector.component.css'],
})
export class MapSelectorComponent
    implements AfterViewInit, OnChanges, OnDestroy
{
    @Input() value: MapLocation = { lat: 0, lng: 0 };
    @Input() height = '300px';
    @Input() readonly = false;
    @Input() zoom = 13;

    @Output() valueChange = new EventEmitter<MapLocation>();
    @Output() locationSelected = new EventEmitter<MapLocation>();

    public map: L.Map | undefined;
    private marker: L.Marker | null = null;
    public mapId = `map-${Math.random().toString(36).substring(2, 9)}`;

    public isLoadingLocation = false;
    public isResolvingAddress = false;
    public locationLabel = '';
    private geocodeDebounceTimer: ReturnType<typeof setTimeout> | null = null;
    private activeGeocodeKey: string | null = null;
    private readonly geocodeCache = new Map<string, string>();
    private apiService = inject(ApiService);

    private readonly defaultLocation: MapLocation = {
        lat: -17.843709281606202,
        lng: -63.17992631136861,
        address: 'Av. Santos Dumont, Santa Cruz de la Sierra, Bolivia',
    };

    constructor() {}

    ngAfterViewInit(): void {
        // Verificamos que el div exista antes de inicializar (útil para Modales/Dialogs)
        const checkElement = () => {
            const mapElement = document.getElementById(this.mapId);
            if (mapElement) {
                requestAnimationFrame(() => {
                    this.initializeMap();
                });
            } else {
                setTimeout(checkElement, 50);
            }
        };
        checkElement();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['value'] && this.map) {
            const current = changes['value'].currentValue;
            const prev = changes['value'].previousValue;

            // Actualizamos solo si las coordenadas cambian
            if (!prev || current.lat !== prev.lat || current.lng !== prev.lng) {
                if (this.hasValidCoordinates()) {
                    this.updateMarkerOnly();
                    this.syncAddressLabelAndResolve();
                } else {
                    this.removeMarker(); // Si vienen en 0 o null, limpiamos
                    this.locationLabel = '';
                }
            }
        }
    }

    private initializeMap(): void {
        try {
            if (this.map) {
                this.map.remove();
                this.map = undefined;
            }

            // Coordenadas por defecto (si no hay value): Santa Cruz - Av. Santos Dumont
            const centerLat = this.hasValidCoordinates()
                ? this.value.lat
                : this.defaultLocation.lat;
            const centerLng = this.hasValidCoordinates()
                ? this.value.lng
                : this.defaultLocation.lng;

            this.map = L.map(this.mapId, {
                center: [centerLat, centerLng],
                zoom: this.zoom,
                zoomControl: false, // Ocultamos el zoom por defecto para minimalismo
                attributionControl: false,
            });

            // Añadimos el tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(this.map);

            if (this.hasValidCoordinates()) {
                this.createMarker();
                this.syncAddressLabelAndResolve();
            }

            if (!this.readonly) {
                this.map.on('click', (e: any) => {
                    this.updateLocation(e.latlng.lat, e.latlng.lng);
                });
            }

            // Fix para renderizado correcto
            setTimeout(() => {
                this.map?.invalidateSize();
            }, 200);
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    }

    public hasValidCoordinates(): boolean {
        return (
            this.value.lat !== null &&
            this.value.lng !== null &&
            !isNaN(this.value.lat) &&
            !isNaN(this.value.lng) &&
            (this.value.lat !== 0 || this.value.lng !== 0)
        );
    }

    private createMarker(): void {
        if (!this.map) return;

        const icon = L.divIcon({
            html: `<div class="custom-marker-pin"></div>`,
            className: 'custom-marker', // Clase vacía para evitar estilos default de Leaflet
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        });

        this.marker = L.marker([this.value.lat, this.value.lng], {
            icon,
        }).addTo(this.map);
        this.map.setView([this.value.lat, this.value.lng], this.zoom);
    }

    private updateMarkerOnly(): void {
        if (!this.map) return;
        if (this.marker) {
            this.marker.setLatLng([this.value.lat, this.value.lng]);
            this.map.panTo([this.value.lat, this.value.lng]);
        } else {
            this.createMarker();
        }
    }

    private removeMarker(): void {
        if (this.marker && this.map) {
            this.map.removeLayer(this.marker);
            this.marker = null;
        }
    }

    private updateLocation(lat: number, lng: number): void {
        if (this.readonly) return;
        this.locationLabel = 'Buscando ubicación...';
        const newLocation: MapLocation = { lat, lng };
        this.value = newLocation;
        this.valueChange.emit(newLocation);
        this.locationSelected.emit(newLocation);
        this.updateMarkerOnly();
        this.scheduleAddressResolution(lat, lng);
    }

    onGetCurrentLocation(): void {
        if (this.readonly || !this.map) return;
        this.isLoadingLocation = true;

        this.map.locate({ setView: true, maxZoom: 13 });

        this.map.once('locationfound', (e: any) => {
            this.isLoadingLocation = false;
            this.updateLocation(e.latlng.lat, e.latlng.lng);
        });

        this.map.once('locationerror', () => {
            this.isLoadingLocation = false;
            // Aquí podrías emitir un error si lo deseas
        });
    }

    resetLocation(): void {
        this.value = { ...this.defaultLocation };
        this.locationLabel = this.defaultLocation.address ?? '';
        this.removeMarker();
        this.valueChange.emit(this.value);
        this.locationSelected.emit(this.value);
        // Vista por defecto: Santa Cruz - Av. Santos Dumont
        this.map?.setView(
            [this.defaultLocation.lat, this.defaultLocation.lng],
            15,
        );
    }

    private syncAddressLabelAndResolve(): void {
        this.locationLabel = this.value.address?.trim() ?? '';

        if (!this.locationLabel && this.hasValidCoordinates()) {
            this.locationLabel = 'Buscando ubicación...';
            this.scheduleAddressResolution(this.value.lat, this.value.lng, 0);
        }
    }

    private scheduleAddressResolution(
        lat: number,
        lng: number,
        delayMs = 220,
    ): void {
        if (this.geocodeDebounceTimer) {
            clearTimeout(this.geocodeDebounceTimer);
        }

        this.geocodeDebounceTimer = setTimeout(() => {
            this.geocodeDebounceTimer = null;
            void this.resolveAddressFromCoordinates(lat, lng);
        }, delayMs);
    }

    private toGeocodeKey(lat: number, lng: number): string {
        return `${lat.toFixed(5)},${lng.toFixed(5)}`;
    }

    private async resolveAddressFromCoordinates(
        lat: number,
        lng: number,
    ): Promise<void> {
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        const geocodeKey = this.toGeocodeKey(lat, lng);
        const cachedAddress = this.geocodeCache.get(geocodeKey);
        if (cachedAddress) {
            this.locationLabel = cachedAddress;
            if (this.value.address !== cachedAddress) {
                this.value = { ...this.value, address: cachedAddress };
                this.valueChange.emit(this.value);
                this.locationSelected.emit(this.value);
            }
            return;
        }

        if (this.activeGeocodeKey === geocodeKey) {
            return;
        }

        this.activeGeocodeKey = geocodeKey;
        this.isResolvingAddress = true;

        try {
            const data = await firstValueFrom(
                this.apiService.get<ReverseGeocodeResult>('geocode/reverse', {
                    params: {
                        lat,
                        lng,
                        lang: 'es',
                    },
                }),
            );

            const resolvedAddress =
                data?.address?.trim() || 'Punto seleccionado';

            this.geocodeCache.set(geocodeKey, resolvedAddress);
            this.locationLabel = resolvedAddress;
            this.value = { ...this.value, address: resolvedAddress };
            this.valueChange.emit(this.value);
            this.locationSelected.emit(this.value);
        } catch (error) {
            this.locationLabel = 'Punto seleccionado';
        } finally {
            this.isResolvingAddress = false;
            this.activeGeocodeKey = null;
        }
    }

    // Método público útil si el mapa está en un TabView
    public forceResize(): void {
        if (this.map) {
            setTimeout(() => this.map?.invalidateSize(), 100);
        }
    }

    ngOnDestroy(): void {
        if (this.geocodeDebounceTimer) {
            clearTimeout(this.geocodeDebounceTimer);
            this.geocodeDebounceTimer = null;
        }

        if (this.map) {
            this.map.remove();
            this.map = undefined;
        }
    }
}
