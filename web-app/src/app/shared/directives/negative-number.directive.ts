import { Directive, Input, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[NegativeNumber]'
})
export class NegativeNumberDirective {

    private navigationKeys = [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        'Home',
        'End',
        'ArrowLeft',
        'ArrowRight',
        'Clear',
        'Copy',
        'Paste'
    ];

    constructor(private el: ElementRef) {}

    @Input() NegativeNumber: boolean | undefined;

    @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
        let e = <KeyboardEvent>event;
        const value: string = this.el.nativeElement.value;
        const inputElement = this.el.nativeElement;
        const caretPosition = inputElement.selectionStart;

        if (
            this.navigationKeys.indexOf(e.key) > -1 || // Cho phép các phím điều hướng
            (e.key === 'a' && (e.ctrlKey || e.metaKey)) || // Cho phép Ctrl+A / Cmd+A
            (e.key === 'c' && (e.ctrlKey || e.metaKey)) || // Cho phép Ctrl+C / Cmd+C
            (e.key === 'v' && (e.ctrlKey || e.metaKey)) || // Cho phép Ctrl+V / Cmd+V
            (e.key === 'x' && (e.ctrlKey || e.metaKey)) // Cho phép Ctrl+X / Cmd+X
        ) {
            return; // Không chặn các phím này
        }

        // Cho phép dấu + chỉ ở đầu chuỗi
        if (e.key === '-') {
            if (caretPosition !== 0 || value.includes('-')) {
                e.preventDefault();
            }
            return;
        }

        if (e.key === '.') {
            if (caretPosition === 0 || value.includes('.')) {
                e.preventDefault();
            }
            return;
        }

        // Chỉ cho phép nhập số
        if (
            (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && // Không phải số từ 0-9 (hàng phím thường)
            (e.keyCode < 96 || e.keyCode > 105) // Không phải số từ 0-9 (hàng phím numpad)
        ) {
            e.preventDefault();
        }
    }

    @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
        const clipboardData = event.clipboardData;
        const pastedInput = clipboardData?.getData('text') || '';
        const isPhoneNumber = /^\+?\d+$/.test(pastedInput);

        if (!isPhoneNumber) {
            event.preventDefault();
        }
    }

}
