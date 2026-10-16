import { Directive, OnInit, ElementRef } from '@angular/core';

@Directive({
    selector: '[vtsAutofocus2]'
})
export class AutofocusDirective implements OnInit {

    constructor(private elementRef: ElementRef) { };

    ngOnInit(): void {
        this.elementRef.nativeElement.focus();
    }

}
