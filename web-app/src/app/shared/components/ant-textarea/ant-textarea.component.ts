import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Ô nhập nhiều dòng theo Figma ProcessX "Text Area" (cao mặc định 140px, radius 12).
 */
@Component({
  selector: 'ant-textarea',
  templateUrl: './ant-textarea.component.html',
  styleUrls: ['./ant-textarea.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AntTextareaComponent),
      multi: true
    }
  ]
})
export class AntTextareaComponent implements ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() maxLength?: number;
  @Input() showCount: boolean = false;
  /** Chiều cao ô (px). Mặc định 140 theo design */
  @Input() height: number = 140;
  /** Cho phép người dùng kéo giãn chiều cao */
  @Input() resizable: boolean = true;
  @Input() status: 'error' | 'warning' | '' = '';
  /** Kích thước: đổi cỡ chữ, padding, radius (chiều cao vẫn theo `height`) */
  @Input() size: 'small' | 'middle' | 'large' = 'middle';

  @Output() valueChange = new EventEmitter<string>();

  value: string = '';
  isFocused: boolean = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: unknown): void {
    this.value = val != null ? String(val) : '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    this.value = (event.target as HTMLTextAreaElement).value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }
}
