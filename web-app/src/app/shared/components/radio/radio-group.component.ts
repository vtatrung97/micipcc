import {
  Component,
  ContentChild,
  Directive,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  TemplateRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectOption } from '../ant-select/ant-select.component';

/** Context của template nội dung mở rộng dưới mỗi lựa chọn */
export interface RadioExtraContext {
  $implicit: SelectOption;
  checked: boolean;
}

/**
 * Nội dung hiển thị bên dưới lựa chọn đang được chọn (vd: "Lặp lịch" → khung cấu hình lịch).
 * <ng-template appRadioExtra let-option let-checked="checked">…</ng-template>
 */
@Directive({ selector: 'ng-template[appRadioExtra]' })
export class RadioExtraDirective {
  constructor(public templateRef: TemplateRef<RadioExtraContext>) {}
}

let nextGroupId = 0;

/**
 * Nhóm radio chọn một giá trị. direction 'vertical': xếp dọc cách 8; 'horizontal': xếp ngang cách 32.
 * Nội dung mở rộng hiện dưới lựa chọn đang chọn, lùi trái 28px cho thẳng hàng chữ.
 */
@Component({
  selector: 'app-radio-group',
  templateUrl: './radio-group.component.html',
  styleUrls: ['./radio-group.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroupComponent),
      multi: true
    }
  ]
})
export class RadioGroupComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() direction: 'vertical' | 'horizontal' = 'vertical';
  @Input() disabled: boolean = false;
  /** Bọc nội dung mở rộng trong khung nền Neutral/100, padding 16, radius 12 */
  @Input() extraBoxed: boolean = true;

  @Output() valueChange = new EventEmitter<any>();

  @ContentChild(RadioExtraDirective) extra?: RadioExtraDirective;

  readonly name = `px-radio-group-${nextGroupId++}`;
  value: any = null;

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  isChecked(option: SelectOption): boolean {
    return option.value === this.value;
  }

  choose(option: SelectOption): void {
    if (this.disabled || option.disabled || this.isChecked(option)) return;
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
