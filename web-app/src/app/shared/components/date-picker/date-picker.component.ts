import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  HostListener,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { shouldDropUp } from '../../utils/dropdown-placement';

/** Một ô ngày trên lưới lịch */
interface CalendarCell {
  iso: string;          // YYYY-MM-DD
  day: number;
  inMonth: boolean;     // false = ngày của tháng trước/sau (leading/trailing)
  isToday: boolean;
}

/** Một lịch tháng trong popup (single: 1 lịch; range: lịch "Ngày bắt đầu" + "Ngày kết thúc") */
interface CalendarPane {
  year: number;
  month: number;        // 0-11
  cells: CalendarCell[];
  typed: string;        // ô nhập DD/MM/YYYY phía trên lịch
}

type PaneKey = 'start' | 'end';

const ICON_BASE = 'assets/icons/processx';
/** Rộng popup khoảng ngày: 16 + 280 + 24 + 280 + 16 (Figma "_Date pickers" range) */
const RANGE_PANEL_WIDTH = 616;
const SINGLE_PANEL_WIDTH = 312;

/**
 * Chọn ngày theo Figma ProcessX.
 * - Một ngày ("Date single", 71:10555): ngModel = 'YYYY-MM-DD'; bấm ngày là chọn luôn.
 * - Khoảng ngày (isRange, "_Date pickers" 293:66499): ngModel = { from, to } (YYYY-MM-DD);
 *   2 lịch độc lập "Ngày bắt đầu" / "Ngày kết thúc", chỉ áp dụng khi bấm "Chọn".
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
export class DatePickerComponent implements ControlValueAccessor, OnDestroy {
  @Input() isRange: boolean = false;
  @Input() placeholder?: string;
  @Input() startPlaceholder?: string;
  @Input() endPlaceholder?: string;
  @Input() disabled: boolean = false;
  @Input() allowClear: boolean = true;
  @Input() status: 'error' | 'warning' | '' = '';
  /** Kích thước: small 40 · middle 48 (mặc định) · large 56 */
  @Input() size: 'small' | 'middle' | 'large' = 'middle';
  /**
   * Popup dùng position: fixed theo toạ độ màn hình thay vì absolute theo ô.
   * Bật khi ô nằm trong vùng cuộn hẹp (vd: drawer) để popup khoảng ngày 616px không bị cắt.
   * Cuộn bất kỳ vùng nào khi đang mở sẽ đóng popup.
   */
  @Input() fixedPanel: boolean = false;

  @Output() dateChange = new EventEmitter<any>();

  readonly icons = {
    calendar: `${ICON_BASE}/calendar.svg`,
    prev: `${ICON_BASE}/arrow-left.svg`,
    next: `${ICON_BASE}/arrow-right.svg`,
    dot: `${ICON_BASE}/dot.svg`
  };
  readonly weekdays: string[] = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  readonly paneKeys: PaneKey[] = ['start', 'end'];

  isOpen: boolean = false;
  /** Popup căn mép phải ô khi bên phải không đủ chỗ */
  alignRight: boolean = false;
  /** Popup mở lên trên khi phía dưới ô không đủ chỗ trong màn hình */
  dropUp: boolean = false;
  /** Đang đo kích thước popup (ẩn tạm để không nhảy vị trí) */
  measuring: boolean = false;
  /** Toạ độ popup khi `fixedPanel` */
  panelTop: number | null = null;
  panelLeft: number | null = null;

  @ViewChild('panel') panelRef?: ElementRef<HTMLDivElement>;

  /** Giá trị đã áp dụng (ngModel) */
  rawStart: string = '';
  rawEnd: string = '';

  /** Bản nháp trong popup khoảng ngày, chỉ ghi vào raw* khi bấm "Chọn" */
  draftStart: string = '';
  draftEnd: string = '';

  panes: Record<PaneKey, CalendarPane> = {
    start: this.createPane(new Date()),
    end: this.createPane(new Date())
  };

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elRef: ElementRef) {}

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

  /** Dòng tóm tắt ở "Bar action": 22/10/2024 → 22/11/2024 */
  get draftSummary(): string {
    const empty = 'DD/MM/YYYY';
    return `${this.formatDisplay(this.draftStart) || empty} → ${this.formatDisplay(this.draftEnd) || empty}`;
  }

  get canApply(): boolean {
    return !!this.draftStart && !!this.draftEnd;
  }

  pane(key: PaneKey): CalendarPane {
    return this.panes[key];
  }

  monthTitle(key: PaneKey): string {
    const pane = this.panes[key];
    return `Tháng ${pane.month + 1}/${pane.year}`;
  }

  /** Ngày đang chọn của lịch: single → rawStart; range → bản nháp của lịch đó */
  private selectedOf(key: PaneKey): string {
    if (!this.isRange) return this.rawStart;
    return key === 'start' ? this.draftStart : this.draftEnd;
  }

  isSelected(key: PaneKey, cell: CalendarCell): boolean {
    return cell.iso === this.selectedOf(key);
  }

  /** Range: lịch bắt đầu khoá ngày sau ngày kết thúc, lịch kết thúc khoá ngày trước ngày bắt đầu */
  isDisabled(key: PaneKey, cell: CalendarCell): boolean {
    if (!this.isRange) return false;
    if (key === 'start') return !!this.draftEnd && cell.iso > this.draftEnd;
    return !!this.draftStart && cell.iso < this.draftStart;
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

    if (this.isRange) {
      this.draftStart = this.rawStart;
      this.draftEnd = this.rawEnd;
      const startAnchor = this.parseIso(this.draftStart) || new Date();
      const endAnchor = this.parseIso(this.draftEnd)
        || new Date(startAnchor.getFullYear(), startAnchor.getMonth() + 1, 1);
      this.panes.start = this.createPane(startAnchor, this.draftStart);
      this.panes.end = this.createPane(endAnchor, this.draftEnd);
    } else {
      this.panes.start = this.createPane(this.parseIso(this.rawStart) || new Date(), this.rawStart);
    }

    const rect = this.elRef.nativeElement.getBoundingClientRect();
    const panelWidth = this.isRange ? RANGE_PANEL_WIDTH : SINGLE_PANEL_WIDTH;
    this.alignRight = rect.left + panelWidth > window.innerWidth - 8 && rect.right - panelWidth >= 0;
    this.isOpen = true;
    this.dropUp = false;
    this.measuring = true;
    // Đợi popup render để đo chiều cao thật rồi quyết định mở lên / xuống
    setTimeout(() => this.updateVerticalPlacement());
  }

  /** Phía dưới không đủ chỗ mà phía trên rộng hơn → mở popup lên trên ô */
  private updateVerticalPlacement(): void {
    if (!this.isOpen) return;
    this.dropUp = shouldDropUp(this.elRef.nativeElement, this.panelRef?.nativeElement.offsetHeight || 0);
    if (this.fixedPanel) this.placeFixedPanel();
    this.measuring = false;
  }

  /** Đặt popup fixed: dưới/trên ô cách 8px, căn trái theo ô (hoặc mép phải), luôn nằm trong màn hình */
  private placeFixedPanel(): void {
    const panel = this.panelRef?.nativeElement;
    if (!panel) return;
    const rect = this.elRef.nativeElement.getBoundingClientRect();
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const margin = 8;

    const left = this.alignRight ? rect.right - width : rect.left;
    this.panelLeft = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
    this.panelTop = this.dropUp ? Math.max(margin, rect.top - height - margin) : rect.bottom + margin;

    document.addEventListener('scroll', this.onAnyScroll, true);
  }

  private onAnyScroll = (event: Event): void => {
    if (this.panelRef?.nativeElement.contains(event.target as Node)) return;
    document.removeEventListener('scroll', this.onAnyScroll, true);
    if (this.isOpen) this.close();
  };

  ngOnDestroy(): void {
    document.removeEventListener('scroll', this.onAnyScroll, true);
  }

  // ===== Điều hướng tháng =====
  shiftMonth(key: PaneKey, delta: number): void {
    const pane = this.panes[key];
    this.panes[key] = this.createPane(new Date(pane.year, pane.month + delta, 1), pane.typed, true);
  }

  // ===== Chọn ngày =====
  selectCell(key: PaneKey, cell: CalendarCell): void {
    if (this.isDisabled(key, cell)) return;
    if (!cell.inMonth) {
      this.panes[key] = this.createPane(this.parseIso(cell.iso) as Date, this.panes[key].typed, true);
    }
    this.pickDate(key, cell.iso);
  }

  selectToday(): void {
    this.pickDate('start', this.toIso(new Date()));
  }

  /** Người dùng gõ ngày DD/MM/YYYY vào ô phía trên lịch */
  commitTypedDate(key: PaneKey): void {
    const pane = this.panes[key];
    const iso = this.parseDisplay(pane.typed);
    if (!iso || (this.isRange && this.isDisabledIso(key, iso))) {
      pane.typed = this.formatDisplay(this.selectedOf(key));
      return;
    }
    this.panes[key] = this.createPane(this.parseIso(iso) as Date, pane.typed);
    this.pickDate(key, iso);
  }

  /** "Đặt lại" trong popup khoảng ngày: xoá bản nháp */
  resetDraft(): void {
    this.draftStart = '';
    this.draftEnd = '';
    this.panes.start.typed = '';
    this.panes.end.typed = '';
  }

  /** "Chọn": áp dụng bản nháp */
  applyRange(): void {
    if (!this.canApply) return;
    this.rawStart = this.draftStart;
    this.rawEnd = this.draftEnd;
    this.emit();
    this.isOpen = false;
    this.onTouched();
  }

  clearValue(event: MouseEvent): void {
    event.stopPropagation();
    this.rawStart = '';
    this.rawEnd = '';
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
  private pickDate(key: PaneKey, iso: string): void {
    if (!this.isRange) {
      this.rawStart = iso;
      this.emit();
      this.isOpen = false;
      this.onTouched();
      return;
    }
    if (key === 'start') {
      this.draftStart = iso;
    } else {
      this.draftEnd = iso;
    }
    this.panes[key].typed = this.formatDisplay(iso);
  }

  private isDisabledIso(key: PaneKey, iso: string): boolean {
    return this.isDisabled(key, { iso, day: 0, inMonth: true, isToday: false });
  }

  /** Đóng không qua "Chọn" → bỏ bản nháp (range) */
  private close(): void {
    this.isOpen = false;
    this.onTouched();
  }

  private emit(): void {
    const value = this.isRange ? { from: this.rawStart, to: this.rawEnd } : this.rawStart;
    this.onChange(value);
    this.dateChange.emit(value);
  }

  /**
   * Tạo lịch cho tháng chứa `anchor`.
   * Lưới bắt đầu từ Thứ 2, gồm ngày cuối tháng trước và đầu tháng sau cho đủ tuần.
   */
  private createPane(anchor: Date, selectedOrTyped: string = '', keepTyped: boolean = false): CalendarPane {
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leading = (first.getDay() + 6) % 7; // T2 = 0
    const total = Math.ceil((leading + daysInMonth) / 7) * 7;
    const todayIso = this.toIso(new Date());

    const cells = Array.from({ length: total }, (_, i) => {
      const d = new Date(year, month, i - leading + 1);
      const iso = this.toIso(d);
      return { iso, day: d.getDate(), inMonth: d.getMonth() === month, isToday: iso === todayIso };
    });

    const typed = keepTyped ? selectedOrTyped : this.formatDisplay(selectedOrTyped) || selectedOrTyped;
    return { year, month, cells, typed };
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
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return '';
    const parts = isoDate.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
}
