import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { DashboardService } from '../../services/dashboard.service';
import {
    DashboardKpis,
    ProductoStockBajo,
    TopProducto,
    VentasPorDia,
    VentasPorSucursal,
} from '../../models/dashboard.interface';
import { AuthService } from '@/features/auth/services/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ChartModule,
        TableModule,
        ButtonModule,
        SelectModule,
        TagModule,
        ProgressSpinnerModule,
    ],
    template: `
        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12">
                <div class="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <div>
                        <h1 class="text-2xl font-semibold text-color m-0">
                            Dashboard
                        </h1>
                        <p class="text-muted-color m-0 mt-1">
                            Resumen general del sistema
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <p-select
                            [options]="rangoOptions"
                            [(ngModel)]="rangoSeleccionado"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Rango"
                            (onChange)="aplicarRango()"
                            appendTo="body"
                        />
                        <p-button
                            icon="pi pi-refresh"
                            severity="secondary"
                            [outlined]="true"
                            (onClick)="recargar()"
                            pTooltip="Recargar"
                        />
                    </div>
                </div>
            </div>

            <div *ngIf="loading()" class="col-span-12 flex justify-center py-12">
                <p-progress-spinner
                    styleClass="w-4 h-4"
                    strokeWidth="3"
                />
            </div>

            <ng-container *ngIf="kpis() as data">
                <div class="col-span-12 sm:col-span-6 lg:col-span-3">
                    <p-card styleClass="h-full">
                        <div class="flex items-center justify-between">
                            <div>
                                <span class="text-muted-color text-sm">
                                    Total ventas
                                </span>
                                <div class="text-2xl font-semibold text-color mt-2">
                                    {{ data.totalVentas | number: '1.2-2' }} Bs
                                </div>
                                <div class="text-muted-color text-xs mt-1">
                                    {{ data.cantidadVentas }} operaciones
                                </div>
                            </div>
                            <div
                                class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                            >
                                <i class="pi pi-dollar text-xl text-green-600"></i>
                            </div>
                        </div>
                    </p-card>
                </div>

                <div class="col-span-12 sm:col-span-6 lg:col-span-3">
                    <p-card styleClass="h-full">
                        <div class="flex items-center justify-between">
                            <div>
                                <span class="text-muted-color text-sm">
                                    Productos
                                </span>
                                <div class="text-2xl font-semibold text-color mt-2">
                                    {{ data.totalProductos }}
                                </div>
                                <div class="text-muted-color text-xs mt-1">
                                    {{ data.productosStockBajo }} con stock bajo
                                </div>
                            </div>
                            <div
                                class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
                            >
                                <i class="pi pi-box text-xl text-blue-600"></i>
                            </div>
                        </div>
                    </p-card>
                </div>

                <div class="col-span-12 sm:col-span-6 lg:col-span-3">
                    <p-card styleClass="h-full">
                        <div class="flex items-center justify-between">
                            <div>
                                <span class="text-muted-color text-sm">
                                    Clientes
                                </span>
                                <div class="text-2xl font-semibold text-color mt-2">
                                    {{ data.totalClientes }}
                                </div>
                                <div class="text-muted-color text-xs mt-1">
                                    Registrados
                                </div>
                            </div>
                            <div
                                class="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"
                            >
                                <i class="pi pi-user text-xl text-purple-600"></i>
                            </div>
                        </div>
                    </p-card>
                </div>

                <div class="col-span-12 sm:col-span-6 lg:col-span-3">
                    <p-card styleClass="h-full">
                        <div class="flex items-center justify-between">
                            <div>
                                <span class="text-muted-color text-sm">
                                    Sucursales
                                </span>
                                <div class="text-2xl font-semibold text-color mt-2">
                                    {{ data.totalSucursales }}
                                </div>
                                <div class="text-muted-color text-xs mt-1">
                                    Activas
                                </div>
                            </div>
                            <div
                                class="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"
                            >
                                <i
                                    class="pi pi-building text-xl text-orange-600"
                                ></i>
                            </div>
                        </div>
                    </p-card>
                </div>

                <div class="col-span-12 lg:col-span-8">
                    <p-card>
                        <ng-template pTemplate="header">
                            <div class="px-6 pt-5 pb-2">
                                <h3 class="text-lg font-semibold text-color m-0">
                                    Ventas últimos 30 días
                                </h3>
                            </div>
                        </ng-template>
                        <p-chart
                            type="line"
                            [data]="ventasPorDiaChartData(data.ventasPorDia)"
                            [options]="lineChartOptions"
                            height="320px"
                        />
                    </p-card>
                </div>

                <div class="col-span-12 lg:col-span-4">
                    <p-card>
                        <ng-template pTemplate="header">
                            <div class="px-6 pt-5 pb-2">
                                <h3 class="text-lg font-semibold text-color m-0">
                                    Ventas por sucursal
                                </h3>
                            </div>
                        </ng-template>
                        <p-chart
                            type="bar"
                            [data]="ventasPorSucursalChartData(data.ventasPorSucursal)"
                            [options]="barChartOptions"
                            height="320px"
                        />
                    </p-card>
                </div>

                <div class="col-span-12 lg:col-span-7">
                    <p-card>
                        <ng-template pTemplate="header">
                            <div class="px-6 pt-5 pb-2">
                                <h3 class="text-lg font-semibold text-color m-0">
                                    Top productos vendidos
                                </h3>
                            </div>
                        </ng-template>
                        <p-table
                            [value]="data.topProductos"
                            styleClass="p-datatable-sm"
                            [tableStyle]="{ 'min-width': '100%' }"
                        >
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>Código</th>
                                    <th>Producto</th>
                                    <th class="text-right">Cantidad</th>
                                    <th class="text-right">Total</th>
                                </tr>
                            </ng-template>
                            <ng-template
                                pTemplate="body"
                                let-prod
                            >
                                <tr>
                                    <td>
                                        <span class="font-mono text-sm">
                                            {{ prod.codigo }}
                                        </span>
                                    </td>
                                    <td>{{ prod.nombre }}</td>
                                    <td class="text-right">
                                        {{ prod.cantidad_vendida }}
                                    </td>
                                    <td class="text-right font-medium">
                                        {{ prod.total_vendido | number: '1.2-2' }} Bs
                                    </td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="emptymessage">
                                <tr>
                                    <td
                                        colspan="4"
                                        class="text-center text-muted-color py-4"
                                    >
                                        Sin datos de ventas en el período
                                        seleccionado.
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </p-card>
                </div>

                <div class="col-span-12 lg:col-span-5">
                    <p-card>
                        <ng-template pTemplate="header">
                            <div class="px-6 pt-5 pb-2 flex items-center justify-between">
                                <h3 class="text-lg font-semibold text-color m-0">
                                    Stock bajo
                                </h3>
                                <p-tag
                                    [value]="data.productosStockBajo + ' alertas'"
                                    severity="danger"
                                />
                            </div>
                        </ng-template>
                        <p-table
                            [value]="data.productosStockBajoList"
                            styleClass="p-datatable-sm"
                            [tableStyle]="{ 'min-width': '100%' }"
                        >
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>Producto</th>
                                    <th>Sucursal</th>
                                    <th class="text-right">Stock</th>
                                </tr>
                            </ng-template>
                            <ng-template
                                pTemplate="body"
                                let-prod
                            >
                                <tr>
                                    <td>
                                        <div class="font-medium">
                                            {{ prod.nombre }}
                                        </div>
                                        <div class="text-muted-color text-xs font-mono">
                                            {{ prod.codigo }}
                                        </div>
                                    </td>
                                    <td class="text-sm">
                                        {{ prod.sucursal_nombre }}
                                    </td>
                                    <td class="text-right">
                                        <p-tag
                                            [value]="prod.stock_actual.toString()"
                                            [severity]="
                                                prod.stock_actual <= 0
                                                    ? 'danger'
                                                    : 'warn'
                                            "
                                        />
                                    </td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="emptymessage">
                                <tr>
                                    <td
                                        colspan="3"
                                        class="text-center text-muted-color py-4"
                                    >
                                        No hay productos con stock bajo.
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </p-card>
                </div>
            </ng-container>
        </div>
    `,
})
export class DashboardComponent implements OnInit {
    private dashboardService = inject(DashboardService);
    private authService = inject(AuthService);

