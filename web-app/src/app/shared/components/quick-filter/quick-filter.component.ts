import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectOption } from '../ant-select/ant-select.component';

/**
 * Nhóm chip lọc nhanh, chọn một giá trị (Figma ProcessX "Quick filters" / "Filter / ...").
 * Chip active nền Primary/600 chữ trắng; chip thường viền Neutral/300 chữ Neutral/800; bo tròn hoàn toàn.
 */
@Component({
  selector: 'app-quick-filter',
  templateUrl: './quick-filter.component.html',
  styleUrls: ['./quick-filter.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuickFilterComponent),
      multi: true
    }
  ]
})
export class QuickFilterComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() disabled: boolean = false;

  @Output() valueChange = new EventEmitter<any>();

  value: any = null;

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  isActive(option: SelectOption): boolean {
    return option.value === this.value;
  }

  select(option: SelectOption): void {
    if (this.disabled || option.disabled || this.isActive(option)) return;
    this.value = option.value;
    this.onChange(this.value);
    this.onTouched();
    this.valueChange.emit(this.value);
  }

  writeValue(val: any): void {
    this.value = val;
  }

  registerOnChange(fn: (val: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
