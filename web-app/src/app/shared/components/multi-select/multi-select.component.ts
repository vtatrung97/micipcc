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
import { SelectOption } from '../ant-select/ant-select.component';

const ICON_BASE = 'assets/icons/processx';

/**
 * Ô chọn nhiều có checkbox + tìm kiếm + "Chọn tất cả", hiển thị giá trị dạng tag.
 * Theo Figma ProcessX: trường "Agent" / "Output từ biểu mẫu" trong drawer Giao việc.
 * Giá trị ngModel: mảng `value` của các option đã chọn (giữ thứ tự trong `options`).
 */
@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true
    }
  ]
})
export class MultiSelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Chọn tại đây';
  @Input() searchPlaceholder: string = 'Tìm kiếm';
  @Input() showSearch: boolean = true;
  @Input() showSelectAll: boolean = true;
  @Input() selectAllLabel: string = 'Chọn tất cả';
  @Input() emptyText: string = 'Không có dữ liệu';
  /** Số tag tối đa hiển thị trên ô, phần còn lại gộp thành "+N" */
  @Input() maxTagCount: number = 3;
  @Input() disabled: boolean = false;
  @Input() status: 'error' | 'warning' | '' = '';
  /** Kích thước: small 40 · middle 48 (mặc định) · large 56 */
  @Input() size: 'small' | 'middle' | 'large' = 'middle';

  @Output() valueChange = new EventEmitter<any[]>();

  readonly icons = {
    chevron: `${ICON_BASE}/chevron-down.svg`,
    chevronActive: `${ICON_BASE}/chevron-down-active.svg`,
    search: `${ICON_BASE}/search.svg`,
    check: `${ICON_BASE}/check.svg`,
    minus: `${ICON_BASE}/minus.svg`,
    close: `${ICON_BASE}/close.svg`
  };

  isOpen: boolean = false;
  keyword: string = '';
  selectedValues: any[] = [];

  private onChange: (val: any[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elRef: ElementRef) {}

  // ===== Hiển thị =====
  get selectedOptions(): SelectOption[] {
    return this.options.filter(o => this.selectedValues.includes(o.value));
  }

  get visibleTags(): SelectOption[] {
    return this.selectedOptions.slice(0, this.maxTagCount);
  }

  get hiddenTagCount(): number {
    return Math.max(0, this.selectedOptions.length - this.maxTagCount);
  }

  get filteredOptions(): SelectOption[] {
    const kw = this.normalize(this.keyword);
    return kw ? this.options.filter(o => this.normalize(o.label).includes(kw)) : this.options;
  }

  /** Các option trong kết quả lọc mà người dùng được phép tick */
  private get selectableFiltered(): SelectOption[] {
    return this.filteredOptions.filter(o => !o.disabled);
  }

  get allChecked(): boolean {
    const list = this.selectableFiltered;
    return list.length > 0 && list.every(o => this.isSelected(o));
  }

  get someChecked(): boolean {
    return !this.allChecked && this.selectableFiltered.some(o => this.isSelected(o));
  }

  isSelected(option: SelectOption): boolean {
    return this.selectedValues.includes(option.value);
  }

  // ===== ControlValueAccessor =====
  writeValue(val: any[] | null): void {
    this.selectedValues = Array.isArray(val) ? [...val] : [];
  }

  registerOnChange(fn: (val: any[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) this.isOpen = false;
  }

  // ===== Tương tác =====
  togglePanel(): void {
    if (this.disabled) return;
    this.isOpen ? this.close() : (this.isOpen = true);
  }

  toggleOption(option: SelectOption): void {
    if (option.disabled) return;
    const next = this.isSelected(option)
      ? this.selectedValues.filter(v => v !== option.value)
      : [...this.selectedValues, option.value];
    this.commit(next);
  }

  toggleAll(): void {
    const targets = this.selectableFiltered.map(o => o.value);
    const next = this.allChecked
      ? this.selectedValues.filter(v => !targets.includes(v))
      : [...this.selectedValues, ...targets.filter(v => !this.selectedValues.includes(v))];
    this.commit(next);
  }

  removeTag(option: SelectOption, event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled) return;
    this.commit(this.selectedValues.filter(v => v !== option.value));
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
    this.keyword = '';
    this.onTouched();
  }

  private commit(next: any[]): void {
    // Giữ thứ tự theo danh sách options để tag hiển thị ổn định
    this.selectedValues = this.options.map(o => o.value).filter(v => next.includes(v));
    this.onChange([...this.selectedValues]);
    this.valueChange.emit([...this.selectedValues]);
  }

  /** Tìm kiếm không phân biệt hoa thường và dấu tiếng Việt */
  private normalize(text: string): string {
    return (text || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
  }
}
