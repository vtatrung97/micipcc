import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-tag',
  templateUrl: './status-tag.component.html',
  styleUrls: ['./status-tag.component.scss']
})
export class StatusTagComponent {
  @Input() status: string = 'active';
  @Input() text?: string;
  @Input() dot: boolean = true;
  @Input() size: 'small' | 'middle' = 'middle';

  get normalizedStatus(): string {
    return (this.status || 'active').toLowerCase().trim();
  }

  get label(): string {
    const s = this.normalizedStatus;
    const map: Record<string, string> = {
      'published': 'Đã xuất bản',
      'active': 'Đang hoạt động',
      'draft': 'Bản nháp',
      'inactive': 'Tạm dừng',
      'running': 'Đang chạy',
      'completed': 'Hoàn thành',
      'overdue': 'Trễ hạn SLA',
      'failed': 'Thất bại',
      'exception': 'Lỗi ngoại lệ',
      'cancelled': 'Đã hủy',
      'archived': 'Lưu trữ'
    };
    return map[s] || this.status;
  }
}
