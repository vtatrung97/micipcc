import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[trimOnBlur]'
})
export class TrimOnBlurDirective {
  constructor(private el: ElementRef) {}

  @HostListener('blur')
  onBlur() {
    const value: string = this.el.nativeElement.value;
    if (value && typeof value === 'string') {
      this.el.nativeElement.value = value.trim();
    }
  }
}
