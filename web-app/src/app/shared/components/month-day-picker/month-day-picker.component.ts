import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  Output
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Chọn NGÀY TRONG THÁNG (1 → 31), không gắn với tháng/năm cụ thể.
 * Dùng cho lịch chạy định kỳ, ví dụ "chạy vào ngày 7, 14, 21, 28 hằng tháng".
 * Giá trị ngModel: `number[]` (đã sắp xếp tăng dần) khi multiple, `number | null` khi chọn một.
 */
@Component({
  selector: 'app-month-day-picker',
  templateUrl: './month-day-picker.component.html',
  styleUrls: ['./month-day-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MonthDayPickerComponent),
      multi: true
    }
  ]
})
export class MonthDayPickerComponent implements ControlValueAccessor {
  @Input() placeholder: string = 'Chọn ngày';
  @Input() multiple: boolean = true;
  @Input() disabled: boolean = false;
  @Input() allowClear: boolean = true;
  @Input() status: 'error' | 'warning' | '' = '';
  /** Kích thước: small 40 · middle 48 (mặc định) · large 56 */
  @Input() size: 'small' | 'middle' | 'large' = 'middle';
  /** Các ngày không cho chọn, ví dụ [29, 30, 31] */
  @Input() disabledDays: number[] = [];
  /** Vị trí popup so với ô nhập */
  @Input() placement: 'bottomLeft' | 'bottomRight' = 'bottomRight';

  @Output() valueChange = new EventEmitter<number[] | number | null>();

  readonly days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);

  isOpen: boolean = false;
  selected: number[] = [];

  private onChange: (val: number[] | number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elRef: ElementRef) {}

  get hasValue(): boolean {
    return this.selected.length > 0;
  }

  get displayValue(): string {
    return this.selected.join(', ');
  }

  isSelected(day: number): boolean {
    return this.selected.includes(day);
  }

  isDayDisabled(day: number): boolean {
    return this.disabledDays.includes(day);
  }

  writeValue(val: number[] | number | null): void {
    if (Array.isArray(val)) {
      this.selected = this.normalize(val);
    } else if (typeof val === 'number') {
      this.selected = [val];
    } else {
      this.selected = [];
    }
  }

  registerOnChange(fn: (val: number[] | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) this.isOpen = false;
  }

  togglePicker(): void {
    if (this.disabled) return;
    this.isOpen ? this.close() : (this.isOpen = true);
  }

  toggleDay(day: number): void {
    if (this.disabled || this.isDayDisabled(day)) return;

    if (this.multiple) {
      this.selected = this.isSelected(day)
        ? this.selected.filter(d => d !== day)
        : this.normalize([...this.selected, day]);
    } else {
      this.selected = this.isSelected(day) ? [] : [day];
      this.close();
    }
    this.emit();
  }

  clearValue(event: MouseEvent): void {
    event.stopPropagation();
    this.selected = [];
    this.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.elRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.close();
  }

  private close(): void {
    this.isOpen = false;
    this.onTouched();
  }

  private emit(): void {
    const value = this.multiple ? [...this.selected] : (this.selected[0] ?? null);
    this.onChange(value);
    this.valueChange.emit(value);
  }

  private normalize(days: number[]): number[] {
    return Array.from(new Set(days))
      .filter(d => Number.isInteger(d) && d >= 1 && d <= 31)
      .sort((a, b) => a - b);
  }
}
