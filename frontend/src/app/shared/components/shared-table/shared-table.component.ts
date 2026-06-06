import {
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import {
    TableColumn,
    RowAction,
    ActionEvent,
} from './interfaces/table-config.interface';
import { RatingModule } from 'primeng/rating';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
    selector: 'app-shared-table',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        ToolbarModule,
        TagModule,
        IconFieldModule,
        InputIconModule,
        TooltipModule,
        RatingModule,
        SkeletonModule,
    ],
    templateUrl: './shared-table.component.html',
    styleUrl: './shared-table.component.scss',
    // Asegúrate de tener estilos básicos o PrimeFlex cargado
})
export class SharedTableComponent {
    @ViewChild('dt') dt!: Table;

    // --- Inputs de Datos ---
    @Input() data: any[] = [];
    @Input() columns: TableColumn[] = [];
    private _loading: boolean = false;
    showSkeleton: boolean = false;
    @Input()
    set loading(value: boolean) {
        this._loading = value;
        this.showSkeleton = value;
    }
    get loading(): boolean {
        return this._loading;
    }
    @Input() title: string = 'Gestión de Registros';

    // --- Configuración de Paginación ---
    @Input() searchFields: string[] = []; // Campos por los que busca el input global
    @Input() rows: number = 10;
    @Input() first: number = 0; // Página actual (índice)
    @Input() dataKey: string = 'id';
    @Input() rowActions: RowAction[] = [];
    @Input() paginator: boolean = true; // Habilitar/deshabilitar paginador
    @Input() rowsPerPageOptions: number[] = [10, 20, 50]; // Opciones de filas por página
    @Input() skeletonItemTemplate: TemplateRef<any> | null = null; // Template para skeleton items

    // --- Paginación Lazy ---
    @Input() totalRecords: number = 0; // Total de registros (del backend)
    @Input() lazyLoad: boolean = false; // Habilitar carga lazy
    @Output() onPageChange = new EventEmitter<{ first: number; rows: number }>();
    @Output() onSearchChange = new EventEmitter<string>();
    @Output() onLazyLoad = new EventEmitter<{ first: number; rows: number; page: number }>();

    get desktopGridTemplate(): string {
        return this.columns
            .map((col) => {
                const type = col.type || 'text';
                if (type === 'actions') return 'max-content';
                if (type === 'image') return '96px';
                if (type === 'tag') return 'minmax(140px, 0.8fr)';
                return 'minmax(160px, 1fr)';
            })
            .join(' ');
    }

    // --- Selección (Opcional) ---
    @Input() selectionMode: 'single' | 'multiple' | null = null;
    @Input() selectedItems: any[] = []; // Para binding [(selectedItems)]
    @Output() selectedItemsChange = new EventEmitter<any[]>();

    // --- Eventos ---
    @Output() actionClicked = new EventEmitter<ActionEvent>();
    @Output() deleteSelected = new EventEmitter<void>(); // Evento para borrar lote

    private searchTimeout: any;

    // Filtro Global
    onGlobalFilter(table: Table, event: Event) {
        const value = (event.target as HTMLInputElement).value;
        
        if (this.lazyLoad) {
            // Carga lazy: emitir evento de búsqueda al backend
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.onSearchChange.emit(value);
            }, 400);
        } else {
            // Carga normal: filtrar en cliente
            table.filterGlobal(value, 'contains');
        }
    }

    // Evento de cambio de página del paginador (solo cuando usuario hace clic)
    handlePageChange(event: any) {
        const page = Math.floor(event.first / event.rows) + 1;
        
        // Emitir evento de cambio de página
        this.onPageChange.emit({
            first: event.first,
            rows: event.rows
        });
        
        // Emitir evento lazy load
        this.onLazyLoad.emit({
            first: event.first,
            rows: event.rows,
            page: page
        });
    }

    // Evento lazy load (disparado por PrimeNG)
    onPage(event: any) {
        // Este evento se dispara automáticamente, lo manejamos solo si lazyLoad es true
    }

    // Emisor de acciones
    emitAction(action: string, item: any) {
        this.actionClicked.emit({ action, data: item });
    }

    // Manejo de Selección
    onSelectionChange(value: any[]) {
        this.selectedItems = value;
        this.selectedItemsChange.emit(value);
    }

    // Helper para Tags (puedes personalizar esto o hacerlo dinámico)
    getSeverity(
        status: string,
    ):
        | 'success'
        | 'secondary'
        | 'info'
        | 'warn'
        | 'danger'
        | 'contrast'
        | undefined {
        const s = status?.toString().toUpperCase();
        if (['ACTIVO', 'INSTOCK', 'VERIFIED'].includes(s)) return 'success';
        if (['PENDIENTE', 'LOWSTOCK'].includes(s)) return 'warn';
        if (['INACTIVO', 'OUTOFSTOCK', 'DELETED'].includes(s)) return 'danger';
        return 'info';
    }
}
