import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appMaxLengthInputNgSelect]'
})
export class MaxLengthInputNgSelectDirective {
  private _maxLength = 50;

  @Input('appMaxLengthInputNgSelect')
  set maxLength(value: number | string) {
    const n = Number(value);
    this._maxLength = Number.isFinite(n) && n > 0 ? n : 50;
  }
  get maxLength(): number | string { return this._maxLength; }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    if (input.value.length > this._maxLength) {
      input.value = input.value.slice(0, this._maxLength);
      // Cho ng-select biết input đã đổi
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') ?? '';
    const newValue = (input.value + pastedText).slice(0, this._maxLength);

    input.value = newValue;
    // Cho ng-select biết input đã đổi (ẩn placeholder, cập nhật search)
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
