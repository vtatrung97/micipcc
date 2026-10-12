import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ElementRef,
  HostListener,
  ChangeDetectorRef,
  ViewChild,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { shouldDropUp } from '../../utils/dropdown-placement';

export interface SelectOption<T = any> {
  value: T;
  label: string;
  icon?: string;
  iconColor?: string;
  dotColor?: string;
  disabled?: boolean;
  badge?: string;
}

@Component({
  selector: 'ant-select',
  templateUrl: './ant-select.component.html',
  styleUrls: ['./ant-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AntSelectComponent),
      multi: true
    }
  ]
})
export class AntSelectComponent implements ControlValueAccessor, OnChanges, OnDestroy {
  @Input() options: (SelectOption | string)[] = [];
  @Input() placeholder: string = 'Vui lòng chọn';
  @Input() allowClear: boolean = false;
  @Input() showSearch: boolean = false;
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() size: 'small' | 'middle' | 'large' = 'middle';
  @Input() prefixIcon?: string;
  /**
   * Dropdown dùng position: fixed theo toạ độ màn hình (không bị cắt khi ô nằm trong vùng cuộn,
   * vd: bảng cuộn ngang trong drawer). Cuộn bất kỳ vùng nào khi đang mở sẽ đóng dropdown.
   */
  @Input() fixedPanel: boolean = false;
  /** Toạ độ dropdown khi `fixedPanel` */
  panelTop: number | null = null;
  panelLeft: number | null = null;
  panelWidth: number | null = null;

  @Output() valueChange = new EventEmitter<any>();

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
  @ViewChild('container') container?: ElementRef<HTMLDivElement>;

  isOpen: boolean = false;
  /** Dropdown mở lên trên khi phía dưới không đủ chỗ (vd: "Số dòng hiển thị" ở đáy trang) */
  dropUp: boolean = false;
  /** Đang đo kích thước dropdown (ẩn tạm để không nhảy vị trí) */
  measuring: boolean = false;

  @ViewChild('dropdown') dropdownRef?: ElementRef<HTMLDivElement>;
  searchQuery: string = '';
  activeHoverIndex: number = -1;

  innerValue: any = null;
  normalizedOptions: SelectOption[] = [];

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef, private elRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.normalizeOptions();
    }
  }

  private normalizeOptions(): void {
    if (!this.options || !Array.isArray(this.options)) {
      this.normalizedOptions = [];
      return;
    }

    this.normalizedOptions = this.options.map(opt => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }

  get filteredOptions(): SelectOption[] {
    if (!this.searchQuery || !this.searchQuery.trim()) {
      return this.normalizedOptions;
    }
    const q = this.searchQuery.toLowerCase().trim();
    return this.normalizedOptions.filter(opt =>
      opt.label.toLowerCase().includes(q) || String(opt.value).toLowerCase().includes(q)
    );
  }

  get selectedOption(): SelectOption | undefined {
    return this.normalizedOptions.find(o => o.value === this.innerValue);
  }

  /** Giữ nguyên DOM option khi mảng `options` được truyền lại (tránh mất click giữa mousedown/mouseup) */
  trackByValue(_: number, option: SelectOption): any {
    return option.value;
  }

  isSelected(option: SelectOption): boolean {
    return option.value === this.innerValue;
  }

  toggleDropdown(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.disabled) return;

    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.dropUp = false;
      this.measuring = true;
      setTimeout(() => this.updateVerticalPlacement());
      this.searchQuery = '';
      this.activeHoverIndex = this.normalizedOptions.findIndex(o => o.value === this.innerValue);
      setTimeout(() => {
        if (this.searchInput) {
          this.searchInput.nativeElement.focus();
        }
      }, 50);
    } else {
      this.onTouched();
    }
    this.cdr.markForCheck();
  }

  /** Đo chiều cao thật của dropdown → thiếu chỗ phía dưới thì mở lên trên */
  private updateVerticalPlacement(): void {
    if (!this.isOpen) return;
    const height = this.dropdownRef?.nativeElement.offsetHeight || 0;
    this.dropUp = shouldDropUp(this.elRef.nativeElement, height);
    if (this.fixedPanel) this.placeFixedPanel(height);
    this.measuring = false;
    this.cdr.markForCheck();
  }

  private placeFixedPanel(height: number): void {
    const rect = (this.elRef.nativeElement as HTMLElement).getBoundingClientRect();
    const gap = 8;
    this.panelWidth = Math.max(rect.width, 160);
    this.panelLeft = Math.max(gap, Math.min(rect.left, window.innerWidth - this.panelWidth - gap));
    this.panelTop = this.dropUp ? Math.max(gap, rect.top - height - gap) : rect.bottom + gap;
    document.addEventListener('scroll', this.onAnyScroll, true);
  }

  private onAnyScroll = (event: Event): void => {
    if (this.dropdownRef?.nativeElement.contains(event.target as Node)) return;
    document.removeEventListener('scroll', this.onAnyScroll, true);
    if (this.isOpen) {
      this.isOpen = false;
      this.cdr.markForCheck();
    }
  };

  ngOnDestroy(): void {
    document.removeEventListener('scroll', this.onAnyScroll, true);
  }

  selectOption(option: SelectOption, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    if (option.disabled) return;

    this.innerValue = option.value;
    this.onChange(this.innerValue);
    this.valueChange.emit(this.innerValue);
    this.isOpen = false;
    this.searchQuery = '';
    this.onTouched();
    this.cdr.markForCheck();
  }

  clearSelection(event: MouseEvent): void {
    event.stopPropagation();
    this.innerValue = '';
    this.onChange(this.innerValue);
    this.valueChange.emit(this.innerValue);
    this.searchQuery = '';
    this.onTouched();
    this.cdr.markForCheck();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.isOpen = false;
      this.cdr.markForCheck();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const list = this.filteredOptions;
      if (list.length > 0) {
        this.activeHoverIndex = (this.activeHoverIndex + 1) % list.length;
        this.cdr.markForCheck();
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const list = this.filteredOptions;
      if (list.length > 0) {
        this.activeHoverIndex = (this.activeHoverIndex - 1 + list.length) % list.length;
        this.cdr.markForCheck();
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const list = this.filteredOptions;
      if (this.activeHoverIndex >= 0 && this.activeHoverIndex < list.length) {
        this.selectOption(list[this.activeHoverIndex]);
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.elRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.searchQuery = '';
      this.onTouched();
      this.cdr.markForCheck();
    }
  }

  // ===== ControlValueAccessor =====
  writeValue(val: any): void {
    this.innerValue = val;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }
}
