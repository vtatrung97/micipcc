import { Directive, HostListener, Renderer2, ElementRef } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[appRemoveFocus]'
})
export class RemoveFocusDirective {

    constructor(private renderer: Renderer2, private el: ElementRef) { }

    @HostListener('click') onClick() {
        this.renderer.selectRootElement(this.el.nativeElement).blur();
    }

}
