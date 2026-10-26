import { ChangeDetectorRef, Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Ô nhập số có nút tăng/giảm bên phải và hậu tố đơn vị (vd: "giây") */
@Component({
  selector: 'ant-input-number',
  templateUrl: './ant-input-number.component.html',
  styleUrls: ['./ant-input-number.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AntInputNumberComponent),
      multi: true,
    },
  ],
})
export class AntInputNumberComponent implements ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input() min?: number;
  @Input() max?: number;
  @Input() step: number = 1;
  /** Đơn vị hiển thị sau số */
  @Input() suffix?: string;
  @Input() disabled: boolean = false;
  @Input() status: 'error' | '' = '';

  value: number | null = null;
  isFocused: boolean = false;

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  onInput(raw: string): void {
    const text = raw.trim();
    const num = text === '' ? null : Number(text);
    this.setValue(num === null || isNaN(num) ? null : num, false);
  }

  /** Rời ô: kẹp giá trị vào khoảng [min, max] */
  onBlur(): void {
    this.isFocused = false;
    if (this.value !== null) this.setValue(this.clamp(this.value), true);
    this.onTouched();
  }

  stepBy(direction: 1 | -1): void {
    if (this.disabled) return;
    const base = this.value ?? this.min ?? 0;
    this.setValue(this.clamp(base + direction * this.step), true);
    this.onTouched();
  }

  writeValue(value: number | null): void {
    this.value = value ?? null;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  private setValue(value: number | null, emitAlways: boolean): void {
    if (!emitAlways && value === this.value) return;
    this.value = value;
    this.onChange(value);
  }

  private clamp(value: number): number {
    let v = value;
    if (this.min !== undefined) v = Math.max(this.min, v);
    if (this.max !== undefined) v = Math.min(this.max, v);
    return v;
  }
}
