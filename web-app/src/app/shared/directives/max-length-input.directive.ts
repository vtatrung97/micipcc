import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appMaxLengthInput]'
})
export class MaxLengthInputDirective {
  private _maxLength = 50;

  @Input('appMaxLengthInput')
  set maxLength(value: number | string) {
    this._maxLength = Number(value) || 0;
  }

  get maxLength(): number | string {
    return this._maxLength;
  }

  constructor(private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value.length > this._maxLength) {
      const trimmed = input.value.slice(0, this._maxLength);
      input.value = trimmed;
      this.ngControl.control?.setValue(trimmed, { emitEvent: false });
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') ?? '';
    const input = event.target as HTMLInputElement;
    const currentValue = input.value;
    const newValue = (currentValue + pastedText).slice(0, this._maxLength);

    input.value = newValue;
    this.ngControl.control?.setValue(newValue);
  }
}
