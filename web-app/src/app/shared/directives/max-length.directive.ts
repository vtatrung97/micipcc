import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appMaxLength]'
})
export class MaxLengthDirective {
    @Input() appMaxLength: any = 50;

  constructor(private ngControl: NgControl) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const value = this.ngControl?.control?.value || '';

    // Các phím luôn được phép (kể cả Space)
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
      'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'
    ];

    // Cho phép các tổ hợp Ctrl
    const isCtrlCombo =
    event.ctrlKey &&
    ['a', 'c', 'x', 'v'].includes(event.key.toLowerCase());

      if (value.length >= this.appMaxLength && !allowedKeys.includes(event.key) && !isCtrlCombo) {
        event.preventDefault(); // Chặn nhập thêm
      }
    }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const value = this.ngControl?.control?.value || '';
    const pasteText = event.clipboardData?.getData('text') ?? '';

    if (value.length + pasteText.length > this.appMaxLength) {
      event.preventDefault();
      const allowed = pasteText.substring(0, this.appMaxLength - value.length);
      this.ngControl.control?.setValue(value + allowed);
    }
  }
}
