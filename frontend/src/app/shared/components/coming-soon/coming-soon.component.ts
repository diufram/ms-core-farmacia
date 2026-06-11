import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto mt-12">
      <div
        class="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4"
      >
        <i class="pi pi-cog text-3xl text-primary"></i>
      </div>
      <h2 class="text-2xl font-semibold text-color mb-2">
        {{ title }}
      </h2>
      <p class="text-muted-color leading-relaxed">
        Este módulo se encuentra en desarrollo y estará disponible próximamente.
      </p>
    </div>
  `
})
export class ComingSoonComponent {
  @Input() title = 'Módulo en desarrollo';
}
