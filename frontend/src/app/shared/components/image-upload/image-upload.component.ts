import { Component, EventEmitter, Input, Output, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule, FileSelectEvent } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-image-upload',
    standalone: true,
    imports: [CommonModule, FileUploadModule, ButtonModule, AvatarModule, MenuModule],
    template: `
        <div class="image-upload-container">
            <!-- Preview de imagen actual (de servidor) -->
            <div class="current-image" *ngIf="imageUrl && !localPreviewUrl">
                <div class="image-wrapper">
                    <img
                        [src]="imageUrl"
                        [alt]="altText"
                        class="preview-image"
                    />
                    <button
                        pButton
                        icon="pi pi-ellipsis-v"
                        class="menu-btn"
                        (click)="menu.toggle($event)"
                        pTooltip="Opciones"
                        tooltipPosition="top"
                    ></button>
                    <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body"></p-menu>
                </div>
            </div>

            <!-- Preview local (modo create) -->
            <div class="current-image" *ngIf="localPreviewUrl">
                <div class="image-wrapper">
                    <img
                        [src]="localPreviewUrl"
                        [alt]="altText"
                        class="preview-image"
                    />
                    <button
                        pButton
                        icon="pi pi-ellipsis-v"
                        class="menu-btn"
                        (click)="menu.toggle($event)"
                        pTooltip="Opciones"
                        tooltipPosition="top"
                    ></button>
                    <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body"></p-menu>
                </div>
            </div>

            <!-- Avatar placeholder si no hay imagen -->
            <div class="avatar-placeholder" *ngIf="!imageUrl && !localPreviewUrl">
                <div class="avatar-box clickable" (click)="triggerFileUpload()">
                    <i class="pi pi-user avatar-icon"></i>
                </div>
            </div>

            <!-- Mensaje cuando es modo create/edit y no hay imagen -->
            <div class="upload-hint" *ngIf="!imageUrl && (mode === 'create' || mode === 'edit')">
                <span class="hint-text">Haz clic aquí para subir una foto</span>
            </div>

            <!-- Upload button solo cuando esta deshabilitado (view mode) -->
            <div class="upload-section" *ngIf="!imageUrl && disabled">
                <small class="text-500 mt-2 block" *ngIf="showHelpText">
                    Formatos: JPG, PNG, WebP. Máx: 5MB
                </small>
            </div>
        </div>
    `,
    styles: [`
        .image-upload-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            padding: 0.5rem;
        }

        .current-image {
            position: relative;
            display: inline-block;
        }

        .image-wrapper {
            position: relative;
            display: inline-block;
        }

        .preview-image {
            width: 150px;
            height: 150px;
            object-fit: cover;
            border-radius: 12px;
            border: 2px solid var(--surface-border);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.2s ease;
        }

        .preview-image:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .menu-btn {
            position: absolute;
            bottom: -8px;
            right: -8px;
            width: 32px !important;
            height: 32px !important;
            border-radius: 50% !important;
            padding: 0 !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .menu-btn:hover {
            transform: scale(1.05);
        }

        .avatar-placeholder {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .avatar-box {
            width: 150px;
            height: 150px;
            background: var(--surface-100);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid var(--surface-border);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .avatar-box:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .avatar-icon {
            font-size: 3rem;
            color: var(--text-color-secondary);
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .upload-section {
            text-align: center;
            width: 100%;
        }

        .upload-section ::ng-deep .p-button {
            font-size: 0.875rem;
            padding: 0.5rem 1rem;
        }

        .upload-hint {
            text-align: center;
            margin-top: 0.75rem;
        }

        .hint-text {
            font-size: 0.875rem;
            color: var(--text-color-secondary);
            font-style: italic;
        }
    `],
})
export class ImageUploadComponent implements OnInit {
    @Input() imageUrl?: string;
    @Input() altText: string = 'Foto';
    @Input() fallbackName: string = '';
    @Input() disabled: boolean = false;
    @Input() showHelpText: boolean = true;
    @Input() maxFileSize: number = 5 * 1024 * 1024; // 5MB
    @Input() mode: 'create' | 'edit' | 'view' = 'create';

