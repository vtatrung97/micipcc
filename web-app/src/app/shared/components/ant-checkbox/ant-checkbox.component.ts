import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const ICON_BASE = 'assets/icons/processx';

/**
 * Checkbox theo Figma ProcessX Design System (node 90:3095).
 * - Không có label/nội dung → chỉ ô vuông (Type=Base).
 * - Có label (+ description) → Type=Label.
 * - type="drag" → hàng có padding, nền xám khi hover (Type=Drag).
 * Trạng thái: default · hover · focused · disabled · readonly; checked / indeterminate.
 */
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
export class AntCheckboxComponent implements ControlValueAccessor, AfterViewInit {
  @Input() label?: string;
  /** Dòng mô tả phụ dưới label (Support text) */
  @Input() description?: string;
  @Input() type: 'label' | 'drag' = 'label';
  @Input() disabled: boolean = false;
  /** Chỉ hiển thị, không cho đổi (State=Read only) */
  @Input() readonly: boolean = false;
  @Input() indeterminate: boolean = false;

  @Output() checkedChange = new EventEmitter<boolean>();

  checked: boolean = false;

  @ViewChild('labelEl') labelEl?: ElementRef<HTMLElement>;
  /** Có nội dung chiếu vào qua ng-content */
  private hasProjected: boolean = false;

  private onChange: (val: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  /** Không có label/description/nội dung → chỉ hiển thị ô vuông (Type=Base) */
  get hasText(): boolean {
    return !!(this.label || this.description || this.hasProjected);
  }

  ngAfterViewInit(): void {
    const text = (this.labelEl?.nativeElement.textContent || '').trim();
    this.hasProjected = !!text && text !== (this.label || '').trim();
    this.cdr.detectChanges();
  }

  get checkIcon(): string {
    return `${ICON_BASE}/${this.disabled ? 'cb-check-disabled' : 'cb-check'}.svg`;
  }

  get minusIcon(): string {
    if (this.disabled) return `${ICON_BASE}/cb-minus-disabled.svg`;
    if (this.readonly) return `${ICON_BASE}/cb-minus-readonly.svg`;
    return `${ICON_BASE}/cb-minus.svg`;
  }

  readonly minusHoverIcon = `${ICON_BASE}/cb-minus-hover.svg`;

  get interactive(): boolean {
    return !this.disabled && !this.readonly;
  }

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
    const input = event.target as HTMLInputElement;
    if (!this.interactive) {
      input.checked = this.checked;
      return;
    }
    this.checked = input.checked;
    this.onChange(this.checked);
    this.checkedChange.emit(this.checked);
    this.onTouched();
  }
}
