import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-shared-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './shared-modal.component.html',
  styleUrls: ['./shared-modal.component.scss'] // Asegúrate de enlazar el SCSS
})
export class SharedModalComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  
  @Input() header = '';
  
  // Ancho por defecto para escritorio (un poco más ancho que 450px para formularios cómodos)
  @Input() width = '30rem'; 

  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }
}