    loading = signal<boolean>(true);
    kpis = signal<DashboardKpis | null>(null);

    rangoSeleccionado: number = 30;
    rangoOptions = [
        { label: 'Últimos 7 días', value: 7 },
        { label: 'Últimos 15 días', value: 15 },
        { label: 'Últimos 30 días', value: 30 },
        { label: 'Últimos 90 días', value: 90 },
    ];

    lineChartOptions: any;
    barChartOptions: any;

    ngOnInit(): void {
        this.initChartOptions();
        this.authService.me().subscribe({
            next: () => this.cargar(),
            error: () => this.cargar(),
        });
    }

    private initChartOptions(): void {
        const textColor = this.getCssVar('--text-color') || '#334155';
        const textColorSecondary =
            this.getCssVar('--text-color-secondary') || '#64748b';
        const surfaceBorder =
            this.getCssVar('--surface-border') || '#e2e8f0';
        const primary = this.getCssVar('--primary-color') || '#3b82f6';

        this.lineChartOptions = {
            plugins: {
                legend: { labels: { color: textColor } },
            },
            scales: {
                x: {
                    ticks: { color: textColorSecondary },
                    grid: { color: surfaceBorder },
                },
                y: {
                    ticks: { color: textColorSecondary },
                    grid: { color: surfaceBorder },
                    beginAtZero: true,
                },
            },
            responsive: true,
            maintainAspectRatio: false,
        };

        this.barChartOptions = {
            plugins: {
                legend: { display: false },
            },
            scales: {
                x: {
                    ticks: { color: textColorSecondary },
                    grid: { color: surfaceBorder },
                },
                y: {
                    ticks: { color: textColorSecondary },
                    grid: { color: surfaceBorder },
                    beginAtZero: true,
                },
            },
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
        };
    }

