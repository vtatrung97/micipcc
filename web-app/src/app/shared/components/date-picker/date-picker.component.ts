import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  HostListener,
  ElementRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Một ô ngày trên lưới lịch */
interface CalendarCell {
  iso: string;          // YYYY-MM-DD
  day: number;
  inMonth: boolean;     // false = ngày của tháng trước/sau (leading/trailing)
  isToday: boolean;
}

type RangePreset = 'today' | '7days' | '30days' | 'thisMonth';

const ICON_BASE = 'assets/icons/processx';

/**
 * Chọn ngày theo Figma ProcessX "Date pickers / Date single".
 * - Một ngày: ngModel = 'YYYY-MM-DD'.
 * - Khoảng ngày (isRange): ngModel = { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }; bấm ngày bắt đầu rồi ngày kết thúc.
 */
@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ]
})
export class DatePickerComponent implements ControlValueAccessor {
  @Input() isRange: boolean = false;
  @Input() placeholder?: string;
  @Input() startPlaceholder?: string;
  @Input() endPlaceholder?: string;
  @Input() disabled: boolean = false;
  @Input() allowClear: boolean = true;
  @Input() status: 'error' | 'warning' | '' = '';
  /** Kích thước: small 40 · middle 48 (mặc định) · large 56 */
  @Input() size: 'small' | 'middle' | 'large' = 'middle';

  @Output() dateChange = new EventEmitter<any>();

  readonly icons = {
    calendar: `${ICON_BASE}/calendar.svg`,
    prev: `${ICON_BASE}/arrow-left.svg`,
    next: `${ICON_BASE}/arrow-right.svg`
  };
  readonly weekdays: string[] = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  readonly presets: { key: RangePreset; label: string }[] = [
    { key: 'today', label: 'Hôm nay' },
    { key: '7days', label: '7 ngày qua' },
    { key: '30days', label: '30 ngày qua' },
    { key: 'thisMonth', label: 'Tháng này' }
  ];

  isOpen: boolean = false;
  rawStart: string = '';
  rawEnd: string = '';
  /** Ô nhập ngày trong popup (DD/MM/YYYY) */
  typedDate: string = '';

