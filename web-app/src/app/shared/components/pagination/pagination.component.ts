import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { SelectOption } from '../ant-select/ant-select.component';

const ICON_BASE = 'assets/icons/processx';

/** Một ô trên dãy số trang: `page = null` là dấu "..." */
interface PageItem {
  key: string;
  page: number | null;
}

/**
 * Phân trang. Trái: "Số dòng hiển thị" + dropdown, "1 - 10 / 1080 kết quả"; phải: ‹ 1 2 3 … 88 89 90 ›
 */
@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnChanges {
  @Input() total: number = 0;
  @Input() page: number = 1;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100];
  @Input() showSizeChanger: boolean = true;
  @Input() showTotal: boolean = true;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  public items: PageItem[] = [];
  public sizeOptions: SelectOption<number>[] = [];

  public readonly icons = {
    prev: `${ICON_BASE}/arrow-left.svg`,
    prevDisabled: `${ICON_BASE}/arrow-left-disabled.svg`,
    next: `${ICON_BASE}/arrow-right.svg`,
    nextDisabled: `${ICON_BASE}/arrow-right-disabled.svg`
  };

  ngOnChanges(): void {
    this.sizeOptions = this.pageSizeOptions.map(size => ({ value: size, label: String(size) }));
    this.buildItems();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / (this.pageSize || 10)));
  }

  /** Bản ghi đầu / cuối của trang hiện tại: "1 - 10" */
  get rangeStart(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  get isFirst(): boolean {
    return this.page <= 1;
  }

  get isLast(): boolean {
    return this.page >= this.totalPages;
  }

  /**
   * Dãy số trang: ≤ 7 trang hiện hết; trang hiện tại ở 3 trang đầu / cuối: 1 2 3 … n-2 n-1 n;
   * ở giữa: 1 … p-1 p p+1 … n. Khoảng trống chỉ thiếu đúng 1 số thì hiện số đó thay cho "…".
   */
  private buildItems(): void {
    const total = this.totalPages;
    const current = Math.min(Math.max(this.page, 1), total);
    const pages = new Set<number>();

    if (total <= 7) {
      for (let p = 1; p <= total; p++) pages.add(p);
    } else {
      [1, total, current - 1, current, current + 1].forEach(p => pages.add(p));
      if (current <= 3 || current >= total - 2) {
        [1, 2, 3, total - 2, total - 1, total].forEach(p => pages.add(p));
      }
    }

    const sorted = Array.from(pages).filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
    const items: PageItem[] = [];
    sorted.forEach((p, i) => {
      const prev = sorted[i - 1];
      if (prev !== undefined && p - prev === 2) {
        items.push({ key: `p${prev + 1}`, page: prev + 1 });
      } else if (prev !== undefined && p - prev > 2) {
        items.push({ key: `gap${prev}`, page: null });
      }
      items.push({ key: `p${p}`, page: p });
    });
    this.items = items;
  }

  goToPage(p: number | null): void {
    if (p === null || p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.buildItems();
    this.pageChange.emit(this.page);
  }

  onPageSizeChange(size: number): void {
    if (!size || size === this.pageSize) return;
    this.pageSize = Number(size);
    this.page = 1;
    this.buildItems();
    this.pageSizeChange.emit(this.pageSize);
    this.pageChange.emit(this.page);
  }

  trackByKey(_: number, item: PageItem): string {
    return item.key;
  }
}
