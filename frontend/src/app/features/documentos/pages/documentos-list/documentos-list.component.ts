import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { SharedTableComponent } from '@/shared/components/shared-table/shared-table.component';
import {
  TableColumn,
  RowAction
} from '@/shared/components/shared-table/interfaces/table-config.interface';
import { ToastService } from '@/core/services/toast.service';
import { DocumentosService } from '../../services/documentos.service';
import { Documento } from '../../models/documento.interface';

@Component({
  selector: 'app-documentos-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, ConfirmDialogModule, SharedTableComponent],
  providers: [ConfirmationService],
  template: `
    <div class="card">
      <div class="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <h1 class="text-2xl font-semibold text-color m-0">Documentos</h1>
          <p class="text-muted-color m-0 mt-1">Gestiona los archivos del sistema</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3 mb-3">
        <p-button
          icon="pi pi-refresh"
          severity="secondary"
          [outlined]="true"
          (onClick)="cargar()"
          pTooltip="Recargar"
        />

        <p-button icon="pi pi-upload" label="Subir Documento" (onClick)="subir()" />
      </div>

      <app-shared-table
        [data]="documentos()"
        [columns]="columns"
        [rowActions]="rowActions"
        [loading]="loading()"
        [searchFields]="[]"
        title=""
        dataKey="id"
        (actionClicked)="onAction($event)"
      />
      <p-confirmDialog />
    </div>
  `
})
export class DocumentosListComponent implements OnInit {
  private documentosService = inject(DocumentosService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private confirmation = inject(ConfirmationService);

  documentos = signal<Documento[]>([]);
  loading = signal<boolean>(true);

  columns: TableColumn[] = [
    {
      field: 'filename',
      header: 'Nombre',
      type: 'text'
    },
    {
      field: 'contentType',
      header: 'Tipo',
      type: 'text',
      width: '200px'
    },
    {
      field: 'size',
      header: 'Tamaño',
      type: 'text',
      width: '120px'
    },
    {
      field: 'createdBy',
      header: 'Creado por',
      type: 'text',
      width: '120px'
    },
    {
      field: 'createdAt',
      header: 'Fecha de creación',
      type: 'date',
      width: '160px'
    },
    {
      field: 'status',
      header: 'Estado',
      type: 'tag',
      width: '120px'
    },
    {
      field: 'acciones',
      header: 'Acciones',
      type: 'actions',
      width: '160px'
    }
  ];

  rowActions: RowAction[] = [
    {
      key: 'view',
      icon: 'pi pi-eye',
      tooltip: 'Ver detalle',
      severity: 'info'
    },
    {
      key: 'download',
      icon: 'pi pi-download',
      tooltip: 'Descargar',
      severity: 'success'
    },
    {
      key: 'delete',
      icon: 'pi pi-trash',
      tooltip: 'Eliminar',
      severity: 'danger'
    }
  ];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.documentosService.list().subscribe({
      next: (data) => {
        this.documentos.set(data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err, 'No se pudieron cargar los documentos');
      }
    });
  }

  subir(): void {
    this.router.navigate(['/home/documentos/subir']);
  }

  onAction(event: { action: string; data: Documento }): void {
    if (event.action === 'view') {
      this.verDetalle(event.data);
    } else if (event.action === 'download') {
      this.descargar(event.data);
    } else if (event.action === 'delete') {
      this.confirmarEliminar(event.data);
    }
  }

  private verDetalle(d: Documento): void {
    this.router.navigate(['/home/documentos', d.id]);
  }

  private descargar(d: Documento): void {
    this.documentosService.download(d.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = d.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toast.success('Descarga iniciada', d.filename);
      },
      error: (err) => this.toast.error(err, 'Error al descargar')
    });
  }

  private confirmarEliminar(d: Documento): void {
    this.confirmation.confirm({
      message: `¿Eliminar el documento "${d.filename}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.eliminar(d)
    });
  }

  private eliminar(d: Documento): void {
    this.documentosService.delete(d.id).subscribe({
      next: () => {
        this.toast.success('Documento eliminado');
        this.cargar();
      },
      error: (err) => this.toast.error(err, 'Error al eliminar')
    });
  }
}