    @Output() fileSelected = new EventEmitter<File>();
    @Output() deleteImage = new EventEmitter<void>();
    @Output() error = new EventEmitter<string>();

    @ViewChild('fileUpload') fileUpload?: any;
    
    menuItems: MenuItem[] = [];
    
    // Para modo create: preview local de la imagen
    localPreviewUrl?: string;

    // Track previous imageUrl to detect changes
    private previousImageUrl?: string;

    ngOnInit() {
        this.updateMenuItems();
        this.previousImageUrl = this.imageUrl;
    }

    ngOnChanges() {
        this.updateMenuItems();
        // If imageUrl changed (e.g., after delete), clear local preview
        if (this.previousImageUrl !== this.imageUrl) {
            if (this.localPreviewUrl) {
                URL.revokeObjectURL(this.localPreviewUrl);
                this.localPreviewUrl = undefined;
            }
            this.previousImageUrl = this.imageUrl;
        }
    }

    private updateMenuItems() {
        this.menuItems = [
            {
                label: 'Cambiar foto',
                icon: 'pi pi-camera',
                command: () => this.triggerFileUpload()
            },
            {
                label: 'Eliminar foto',
                icon: 'pi pi-trash',
                styleClass: 'text-red-500',
                command: () => this.onDeleteLocal()
            }
        ];
    }

    onDeleteLocal() {
        if (this.localPreviewUrl) {
            URL.revokeObjectURL(this.localPreviewUrl);
            this.localPreviewUrl = undefined;
        }
        this.onDelete();
    }

    triggerFileUpload() {
        // Crear un input file oculto y simular el clic
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
        input.style.display = 'none';
        
        input.onchange = (event: any) => {
            const file = event.target.files[0];
            if (file) {
                // En modo create, mostrar preview local primero
                if (this.mode === 'create') {
                    this.showLocalPreview(file);
                } else {
                    this.handleFile(file);
                }
            }
            document.body.removeChild(input);
        };
        
        document.body.appendChild(input);
        input.click();
    }

    private showLocalPreview(file: File) {
        // Validar tipo y tamaño antes de mostrar preview
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            this.error.emit('Tipo de archivo no válido. Solo se permiten: JPG, JPEG, PNG, WebP');
            return;
        }

        if (file.size > this.maxFileSize) {
            this.error.emit(`El archivo es demasiado grande. Máximo permitido: 5MB`);
            return;
        }

        // Crear URL local para preview
        this.localPreviewUrl = URL.createObjectURL(file);
        
        // Emitir el archivo para que el componente padre lo guarde
        this.fileSelected.emit(file);
    }

    onFileSelect(event: FileSelectEvent) {
        const file = event.currentFiles[0];
        if (file) {
            this.handleFile(file);
        }
    }

    private handleFile(file: File) {
        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            this.error.emit('Tipo de archivo no válido. Solo se permiten: JPG, JPEG, PNG, WebP');
            return;
        }

        // Validar tamaño
        if (file.size > this.maxFileSize) {
            this.error.emit(`El archivo es demasiado grande. Máximo permitido: 5MB`);
            return;
        }

        this.fileSelected.emit(file);
    }

    onDelete() {
        this.deleteImage.emit();
    }

    onUploadError(event: any) {
        this.error.emit('Error al subir el archivo');
    }

    getInitials(): string {
        if (!this.fallbackName) return '?';
        return this.fallbackName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }

    // Método público para limpiar el preview local (útil desde el componente padre)
    clearLocalPreview() {
        if (this.localPreviewUrl) {
            URL.revokeObjectURL(this.localPreviewUrl);
            this.localPreviewUrl = undefined;
        }
    }
}
