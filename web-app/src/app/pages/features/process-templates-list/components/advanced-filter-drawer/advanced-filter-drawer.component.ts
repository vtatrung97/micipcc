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
  version: string;
  status: '' | ProcessStatus;
  updatedRange: DateRange | null;
  publishedRange: DateRange | null;
}

export const EMPTY_ADVANCED_FILTER: ProcessAdvancedFilter = {
  name: '',
  code: '',
  version: '',
  status: '',
  updatedRange: null,
  publishedRange: null
};

export function hasDateRange(range: DateRange | null | undefined): boolean {
  return !!(range && (range.from || range.to));
}

/** Số điều kiện đang bật (để hiện badge trên nút mở bộ lọc) */
export function countAdvancedFilter(filter: ProcessAdvancedFilter): number {
  const texts = [filter.name, filter.code, filter.version, filter.status].filter(v => !!String(v || '').trim()).length;
  const ranges = [filter.updatedRange, filter.publishedRange].filter(hasDateRange).length;
  return texts + ranges;
}

/**
 * Drawer "Bộ lọc nâng cao" mở từ bên phải (Figma ProcessX node 364:23413).
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
  /** Danh sách phiên bản đang tồn tại thực tế */
  @Input() versionOptions: SelectOption[] = [];

  @Output() apply = new EventEmitter<ProcessAdvancedFilter>();
  @Output() closed = new EventEmitter<void>();

  draft: ProcessAdvancedFilter = { ...EMPTY_ADVANCED_FILTER };

  readonly statusOptions: SelectOption[] = [
    { value: '', label: 'Tất cả' },
    ...PROCESS_STATUS_ORDER.map(s => ({ value: s, label: PROCESS_STATUS_CONFIG[s].filterLabel }))
  ];

  ngOnChanges(changes: SimpleChanges): void {
    // Mỗi lần mở drawer: nạp lại bản nháp từ bộ lọc đang áp dụng
    if (changes['visible'] && this.visible) {
      this.draft = { ...EMPTY_ADVANCED_FILTER, ...this.value };
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
