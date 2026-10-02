import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ant-checkbox',
  templateUrl: './ant-checkbox.component.html',
  styleUrls: ['./ant-checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AntCheckboxComponent),
      multi: true
    }
  ]
})
export class AntCheckboxComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() disabled: boolean = false;
  @Input() indeterminate: boolean = false;

  @Output() checkedChange = new EventEmitter<boolean>();

  checked: boolean = false;
  contentChild: boolean = true;

  private onChange: (val: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: any): void {
    this.checked = !!val;
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

  onCheckboxChange(event: Event): void {
    if (this.disabled) return;
    this.checked = (event.target as HTMLInputElement).checked;
    this.onChange(this.checked);
    this.checkedChange.emit(this.checked);
    this.onTouched();
  }
}
