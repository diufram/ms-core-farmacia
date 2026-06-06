import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { Title } from '@angular/platform-browser'; // 1. Ya lo tienes importado aquí

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, ToastModule],
    template: ` <p-toast position="top-right"></p-toast>
        <router-outlet></router-outlet>`,
})
export class AppComponent {
    // 2. Agregas el constructor para inyectar el servicio
    constructor(private titleService: Title) {
        // 3. Fijas el nombre de tu App
        this.titleService.setTitle('Competencias');
    }
}