  viewYear: number = new Date().getFullYear();
  viewMonth: number = new Date().getMonth(); // 0-11
  cells: CalendarCell[] = [];

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elRef: ElementRef) {
    this.buildCells();
  }

  // ===== Hiển thị =====
  get hasValue(): boolean {
    return !!(this.rawStart || this.rawEnd);
  }

  get displaySingle(): string {
    return this.formatDisplay(this.rawStart);
  }

  get displayStart(): string {
    return this.formatDisplay(this.rawStart);
  }

  get displayEnd(): string {
    return this.formatDisplay(this.rawEnd);
  }

  get monthTitle(): string {
    return `Tháng ${this.viewMonth + 1}/${this.viewYear}`;
  }

  isSelected(cell: CalendarCell): boolean {
    return cell.iso === this.rawStart || (this.isRange && cell.iso === this.rawEnd);
  }

  isInRange(cell: CalendarCell): boolean {
    return this.isRange && !!this.rawStart && !!this.rawEnd && cell.iso > this.rawStart && cell.iso < this.rawEnd;
  }

  // ===== ControlValueAccessor =====
  writeValue(val: any): void {
    if (!val) {
      this.rawStart = '';
      this.rawEnd = '';
    } else if (typeof val === 'string') {
      this.rawStart = val;
      this.rawEnd = '';
    } else if (typeof val === 'object') {
      this.rawStart = val.from || val.start || '';
      this.rawEnd = val.to || val.end || '';
    }
    this.syncTypedDate();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) this.isOpen = false;
  }

  // ===== Mở / đóng =====
  togglePicker(): void {
    if (this.disabled) return;
    if (this.isOpen) {
      this.close();
      return;
    }
    const anchor = this.parseIso(this.rawStart) || new Date();
    this.viewYear = anchor.getFullYear();
    this.viewMonth = anchor.getMonth();
    this.buildCells();
    this.syncTypedDate();
    this.isOpen = true;
  }

  // ===== Điều hướng tháng =====
  shiftMonth(delta: number): void {
    const d = new Date(this.viewYear, this.viewMonth + delta, 1);
    this.viewYear = d.getFullYear();
    this.viewMonth = d.getMonth();
    this.buildCells();
  }

  // ===== Chọn ngày =====
  selectCell(cell: CalendarCell): void {
    if (!cell.inMonth) {
      const d = this.parseIso(cell.iso) as Date;
      this.viewYear = d.getFullYear();
      this.viewMonth = d.getMonth();
      this.buildCells();
    }
    this.pickDate(cell.iso);
  }

  selectToday(): void {
    const today = this.toIso(new Date());
    if (this.isRange) {
      this.rawStart = today;
      this.rawEnd = today;
      this.applySelection();
    } else {
      this.pickDate(today);
    }
  }

  /** Người dùng gõ ngày DD/MM/YYYY vào ô trong popup */
  commitTypedDate(): void {
    const iso = this.parseDisplay(this.typedDate);
    if (!iso) {
      this.syncTypedDate();
      return;
    }
    const d = this.parseIso(iso) as Date;
    this.viewYear = d.getFullYear();
    this.viewMonth = d.getMonth();
    this.buildCells();
    this.pickDate(iso);
  }

  selectPreset(preset: RangePreset): void {
    const today = new Date();
    let from = new Date(today);
    if (preset === '7days') {
      from.setDate(today.getDate() - 7);
    } else if (preset === '30days') {
      from.setDate(today.getDate() - 30);
    } else if (preset === 'thisMonth') {
      from = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    this.rawStart = this.toIso(from);
    this.rawEnd = this.toIso(today);
    this.applySelection();
  }

  applySelection(): void {
    this.isOpen = false;
    this.syncTypedDate();
    this.emit();
    this.onTouched();
  }

  clearValue(event: MouseEvent): void {
    event.stopPropagation();
    this.rawStart = '';
    this.rawEnd = '';
    this.syncTypedDate();
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

  // ===== Nội bộ =====
  private pickDate(iso: string): void {
    if (!this.isRange) {
      this.rawStart = iso;
      this.applySelection();
      return;
    }
    // Khoảng ngày: lần 1 chọn ngày bắt đầu, lần 2 chọn ngày kết thúc
    if (!this.rawStart || this.rawEnd) {
      this.rawStart = iso;
      this.rawEnd = '';
      this.syncTypedDate();
    } else {
      if (iso < this.rawStart) {
        this.rawEnd = this.rawStart;
        this.rawStart = iso;
      } else {
        this.rawEnd = iso;
      }
      this.applySelection();
    }
  }

  private close(): void {
    // Khoảng ngày mới chọn 1 đầu mà đóng → coi như chọn 1 ngày
    if (this.isRange && this.rawStart && !this.rawEnd) {
      this.rawEnd = this.rawStart;
      this.emit();
    }
    this.isOpen = false;
    this.onTouched();
  }

  private emit(): void {
    const value = this.isRange ? { from: this.rawStart, to: this.rawEnd } : this.rawStart;
    this.onChange(value);
    this.dateChange.emit(value);
  }

  private syncTypedDate(): void {
    this.typedDate = this.isRange
      ? [this.displayStart, this.displayEnd].filter(Boolean).join(' - ')
      : this.displaySingle;
  }

  /** Lưới bắt đầu từ Thứ 2, gồm ngày cuối tháng trước và đầu tháng sau cho đủ tuần */
  private buildCells(): void {
    const first = new Date(this.viewYear, this.viewMonth, 1);
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const leading = (first.getDay() + 6) % 7; // T2 = 0
    const total = Math.ceil((leading + daysInMonth) / 7) * 7;
    const todayIso = this.toIso(new Date());

    this.cells = Array.from({ length: total }, (_, i) => {
      const d = new Date(this.viewYear, this.viewMonth, i - leading + 1);
      const iso = this.toIso(d);
      return {
        iso,
        day: d.getDate(),
        inMonth: d.getMonth() === this.viewMonth,
        isToday: iso === todayIso
      };
    });
  }

  private toIso(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  private parseIso(iso: string): Date | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }

  /** DD/MM/YYYY → YYYY-MM-DD (null nếu không hợp lệ) */
  private parseDisplay(text: string): string | null {
    const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((text || '').trim());
    if (!m) return null;
    const d = new Date(+m[3], +m[2] - 1, +m[1]);
    if (d.getDate() !== +m[1] || d.getMonth() !== +m[2] - 1) return null;
    return this.toIso(d);
  }

  private formatDisplay(isoDate: string): string {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : isoDate;
  }
}