    private getCssVar(name: string): string {
        if (typeof window === 'undefined') return '';
        return getComputedStyle(document.documentElement)
            .getPropertyValue(name)
            .trim();
    }

    ventasPorDiaChartData(data: VentasPorDia[]) {
        const textColorSecondary =
            this.getCssVar('--text-color-secondary') || '#64748b';
        const surfaceBorder =
            this.getCssVar('--surface-border') || '#e2e8f0';
        return {
            labels: data.map((d) => d.fecha),
            datasets: [
                {
                    label: 'Ventas (Bs)',
                    data: data.map((d) => d.total),
                    fill: true,
                    borderColor:
                        this.getCssVar('--primary-color') || '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    tension: 0.35,
                    pointBackgroundColor:
                        this.getCssVar('--primary-color') || '#3b82f6',
                    pointRadius: 3,
                    pointHoverRadius: 5,
                },
            ],
        };
    }

    ventasPorSucursalChartData(data: VentasPorSucursal[]) {
        return {
            labels: data.map((d) => d.sucursal_nombre),
            datasets: [
                {
                    label: 'Total ventas (Bs)',
                    data: data.map((d) => d.total),
                    backgroundColor: '#3b82f6',
                    borderRadius: 6,
                },
            ],
        };
    }

    aplicarRango(): void {
        this.cargar();
    }

    recargar(): void {
        this.cargar();
    }

    private cargar(): void {
        this.loading.set(true);
        const fechaHasta = new Date().toISOString().slice(0, 10);
        const fechaDesde = new Date();
        fechaDesde.setDate(fechaDesde.getDate() - this.rangoSeleccionado);
        const desdeStr = fechaDesde.toISOString().slice(0, 10);

        this.dashboardService
            .getKpis({
                fechaDesde: desdeStr,
                fechaHasta,
            })
            .subscribe({
                next: (data) => {
                    this.kpis.set(data);
                    this.loading.set(false);
                },
                error: () => {
                    this.kpis.set(null);
                    this.loading.set(false);
                },
            });
    }
}
