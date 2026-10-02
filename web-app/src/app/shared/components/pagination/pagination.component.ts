import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

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

  pages: number[] = [];

  ngOnChanges(): void {
    this.calculatePages();
  }

  get totalPages(): number {
    return Math.ceil(this.total / (this.pageSize || 10)) || 1;
  }

  calculatePages(): void {
    const total = this.totalPages;
    const current = this.page;
    const pages: number[] = [];

    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);

    if (current <= 3) {
      end = Math.min(total, 5);
    }
    if (current >= total - 2) {
      start = Math.max(1, total - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    this.pages = pages;
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.calculatePages();
    this.pageChange.emit(this.page);
  }

  onPageSizeChange(event: Event): void {
    const newSize = Number((event.target as HTMLSelectElement).value);
    this.pageSize = newSize;
    this.page = 1;
    this.calculatePages();
    this.pageSizeChange.emit(this.pageSize);
    this.pageChange.emit(this.page);
  }
}
