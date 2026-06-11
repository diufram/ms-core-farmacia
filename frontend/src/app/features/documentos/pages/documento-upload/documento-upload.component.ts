import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { FileUploadModule, FileUploadHandlerEvent } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageModule } from 'primeng/message';

import { ToastService } from '@/core/services/toast.service';
import { DocumentosService } from '../../services/documentos.service';

@Component({
  selector: 'app-documento-upload',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    FileUploadModule,
    CardModule,
    ProgressBarModule,
    MessageModule
  ],
  styles: [
    `
      .upload-area {
        background: var(--surface-card);
        border: 2px dashed var(--surface-border);
        border-radius: 12px;
        padding: 2.5rem 1.5rem;
        text-align: center;
        transition: all 0.2s;
      }
      .upload-area:hover {
        border-color: var(--primary-color);
        background: var(--surface-hover);
      }
      .upload-area ::ng-deep .p-fileupload-buttonbar {
        display: none;
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
          <h1 class="text-2xl font-semibold text-color m-0">Subir Documento</h1>
          <p class="text-muted-color m-0 mt-1">Carga archivos al sistema de documentos</p>
        </div>
      </div>

      <p-card>
        <div class="upload-area">
          <i class="pi pi-cloud-upload text-5xl text-primary block mb-3"></i>
          <h3 class="text-color m-0 mb-2">Arrastra un archivo o haz clic para seleccionar</h3>
          <p class="text-muted-color m-0 mb-4">Cualquier tipo de archivo (máx. 25 MB)</p>

          <p-fileUpload
            #fu
            mode="basic"
            chooseLabel="Seleccionar archivo"
            [auto]="true"
            [maxFileSize]="25 * 1024 * 1024"
            chooseIcon="pi pi-plus"
            [customUpload]="true"
            (uploadHandler)="onUpload($event)"
            [disabled]="uploading()"
          />
        </div>

        @if (uploading()) {
          <div class="mt-4">
            <p-progressBar mode="indeterminate" [style]="{ height: '6px' }" />
            <p class="text-center text-muted-color text-sm mt-2">Subiendo archivo...</p>
          </div>
        }
      </p-card>

      @if (errorMessage()) {
        <p-message severity="error" [text]="errorMessage()" styleClass="w-full mt-4" />
      }

      <div class="flex justify-end gap-3 pt-4">
        <p-button
          type="button"
          label="Cancelar"
          severity="secondary"
          [outlined]="true"
          (onClick)="cancelar()"
          [disabled]="uploading()"
        />
      </div>
    </div>
  `
})
export class DocumentoUploadComponent {
  private documentosService = inject(DocumentosService);
  private toast = inject(ToastService);
  private router = inject(Router);

  uploading = signal<boolean>(false);
  errorMessage = signal<string>('');

  onUpload(event: FileUploadHandlerEvent): void {
    const file = event.files?.[0];

    if (!file) return;

    this.errorMessage.set('');
    this.uploading.set(true);

    this.documentosService.upload(file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.toast.success(`Archivo "${res.filename}" subido correctamente`);
        this.router.navigate(['/home/documentos']);
      },
      error: (err) => {
        this.uploading.set(false);
        const msg = err?.message ?? 'Error al subir el archivo';

        this.errorMessage.set(msg);
        this.toast.error(err, 'Error al subir');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/home/documentos']);
  }
}
