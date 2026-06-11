import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfirmationService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { FileUploadModule, FileUploadHandlerEvent } from 'primeng/fileupload';

import { ToastService } from '@/core/services/toast.service';
import { DocumentosService } from '../../services/documentos.service';
import { Documento } from '../../models/documento.interface';

@Component({
  selector: 'app-documento-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    TagModule,
    DividerModule,
    ConfirmDialogModule,
    TableModule,
    FileUploadModule
  ],
  providers: [ConfirmationService],
  styles: [
    `
      .meta-row {
        display: flex;
        justify-content: space-between;
        padding: 0.6rem 0;
        border-bottom: 1px solid var(--surface-border);
      }
      .meta-row:last-child {
        border-bottom: none;
      }
      .meta-label {
        font-weight: 600;
        color: var(--text-color-secondary);
        font-size: 0.85rem;
      }
      .meta-value {
        color: var(--text-color);
        font-size: 0.9rem;
        text-align: right;
        word-break: break-all;
      }
    `
  ],
  template: `
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center gap-3 mb-4">
        <p-button
          icon="pi pi-arrow-left"
          severity="secondary"
          [text]="true"
          (onClick)="cancelar()"
        />
        <div>
          <h1 class="text-2xl font-semibold text-color m-0">Detalle del Documento</h1>
          <p class="text-muted-color m-0 mt-1">Información del archivo</p>
        </div>
      </div>

      @if (loading()) {
        <p-card>
          <div class="text-center py-6 text-muted-color">
            <i class="pi pi-spin pi-spinner text-2xl"></i>
            <p class="mt-2">Cargando información...</p>
          </div>
        </p-card>
      } @else if (documento()) {
        <p-card>
          <ng-template pTemplate="header">
            <div class="px-6 pt-5 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <i class="pi pi-file text-3xl text-primary"></i>
                <h3 class="text-lg font-semibold text-color m-0">
                  {{ documento()?.filename }}
                </h3>
              </div>
              <p-tag
                [value]="documento()?.status ?? ''"
                [severity]="getStatusSeverity(documento()?.status)"
              />
            </div>
          </ng-template>

          <div>
            <div class="meta-row">
              <span class="meta-label">ID</span>
              <span class="meta-value">{{ documento()?.id }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Nombre del archivo</span>
              <span class="meta-value">{{ documento()?.filename }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Tipo (MIME)</span>
              <span class="meta-value">{{ documento()?.contentType }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Tamaño</span>
              <span class="meta-value">{{ formatSize(documento()?.size) }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Creado por</span>
              <span class="meta-value">{{ documento()?.createdBy }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Fecha de creación</span>
              <span class="meta-value">{{ documento()?.createdAt | date: 'medium' }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">S3 Key</span>
              <span class="meta-value">{{ documento()?.s3Key }}</span>
            </div>

            @if (documento()?.status === 'DELETED') {
              <div class="meta-row">
                <span class="meta-label">Eliminado por</span>
                <span class="meta-value">{{ documento()?.deletedBy }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Fecha de eliminación</span>
                <span class="meta-value text-red-500">{{
                  documento()?.deletedAt | date: 'medium'
                }}</span>
              </div>
            }
          </div>

          @if (documento()?.updateHistory?.length) {
            <div class="mt-5">
              <h4 class="text-lg font-semibold mb-3">Historial de Actualizaciones</h4>
              <p-table
                [value]="documento()?.updateHistory || []"
                [tableStyle]="{ 'min-width': '50rem' }"
                styleClass="p-datatable-sm"
              >
                <ng-template pTemplate="header">
                  <tr>
                    <th>Fecha</th>
                    <th>Actualizado por</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-record>
                  <tr>
                    <td>{{ record.updatedAt | date: 'medium' }}</td>
                    <td>{{ record.updatedBy }}</td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          }

          <ng-template pTemplate="footer">
            <div class="flex justify-end gap-3 flex-wrap items-center">
              @if (documento()?.status !== 'DELETED') {
                <p-fileUpload
                  mode="basic"
                  chooseLabel="Actualizar Archivo"
                  chooseIcon="pi pi-upload"
                  [auto]="true"
                  [customUpload]="true"
                  (uploadHandler)="onUpdateFile($event)"
                  styleClass="p-button-outlined p-button-secondary"
                />
                <p-button
                  icon="pi pi-trash"
                  label="Eliminar"
                  severity="danger"
                  [outlined]="true"
                  (onClick)="confirmarEliminar()"
                />
                <p-button
                  icon="pi pi-download"
                  label="Descargar"
                  severity="success"
                  (onClick)="descargar()"
                />
              }
            </div>
          </ng-template>
        </p-card>
      } @else {
        <p-card>
          <div class="text-center py-6 text-muted-color">
            <i class="pi pi-exclamation-triangle text-3xl text-orange-500"></i>
            <p class="mt-2">No se encontró el documento</p>
          </div>
        </p-card>
      }

      <p-confirmDialog />
    </div>
  `
})
export class DocumentoDetailComponent implements OnInit {
  private documentosService = inject(DocumentosService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private confirmation = inject(ConfirmationService);

  documento = signal<Documento | null>(null);
  loading = signal<boolean>(true);

  onUpdateFile(event: FileUploadHandlerEvent): void {
    const file = event.files?.[0];
    const doc = this.documento();

    if (!file || !doc) return;

    this.loading.set(true);
    this.documentosService.updateFile(doc.id, file).subscribe({
      next: (res) => {
        this.toast.success('Archivo actualizado correctamente');
        this.cargar(doc.id);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err, 'Error al actualizar el archivo');
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.loading.set(false);
      this.toast.error('ID de documento inválido');
      this.cancelar();

      return;
    }

    this.cargar(id);
  }

  private cargar(id: string): void {
    this.loading.set(true);
    this.documentosService.get(id).subscribe({
      next: (data) => {
        this.documento.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err, 'No se pudo cargar el documento');
      }
    });
  }

  descargar(): void {
    const doc = this.documento();

    if (!doc) return;
    this.documentosService.download(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = doc.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toast.success('Descarga iniciada', doc.filename);
      },
      error: (err) => this.toast.error(err, 'Error al descargar')
    });
  }

  confirmarEliminar(): void {
    const doc = this.documento();

    if (!doc) return;
    this.confirmation.confirm({
      message: `¿Eliminar el documento "${doc.filename}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.eliminar()
    });
  }

  private eliminar(): void {
    const doc = this.documento();

    if (!doc) return;
    this.documentosService.delete(doc.id).subscribe({
      next: () => {
        this.toast.success('Documento eliminado');
        this.cancelar();
      },
      error: (err) => this.toast.error(err, 'Error al eliminar')
    });
  }

  formatSize(bytes?: number): string {
    if (!bytes && bytes !== 0) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  getStatusSeverity(status?: string): 'success' | 'danger' | 'info' | 'warn' {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'DELETED':
        return 'danger';
      default:
        return 'info';
    }
  }

  cancelar(): void {
    this.router.navigate(['/home/documentos']);
  }
}
