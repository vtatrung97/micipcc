import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';

/** Điều kiện của bộ lọc nâng cao danh sách quy trình */
export interface ProcessAdvancedFilter {
  name: string;
  code: string;
  version: string;
  status: '' | 'Published' | 'Inactive' | 'Draft';
  draft: '' | 'yes' | 'no';
  operation: '' | 'issue';
  updatedDate: string;   // YYYY-MM-DD
  publishedDate: string; // YYYY-MM-DD
}

export const EMPTY_ADVANCED_FILTER: ProcessAdvancedFilter = {
  name: '',
  code: '',
  version: '',
  status: '',
  draft: '',
  operation: '',
  updatedDate: '',
  publishedDate: ''
};

/** Số điều kiện đang bật (để hiện badge trên nút mở bộ lọc) */
export function countAdvancedFilter(filter: ProcessAdvancedFilter): number {
  return (Object.keys(EMPTY_ADVANCED_FILTER) as (keyof ProcessAdvancedFilter)[])
    .filter(key => !!String(filter[key] ?? '').trim()).length;
}

/**
 * Drawer "Bộ lọc nâng cao" (Figma ProcessX node 71:11833).
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
    { value: 'Published', label: 'Đang hiệu lực' },
    { value: 'Inactive', label: 'Tạm dừng' },
    { value: 'Draft', label: 'Chưa ban hành' }
  ];

  readonly draftOptions: SelectOption[] = [
    { value: '', label: 'Tất cả' },
    { value: 'yes', label: 'Có' },
    { value: 'no', label: 'Không có' }
  ];

  readonly operationOptions: SelectOption[] = [
    { value: '', label: 'Tất cả' },
    { value: 'issue', label: 'Có hồ sơ quá hạn / thất bại' }
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
