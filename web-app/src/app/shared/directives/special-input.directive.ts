import {Directive, HostListener} from '@angular/core';
import {NgControl} from '@angular/forms';

@Directive({
    selector: '[appSpecialInput]'
})
export class SpecialInputDirective {

    constructor(
        private el: NgControl
    ) { }

    @HostListener('input', ['$event.target.value'])
    onInput(value: string) {
        // @ts-ignore
        this.el.control.patchValue(value.replace(/[`~!#$%^&*|+\=?:'<>\{\}\[\]\\]/g, ''));
    }

}
