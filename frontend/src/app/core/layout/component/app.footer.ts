import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'my-footer',
    template: `<div class="layout-footer">
        Compoex
        <a
            href="https://primeng.org"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary font-bold hover:underline"
            >1.0</a
        >
    </div>`,
})
export class MyFooter {}
