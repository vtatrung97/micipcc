import { Directive, ElementRef, HostListener, Input } from '@angular/core';

/**
 * Lọc ký tự ngay khi gõ cho <input> thường (vd: ô trong bảng của drawer).
 * Giá trị bị lọc thì ghi lại vào ô và phát lại sự kiện input để ngModel nhận giá trị đã lọc.
 */
@Directive({ selector: 'input[appInputFilter]' })
export class InputFilterDirective {
  @Input() appInputFilter?: (value: string) => string;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  onInput(): void {
    const input = this.el.nativeElement;
    if (!this.appInputFilter) return;
    const filtered = this.appInputFilter(input.value);
    if (filtered === input.value) return;
    const caret = Math.max(0, (input.selectionStart ?? filtered.length) - (input.value.length - filtered.length));
    input.value = filtered;
    input.setSelectionRange(caret, caret);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
