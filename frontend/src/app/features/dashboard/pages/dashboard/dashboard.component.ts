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
import { TooltipModule } from 'primeng/tooltip';

import { DashboardService } from '../../services/dashboard.service';
import { SucursalesService } from '@/features/sucursales/services/sucursales.service';
import { Sucursal } from '@/features/sucursales/models/sucursal.interface';
import {
    DashboardKpis,
    ProductoStockBajo,
    TopProducto,
    VentasPorDia,
    VentasPorSucursal,
} from '../../models/dashboard.interface';
import { AuthService } from '@/features/auth/services/auth.service';

interface PrediccionDemanda {
    producto_id: number;
    codigo: string;
    nombre: string;
    stock_actual: number;
    cantidad_vendida: number;
    score: number;
    dias_estimados_agotamiento: number;
    nivel_riesgo: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO';
    features: {
        ratio_presion: number;
        factor_demanda: number;
        factor_stock: number;
        en_stock_bajo: boolean;
    };
}

interface Tendencia {
    ventas_actual: number;
    cantidad_actual: number;
    ventas_anterior: number;
    cantidad_anterior: number;
    crecimiento_pct: number;
    mejor_dia: { fecha: string; total: number } | null;
    dias_anomalos: number;
}

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
        TooltipModule,
    ],
    template: `
        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12">
                <div class="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <div>
                        <h1 class="text-2xl font-semibold text-color m-0">
                            {{ esSuperAdmin() ? 'Dashboard Global' : 'Mi Sucursal' }}
                        </h1>
                        <p class="text-muted-color m-0 mt-1">
                            {{
                                esSuperAdmin()
                                    ? 'Resumen consolidado de todas las sucursales'
                                    : 'Operaciones y métricas de tu sucursal'
                            }}
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <p-select
                            *ngIf="esSuperAdmin()"
                            [options]="sucursalOptions()"
                            [(ngModel)]="filtroSucursalId"
                            optionLabel="nombre"
                            optionValue="id"
                            placeholder="Todas las sucursales"
                            [showClear]="true"
                            (onChange)="cargar()"
                            appendTo="body"
                            styleClass="min-w-[200px]"
                        />
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
                <div
                    [class]="
                        esSuperAdmin()
                            ? 'col-span-12 sm:col-span-6 lg:col-span-4'
                            : 'col-span-12 sm:col-span-6 lg:col-span-6'
                    "
                >
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

                <div
                    [class]="
                        esSuperAdmin()
                            ? 'col-span-12 sm:col-span-6 lg:col-span-4'
                            : 'col-span-12 sm:col-span-6 lg:col-span-6'
                    "
                >
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

                <div
                    *ngIf="esSuperAdmin()"
                    class="col-span-12 sm:col-span-6 lg:col-span-4"
                >
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

                <div
                    [class]="
                        esSuperAdmin()
                            ? 'col-span-12 lg:col-span-8'
                            : 'col-span-12'
                    "
                >
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
                            [height]="esSuperAdmin() ? '320px' : '360px'"
                        />
                    </p-card>
                </div>

                <div *ngIf="esSuperAdmin()" class="col-span-12 lg:col-span-4">
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

                <div class="col-span-12 lg:col-span-6">
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

                <!-- === KPI: Clientes frecuentes === -->
                <div class="col-span-12 lg:col-span-6">
                    <p-card>
                        <ng-template pTemplate="header">
                            <div
                                class="px-6 pt-5 pb-2 flex items-center justify-between"
                            >
                                <h3
                                    class="text-lg font-semibold text-color m-0 flex items-center gap-2"
                                >
                                    <i
                                        class="pi pi-users text-primary"
                                    ></i>
                                    Clientes frecuentes
                                    <p-tag
                                        value="Score ML"
                                        severity="info"
                                        [rounded]="true"
                                    />
                                </h3>
                            </div>
                        </ng-template>
                        <p-table
                            [value]="data.topClientes"
                            styleClass="p-datatable-sm"
                            [tableStyle]="{ 'min-width': '100%' }"
                        >
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>Cliente</th>
                                    <th class="text-right">Ventas</th>
                                    <th class="text-right">Total</th>
                                </tr>
                            </ng-template>
                            <ng-template
                                pTemplate="body"
                                let-cli
                            >
                                <tr>
                                    <td>
                                        <div class="font-medium text-sm">
                                            {{
                                                cli.cliente_nombre ||
                                                    'Sin nombre'
                                            }}
                                        </div>
                                        <div
                                            class="text-muted-color text-xs font-mono"
                                        >
                                            {{
                                                cli.cliente_codigo || '—'
                                            }}
                                        </div>
                                    </td>
                                    <td class="text-right text-sm">
                                        {{ cli.cantidad_ventas }}
                                    </td>
                                    <td
                                        class="text-right text-sm font-medium"
                                    >
                                        Bs
                                        {{
                                            cli.total_comprado
                                                | number: '1.2-2'
                                        }}
                                    </td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="emptymessage">
                                <tr>
                                    <td
                                        colspan="3"
                                        class="text-center text-muted-color py-4 text-sm"
                                    >
                                        Sin clientes frecuentes en el
                                        período.
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </p-card>
                </div>

                <!-- === KPI: Tendencia de ventas === -->
                <div *ngIf="tendencia() as t" class="col-span-12 lg:col-span-6">
                    <p-card styleClass="h-full">
                        <ng-template pTemplate="header">
                            <div
                                class="px-6 pt-5 pb-2 flex items-center justify-between"
                            >
                                <h3
                                    class="text-lg font-semibold text-color m-0 flex items-center gap-2"
                                >
                                    <i
                                        class="pi pi-chart-line text-primary"
                                    ></i>
                                    Tendencia de ventas
                                    <p-tag
                                        value="Score ML"
                                        severity="info"
                                        [rounded]="true"
                                    />
                                </h3>
                            </div>
                        </ng-template>
                        <div class="px-2 pb-2">
                            <div
                                class="flex items-baseline gap-2 mb-3"
                            >
                                <span
                                    class="text-3xl font-bold"
                                    [ngClass]="
                                        tendenciaTextClasses(
                                            t.crecimiento_pct
                                        )
                                    "
                                >
                                    {{
                                        t.crecimiento_pct >= 0 ? '+' : ''
                                    }}{{
                                        t.crecimiento_pct | number: '1.1-1'
                                    }}%
                                </span>
                                <i
                                    class="pi text-xl"
                                    [ngClass]="
                                        t.crecimiento_pct >= 0
                                            ? 'pi-arrow-up text-green-500'
                                            : 'pi-arrow-down text-red-500'
                                    "
                                ></i>
                                <span
                                    class="text-muted-color text-xs ml-2"
                                >
                                    vs período anterior
                                </span>
                            </div>
                            <div
                                class="grid grid-cols-2 gap-3 text-sm mb-3"
                            >
                                <div
                                    class="bg-surface-50 dark:bg-surface-800 rounded p-3"
                                >
                                    <div
                                        class="text-muted-color text-xs mb-1"
                                    >
                                        Período actual
                                    </div>
                                    <div class="font-semibold">
                                        Bs
                                        {{
                                            t.ventas_actual
                                                | number: '1.2-2'
                                        }}
                                    </div>
                                    <div
                                        class="text-muted-color text-xs"
                                    >
                                        {{ t.cantidad_actual }} ops
                                    </div>
                                </div>
                                <div
                                    class="bg-surface-50 dark:bg-surface-800 rounded p-3"
                                >
                                    <div
                                        class="text-muted-color text-xs mb-1"
                                    >
                                        Período anterior
                                    </div>
                                    <div class="font-semibold">
                                        Bs
                                        {{
                                            t.ventas_anterior
                                                | number: '1.2-2'
                                        }}
                                    </div>
                                    <div
                                        class="text-muted-color text-xs"
                                    >
                                        {{ t.cantidad_anterior }} ops
                                    </div>
                                </div>
                            </div>
                            <div
                                class="flex items-center justify-between text-sm pt-2 border-t border-surface-200 dark:border-surface-700"
                            >
                                <div
                                    *ngIf="t.mejor_dia"
                                    class="flex items-center gap-2"
                                >
                                    <i
                                        class="pi pi-star-fill text-yellow-500"
                                    ></i>
                                    <span class="text-muted-color text-xs">
                                        Mejor día:
                                    </span>
                                    <span class="font-medium text-xs">
                                        {{ t.mejor_dia.fecha }}
                                    </span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i
                                        class="pi pi-exclamation-triangle text-orange-500"
                                    ></i>
                                    <span class="text-muted-color text-xs">
                                        Anomalías:
                                    </span>
                                    <p-tag
                                        [value]="
                                            t.dias_anomalos + ' día(s)'
                                        "
                                        [severity]="
                                            t.dias_anomalos > 0
                                                ? 'warn'
                                                : 'success'
                                        "
                                        [rounded]="true"
                                    />
                                </div>
                            </div>
                        </div>
                    </p-card>
                </div>

                <!-- === KPI: Riesgo de stock por categoría === -->
                <div class="col-span-12 lg:col-span-6">
                    <p-card>
                        <ng-template pTemplate="header">
                            <div
                                class="px-6 pt-5 pb-2 flex items-center justify-between"
                            >
                                <h3
                                    class="text-lg font-semibold text-color m-0 flex items-center gap-2"
                                >
                                    <i
                                        class="pi pi-tags text-primary"
                                    ></i>
                                    Riesgo por categoría
                                    <p-tag
                                        value="Score ML"
                                        severity="info"
                                        [rounded]="true"
                                    />
                                </h3>
                            </div>
                        </ng-template>
                        <p-table
                            [value]="data.riesgoPorCategoria"
                            styleClass="p-datatable-sm"
                            [tableStyle]="{ 'min-width': '100%' }"
                        >
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>Categoría</th>
                                    <th class="text-right">Score</th>
                                    <th>Riesgo</th>
                                </tr>
                            </ng-template>
                            <ng-template
                                pTemplate="body"
                                let-cat
                            >
                                <tr>
                                    <td>
                                        <div class="font-medium text-sm">
                                            {{ cat.categoria_nombre }}
                                        </div>
                                        <div
                                            class="text-muted-color text-xs"
                                        >
                                            {{
                                                cat.productos_stock_bajo
                                            }}/{{
                                                cat.total_productos
                                            }}
                                            stock bajo ·
                                            {{ cat.ventas_periodo }}
                                            vend.
                                        </div>
                                    </td>
                                    <td class="text-right">
                                        <div
                                            class="inline-flex items-center gap-2"
                                        >
                                            <div
                                                class="w-16 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden"
                                            >
                                                <div
                                                    class="h-full transition-all"
                                                    [style.width.%]="
                                                        cat.score_riesgo * 100
                                                    "
                                                    [ngClass]="
                                                        barraFillClassesRiesgo(
                                                            cat.score_riesgo
                                                        )
                                                    "
                                                ></div>
                                            </div>
                                            <span
                                                class="text-xs font-medium"
                                            >
                                                {{
                                                    (
                                                        cat.score_riesgo * 100
                                                    ) | number: '1.0-0'
                                                }}%
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <p-tag
                                            [value]="
                                                cat.score_riesgo >= 0.7
                                                    ? 'ALTO'
                                                    : cat.score_riesgo >= 0.4
                                                      ? 'MEDIO'
                                                      : 'BAJO'
                                            "
                                            [severity]="
                                                riesgoColor(cat.score_riesgo)
                                            "
                                            [rounded]="true"
                                        />
                                    </td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="emptymessage">
                                <tr>
                                    <td
                                        colspan="3"
                                        class="text-center text-muted-color py-4 text-sm"
                                    >
                                        Sin categorías registradas.
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </p-card>
                </div>

                <div class="col-span-12">
                    <p-card>
                        <ng-template pTemplate="header">
                            <div
                                class="px-6 pt-5 pb-2 flex items-center justify-between"
                            >
                                <div>
                                    <h3
                                        class="text-lg font-semibold text-color m-0 flex items-center gap-2"
                                    >
                                        <i
                                            class="pi pi-chart-line text-primary"
                                        ></i>
                                        Predicción de demanda
                                        <p-tag
                                            value="Score ML"
                                            severity="info"
                                            [rounded]="true"
                                            pTooltip="Score compuesto por 4 features: presión de demanda (45%), demanda normalizada (30%), presión de stock (20%) y alerta de stock bajo (5%)"
                                            tooltipPosition="top"
                                        />
                                    </h3>
                                    <p
                                        class="text-muted-color text-xs m-0 mt-1"
                                    >
                                        Top 5 productos con mayor probabilidad
                                        de agotarse
                                        ({{ rangoSeleccionado }} días)
                                    </p>
                                </div>
                            </div>
                        </ng-template>
                        <p-table
                            [value]="prediccionesDemanda()"
                            styleClass="p-datatable-sm"
                            [tableStyle]="{ 'min-width': '100%' }"
                        >
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>Código</th>
                                    <th>Producto</th>
                                    <th class="text-right">Vendidos</th>
                                    <th class="text-right">Stock</th>
                                    <th class="text-right">
                                        Días p/ agotar
                                    </th>
                                    <th class="text-right">Score</th>
                                    <th>Riesgo</th>
                                </tr>
                            </ng-template>
                            <ng-template
                                pTemplate="body"
                                let-pred
                            >
                                <tr>
                                    <td>
                                        <span class="font-mono text-sm">
                                            {{ pred.codigo }}
                                        </span>
                                    </td>
                                    <td>{{ pred.nombre }}</td>
                                    <td class="text-right">
                                        {{ pred.cantidad_vendida }}
                                    </td>
                                    <td class="text-right">
                                        {{ pred.stock_actual }}
                                    </td>
                                    <td class="text-right">
                                        {{
                                            pred.dias_estimados_agotamiento
                                        }}
                                    </td>
                                    <td class="text-right">
                                        <div
                                            class="inline-flex items-center gap-2"
                                            [pTooltip]="
                                                tooltipFeatures(pred.features)
                                            "
                                            tooltipPosition="left"
                                        >
                                            <div
                                                class="w-24 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden"
                                            >
                                                <div
                                                    class="h-full transition-all"
                                                    [style.width.%]="
                                                        prediccionPorcentaje(
                                                            pred.score
                                                        )
                                                    "
                                                    [ngClass]="
                                                        barraFillClasses(
                                                            pred.nivel_riesgo
                                                        )
                                                    "
                                                ></div>
                                            </div>
                                            <span
                                                class="text-xs font-medium"
                                            >
                                                {{
                                                    prediccionPorcentaje(
                                                        pred.score
                                                    )
                                                }}%
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <p-tag
                                            [value]="pred.nivel_riesgo"
                                            [severity]="
                                                prediccionColor(
                                                    pred.nivel_riesgo
                                                )
                                            "
                                            [rounded]="true"
                                        />
                                    </td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="emptymessage">
                                <tr>
                                    <td
                                        colspan="7"
                                        class="text-center text-muted-color py-4"
                                    >
                                        Sin datos suficientes para predecir
                                        demanda.
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </p-card>
                </div>

                <!-- === KPI 4: Productos sin movimiento === -->
                <div class="col-span-12 lg:col-span-7">
                    <p-card>
                        <ng-template pTemplate="header">
                            <div
                                class="px-6 pt-5 pb-2 flex items-center justify-between"
                            >
                                <h3
                                    class="text-lg font-semibold text-color m-0 flex items-center gap-2"
                                >
                                    <i
                                        class="pi pi-box text-primary"
                                    ></i>
                                    Productos sin movimiento
                                    <p-tag
                                        value="Score ML"
                                        severity="info"
                                        [rounded]="true"
                                    />
                                </h3>
                            </div>
                        </ng-template>
                        <p-table
                            [value]="data.productosSinMovimiento"
                            styleClass="p-datatable-sm"
                            [tableStyle]="{ 'min-width': '100%' }"
                        >
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>Código</th>
                                    <th>Producto</th>
                                    <th>Categoría</th>
                                    <th class="text-right">Stock</th>
                                    <th class="text-right">
                                        Días sin venta
                                    </th>
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
                                    <td>
                                        <span
                                            class="text-muted-color text-xs"
                                        >
                                            {{ prod.categoria_nombre }}
                                        </span>
                                    </td>
                                    <td class="text-right">
                                        {{ prod.stock_actual }}
                                    </td>
                                    <td class="text-right">
                                        <p-tag
                                            [value]="
                                                prod.dias_sin_venta + '+'
                                            "
                                            [severity]="
                                                prod.dias_sin_venta > 60
                                                    ? 'danger'
                                                    : prod.dias_sin_venta > 30
                                                      ? 'warn'
                                                      : 'info'
                                            "
                                            [rounded]="true"
                                        />
                                    </td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="emptymessage">
                                <tr>
                                    <td
                                        colspan="5"
                                        class="text-center text-muted-color py-4 text-sm"
                                    >
                                        Sin productos sin movimiento.
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
    private sucursalesService = inject(SucursalesService);

    loading = signal<boolean>(true);
    kpis = signal<DashboardKpis | null>(null);
    prediccionesDemanda = signal<PrediccionDemanda[]>([]);
    tendencia = signal<Tendencia | null>(null);
    sucursales = signal<Sucursal[]>([]);

    rangoSeleccionado: number = 30;
    filtroSucursalId: number | null = null;
    rangoOptions = [
        { label: 'Últimos 7 días', value: 7 },
        { label: 'Últimos 15 días', value: 15 },
        { label: 'Últimos 30 días', value: 30 },
        { label: 'Últimos 90 días', value: 90 },
    ];

    lineChartOptions: any;
    barChartOptions: any;

    esSuperAdmin(): boolean {
        return this.authService.isSuperAdmin();
    }

    esAdmin(): boolean {
        return this.authService.isAdmin();
    }

    sucursalOptions = (): Sucursal[] => this.sucursales();

    ngOnInit(): void {
        this.initChartOptions();
        this.authService.me().subscribe({
            next: (usuario) => {
                if (this.esSuperAdmin()) {
                    this.cargarSucursales();
                }
                this.cargar();
            },
            error: () => {
                if (this.esSuperAdmin()) {
                    this.cargarSucursales();
                }
                this.cargar();
            },
        });
    }

    private cargarSucursales(): void {
        this.sucursalesService.list().subscribe({
            next: (data) => this.sucursales.set(data),
            error: () => undefined,
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

    cargar(): void {
        this.loading.set(true);
        const fechaHasta = new Date().toISOString().slice(0, 10);
        const fechaDesde = new Date();
        fechaDesde.setDate(fechaDesde.getDate() - this.rangoSeleccionado);
        const desdeStr = fechaDesde.toISOString().slice(0, 10);

        const sucursalId =
            this.esSuperAdmin() && this.filtroSucursalId != null
                ? Number(this.filtroSucursalId)
                : null;

        this.dashboardService
            .getKpis({
                sucursalId,
                fechaDesde: desdeStr,
                fechaHasta,
            })
            .subscribe({
                next: (data) => {
                    this.kpis.set(data);
                    this.prediccionesDemanda.set(
                        this.calcularPrediccionesDemanda(data),
                    );
                    this.tendencia.set(this.calcularTendencia(data));
                    this.loading.set(false);
                },
                error: () => {
                    this.kpis.set(null);
                    this.prediccionesDemanda.set([]);
                    this.tendencia.set(null);
                    this.loading.set(false);
                },
            });
    }

    private calcularPrediccionesDemanda(
        data: DashboardKpis,
    ): PrediccionDemanda[] {
        const STOCK_REFERENCIA = 200;
        const RANGO_DIAS = this.rangoSeleccionado;

        const ventasPorProducto = new Map<number, number>();
        for (const top of data.topProductos) {
            ventasPorProducto.set(
                top.producto_id,
                (ventasPorProducto.get(top.producto_id) ?? 0) +
                    top.cantidad_vendida,
            );
        }

        const stockPorProducto = new Map<number, ProductoStockBajo>();
        for (const sb of data.productosStockBajoList) {
            stockPorProducto.set(sb.id, sb);
        }

        const ventasValues = Array.from(ventasPorProducto.values());
        const maxVendido = Math.max(1, ...ventasValues);
        const meanVendido =
            ventasValues.reduce((a, b) => a + b, 0) / ventasValues.length;
        const stdVendido = Math.max(
            1,
            Math.sqrt(
                ventasValues.reduce(
                    (acc, v) => acc + (v - meanVendido) ** 2,
                    0,
                ) / ventasValues.length,
            ),
        );

        const candidatos: PrediccionDemanda[] = [];
        for (const top of data.topProductos) {
            const stockInfo = stockPorProducto.get(top.producto_id);
            const stockActual = stockInfo
                ? stockInfo.stock_actual
                : STOCK_REFERENCIA;
            const cantidadVendida = top.cantidad_vendida;
            const enStockBajo = !!stockInfo;

            const velocidadDiaria = cantidadVendida / RANGO_DIAS;
            const ratioPresion =
                velocidadDiaria > 0
                    ? Math.min(velocidadDiaria / stockActual, 5)
                    : 0;
            const factorDemanda = Math.max(
                0,
                (cantidadVendida - meanVendido) / stdVendido,
            );
            const factorStock =
                1 - Math.min(stockActual / STOCK_REFERENCIA, 1);

            const score =
                0.45 * Math.tanh(ratioPresion) +
                0.30 * Math.min(factorDemanda / 2, 1) +
                0.20 * factorStock +
                0.05 * (enStockBajo ? 1 : 0);

            const diasEstimados =
                velocidadDiaria > 0
                    ? Math.round(stockActual / velocidadDiaria)
                    : 9999;

            let nivel: PrediccionDemanda['nivel_riesgo'];
            if (diasEstimados < 7) nivel = 'CRITICO';
            else if (diasEstimados < 15) nivel = 'ALTO';
            else if (diasEstimados < 30) nivel = 'MEDIO';
            else nivel = 'BAJO';

            candidatos.push({
                producto_id: top.producto_id,
                codigo: top.codigo,
                nombre: top.nombre,
                stock_actual: stockActual,
                cantidad_vendida: cantidadVendida,
                score: Math.max(0, Math.min(score, 1)),
                dias_estimados_agotamiento: diasEstimados,
                nivel_riesgo: nivel,
                features: {
                    ratio_presion: ratioPresion,
                    factor_demanda: factorDemanda,
                    factor_stock: factorStock,
                    en_stock_bajo: enStockBajo,
                },
            });
        }

        return candidatos
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
    }

    prediccionColor(
        nivel: PrediccionDemanda['nivel_riesgo'],
    ): 'success' | 'info' | 'warn' | 'danger' {
        switch (nivel) {
            case 'CRITICO':
                return 'danger';
            case 'ALTO':
                return 'warn';
            case 'MEDIO':
                return 'info';
            default:
                return 'success';
        }
    }

    prediccionPorcentaje(score: number): number {
        return Math.round(Math.max(0, Math.min(score, 1)) * 100);
    }

    tooltipFeatures(features: PrediccionDemanda['features']): string {
        return [
            `Presión demanda: ${features.ratio_presion.toFixed(2)} (peso 45%)`,
            `Demanda z-score: ${features.factor_demanda.toFixed(2)} (peso 30%)`,
            `Stock relativo: ${(features.factor_stock * 100).toFixed(0)}% (peso 20%)`,
            `En stock bajo: ${features.en_stock_bajo ? 'Sí' : 'No'} (peso 5%)`,
        ].join('\n');
    }

    private calcularTendencia(data: DashboardKpis): Tendencia {
        const ventasActual = data.totalVentas;
        const cantidadActual = data.cantidadVentas;

        const dias = data.ventasPorDia.length;
        const mitad = Math.floor(dias / 2);
        const primeraMitad = data.ventasPorDia.slice(0, mitad);
        const segundaMitad = data.ventasPorDia.slice(mitad);

        const ventasAnterior = primeraMitad.reduce(
            (acc, d) => acc + d.total,
            0,
        );
        const cantidadAnterior = primeraMitad.reduce(
            (acc, d) => acc + d.cantidad,
            0,
        );

        const crecimientoPct =
            ventasAnterior > 0
                ? ((ventasActual - ventasAnterior) / ventasAnterior) * 100
                : ventasActual > 0
                  ? 100
                  : 0;

        const mejorDia = data.ventasPorDia.reduce<
            { fecha: string; total: number } | null
        >((acc, d) => {
            if (!acc || d.total > acc.total) {
                return { fecha: d.fecha, total: d.total };
            }
            return acc;
        }, null);

        const totales = data.ventasPorDia.map((d) => d.total);
        const mean =
            totales.reduce((a, b) => a + b, 0) / Math.max(1, totales.length);
        const std = Math.max(
            1,
            Math.sqrt(
                totales.reduce((acc, v) => acc + (v - mean) ** 2, 0) /
                    Math.max(1, totales.length),
            ),
        );
        const diasAnomalos = data.ventasPorDia.filter(
            (d) => Math.abs((d.total - mean) / std) > 2,
        ).length;

        return {
            ventas_actual: ventasActual,
            cantidad_actual: cantidadActual,
            ventas_anterior: ventasAnterior,
            cantidad_anterior: cantidadAnterior,
            crecimiento_pct: crecimientoPct,
            mejor_dia: mejorDia,
            dias_anomalos: diasAnomalos,
        };
    }

    tendenciaColor(pct: number): 'success' | 'danger' | 'secondary' {
        if (pct > 5) return 'success';
        if (pct < -5) return 'danger';
        return 'secondary';
    }

    riesgoColor(score: number): 'success' | 'warn' | 'danger' | 'secondary' {
        if (score >= 0.7) return 'danger';
        if (score >= 0.4) return 'warn';
        if (score > 0) return 'success';
        return 'secondary';
    }

    barraFillClasses(
        nivel: PrediccionDemanda['nivel_riesgo'],
    ): { [key: string]: boolean } {
        return {
            'bg-red-500': nivel === 'CRITICO',
            'bg-orange-500': nivel === 'ALTO',
            'bg-blue-500': nivel === 'MEDIO',
            'bg-green-500': nivel === 'BAJO',
        };
    }

    barraFillClassesRiesgo(score: number): { [key: string]: boolean } {
        const nivel = this.riesgoColor(score);
        return {
            'bg-red-500': nivel === 'danger',
            'bg-orange-500': nivel === 'warn',
            'bg-green-500': nivel === 'success',
            'bg-surface-400': nivel === 'secondary',
        };
    }

    tendenciaTextClasses(pct: number): { [key: string]: boolean } {
        const nivel = this.tendenciaColor(pct);
        return {
            'text-green-500': nivel === 'success',
            'text-red-500': nivel === 'danger',
            'text-surface-500 dark:text-surface-400':
                nivel === 'secondary',
        };
    }
}
