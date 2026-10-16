import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ProcessRow } from '../../models/process-row.model';

export type ProcessAction = 'stop' | 'publish' | 'delete';

interface ProcessActionText {
  icon: string;
  title: string;
  message: string;
  confirm: string;
}

const ICON_BASE = 'assets/icons/processx';

/** Nội dung cố định theo thao tác, không phụ thuộc số quy trình được chọn */
const ACTION_TEXT: Record<ProcessAction, ProcessActionText> = {
  publish: {
    icon: `${ICON_BASE}/dialog-publish.svg`,
    title: 'Ban hành!',
    message: 'Bạn có chắc chắn muốn ban hành quy trình này? Quy trình sẽ được kích hoạt để sử dụng.',
    confirm: 'Xác nhận',
  },
  stop: {
    icon: `${ICON_BASE}/dialog-stop.svg`,
    title: 'Dừng ban hành!',
    message: 'Bạn có chắc chắn muốn dừng ban hành quy trình này? Quy trình sẽ không thể khởi tạo phiên thực thi mới.',
    confirm: 'Xác nhận',
  },
  delete: {
    icon: `${ICON_BASE}/dialog-delete.svg`,
    title: 'Xóa quy trình!',
    message: 'Bạn có chắc chắn muốn xóa quy trình này không?',
    confirm: 'Xóa',
  },
};

/**
 * Popup xác nhận thao tác trên quy trình (ban hành, dừng ban hành, xóa).
 * Một hay nhiều quy trình đều dùng chung một giao diện: icon · tiêu đề · câu xác nhận · Hủy / Xác nhận.
 */
@Component({
  selector: 'app-process-action-modal',
  templateUrl: './process-action-modal.component.html',
  styleUrls: ['./process-action-modal.component.scss']
})
export class ProcessActionModalComponent {
  /** null = đóng */
  @Input() action: ProcessAction | null = null;
  @Input() processes: ProcessRow[] = [];

  @Output() confirmed = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  get visible(): boolean {
    return !!this.action && this.processes.length > 0;
  }

  get text(): ProcessActionText {
    return ACTION_TEXT[this.action || 'publish'];
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible) this.closed.emit();
  }
}
