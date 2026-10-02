import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  @Input() loading: boolean = false;
  @Input() loadingTip: string = 'Đang tải dữ liệu từ máy chủ...';
  @Input() loadingType: 'spinner' | 'dots' | 'skeleton' = 'spinner';
  @Input() loadingColor: string = '#1677ff';
  @Input() total: number = 0;
  @Input() page: number = 1;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100];
  @Input() showPagination: boolean = true;
  @Input() skeletonRows: number = 4;
  @Input() emptyTitle?: string;
  @Input() emptyDescription?: string;

  @Output() onPageChange = new EventEmitter<number>();
  @Output() onPageSizeChange = new EventEmitter<number>();
}
