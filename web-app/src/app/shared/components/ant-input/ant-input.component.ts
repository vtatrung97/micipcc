import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ViewChild,
  ElementRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ant-input',
  templateUrl: './ant-input.component.html',
  styleUrls: ['./ant-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AntInputComponent),
      multi: true
    }
  ]
})
export class AntInputComponent implements ControlValueAccessor {
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() allowClear: boolean = false;
  @Input() prefixIcon?: string;
  @Input() suffixIcon?: string;
  @Input() maxLength?: number;
  @Input() showCount: boolean = false;
  @Input() size: 'small' | 'middle' | 'large' = 'middle';
  @Input() status: 'error' | 'warning' | '' = '';

  @Output() onEnter = new EventEmitter<string>();
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('inputElement') inputElement?: ElementRef<HTMLInputElement>;

  value: string = '';
  isFocused: boolean = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: any): void {
    this.value = val != null ? String(val) : '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  clearValue(event: MouseEvent): void {
    event.stopPropagation();
    this.value = '';
    this.onChange('');
    this.valueChange.emit('');
    if (this.inputElement) {
      this.inputElement.nativeElement.focus();
    }
  }
}
