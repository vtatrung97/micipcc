import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import { PROCESS_STATUS_CONFIG, PROCESS_STATUS_ORDER, ProcessStatus } from '../../config/process-status.config';

/** Khoảng ngày của app-date-picker isRange (YYYY-MM-DD, rỗng = không giới hạn đầu đó) */
export interface DateRange {
  from: string;
  to: string;
}

/** Điều kiện của bộ lọc nâng cao danh sách quy trình */
export interface ProcessAdvancedFilter {
  name: string;
  code: string;
  /** Nhóm quy trình */
  category: string;
  status: '' | ProcessStatus;
  triggerType: string;
  createdBy: string;
  createdRange: DateRange | null;
  updatedBy: string;
  updatedRange: DateRange | null;
  publishedRange: DateRange | null;
}

export const EMPTY_ADVANCED_FILTER: ProcessAdvancedFilter = {
  name: '',
  code: '',
  category: '',
  status: '',
  triggerType: '',
  createdBy: '',
  createdRange: null,
  updatedBy: '',
  updatedRange: null,
  publishedRange: null
};

/** Danh sách lựa chọn của các ô chọn trong bộ lọc (dựng từ dữ liệu ở màn danh sách) */
export interface AdvancedFilterOptions {
  categories: SelectOption[];
  triggers: SelectOption[];
  creators: SelectOption[];
  updaters: SelectOption[];
}

function toIsoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function hasDateRange(range: DateRange | null | undefined): boolean {
  return !!(range && (range.from || range.to));
}

/** Số điều kiện đang bật (để hiện badge trên nút mở bộ lọc) */
export function countAdvancedFilter(filter: ProcessAdvancedFilter): number {
  const texts = [filter.name, filter.code, filter.category, filter.status, filter.triggerType, filter.createdBy, filter.updatedBy]
    .filter(v => !!String(v || '').trim()).length;
  const ranges = [filter.createdRange, filter.updatedRange, filter.publishedRange].filter(hasDateRange).length;
  return texts + ranges;
}

/**
 * Drawer "Bộ lọc nâng cao" mở từ bên phải.
 * Chỉnh trên bản nháp; chỉ phát `apply` khi bấm "Áp dụng".
 */
@Component({
  selector: 'app-advanced-filter-drawer',
  templateUrl: './advanced-filter-drawer.component.html',
  styleUrls: ['./advanced-filter-drawer.component.scss']
})
export class AdvancedFilterDrawerComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() value: ProcessAdvancedFilter = { ...EMPTY_ADVANCED_FILTER };
  @Input() options: AdvancedFilterOptions = { categories: [], triggers: [], creators: [], updaters: [] };

  @Output() apply = new EventEmitter<ProcessAdvancedFilter>();
  @Output() closed = new EventEmitter<void>();

  draft: ProcessAdvancedFilter = { ...EMPTY_ADVANCED_FILTER };

  readonly maxLength = 255;
  /** Hôm nay (YYYY-MM-DD): các khoảng ngày không cho chọn ngày tương lai */
  today: string = toIsoDate(new Date());

  readonly statusOptions: SelectOption[] = PROCESS_STATUS_ORDER.map(s => ({ value: s, label: PROCESS_STATUS_CONFIG[s].label }));

  ngOnChanges(changes: SimpleChanges): void {
    // Mỗi lần mở drawer: nạp lại bản nháp từ bộ lọc đang áp dụng
    if (changes['visible'] && this.visible) {
      this.draft = { ...EMPTY_ADVANCED_FILTER, ...this.value };
      this.today = toIsoDate(new Date());
    }
  }

  reset(): void {
    this.draft = { ...EMPTY_ADVANCED_FILTER };
  }

  submit(): void {
    this.apply.emit({
      ...this.draft,
      name: this.draft.name.trim(),
      code: this.draft.code.trim()
    });
  }

  cancel(): void {
    this.closed.emit();
  }
}
