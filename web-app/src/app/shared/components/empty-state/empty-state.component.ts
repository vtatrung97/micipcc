import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
  @Input() icon: string = 'inbox';
  @Input() title: string = 'Không tìm thấy dữ liệu';
  @Input() description?: string = 'Thử điều chỉnh bộ lọc tìm kiếm hoặc tạo bản ghi mới.';
  @Input() actionText?: string;

  @Output() onAction = new EventEmitter<void>();
}
