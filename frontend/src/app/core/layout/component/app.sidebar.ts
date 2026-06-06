import { Component, ElementRef } from '@angular/core';
import { MyMenu } from './app.menu';

@Component({
    selector: 'my-sidebar',
    standalone: true,
    imports: [MyMenu],
    template: ` <div class="layout-sidebar">
        <my-menu></my-menu>
    </div>`
})
export class MySidebar {
    constructor(public el: ElementRef) {}
}
