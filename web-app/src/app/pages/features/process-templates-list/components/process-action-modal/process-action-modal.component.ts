import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProcessRow } from '../../models/process-row.model';

export type ProcessAction = 'clone' | 'stop' | 'publish' | 'delete';

interface ProcessActionText {
  title: string;
  /** Câu mô tả khi 1 quy trình: `before` + <b>tên</b> + `after` */
  before: string;
  after: string;
  /** Câu mô tả khi nhiều quy trình */
  bulk: string;
  /** Tiêu đề danh sách khi nhiều quy trình */
  listLabel: string;
  confirm: string;
  /** Màu nút xác nhận */
  tone: 'primary' | 'danger';
  /** Danh sách khi nhiều quy trình: 'cards' = mỗi quy trình một khung riêng cách 8, 'grouped' = chung một khung, ngăn bằng viền */
  bulkLayout: 'cards' | 'grouped';
}

const ACTION_TEXT: Record<ProcessAction, ProcessActionText> = {
  clone: {
    title: 'Nhân bản quy trình?',
    before: 'Tạo bản sao từ quy trình ',
    after: '. Toàn bộ cấu hình các bước sẽ được sao chép sang quy trình mới.',
    bulk: 'Tạo bản sao từ các quy trình dưới đây. Toàn bộ cấu hình các bước sẽ được sao chép sang quy trình mới.',
    listLabel: 'Sẽ nhân bản',
    confirm: 'Nhân bản',
    tone: 'primary',
    bulkLayout: 'grouped'
  },
  stop: {
    title: 'Dừng ban hành quy trình?',
    before: 'Bạn có chắc muốn dừng ban hành quy trình ',
    after: '? Sau khi dừng, quy trình không thể được dùng để khởi tạo mới cho đến khi ban hành lại.',
    bulk: 'Bạn có chắc muốn dừng ban hành các quy trình dưới đây? Sau khi dừng, quy trình không thể được dùng để khởi tạo mới cho đến khi ban hành lại.',
    listLabel: 'Sẽ dừng ban hành',
    confirm: 'Dừng ban hành',
    tone: 'danger',
    bulkLayout: 'cards'
  },
  publish: {
    title: 'Ban hành quy trình?',
    before: 'Bạn có chắc muốn ban hành quy trình ',
    after: '?',
    bulk: 'Bạn có chắc muốn ban hành các quy trình dưới đây?',
    listLabel: 'Sẽ ban hành',
    confirm: 'Ban hành',
    tone: 'primary',
    bulkLayout: 'grouped'
  },
  delete: {
    title: 'Xóa quy trình?',
    before: 'Bạn có chắc muốn xóa quy trình ',
    after: '? Quy trình và toàn bộ các phiên bản sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.',
    bulk: 'Bạn có chắc muốn xóa các quy trình dưới đây? Quy trình và toàn bộ các phiên bản sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.',
    listLabel: 'Sẽ xóa',
    confirm: 'Xóa',
    tone: 'danger',
    bulkLayout: 'grouped'
  }
};

/**
 * Modal xác nhận thao tác trên quy trình: nhân bản, ban hành / dừng ban hành (1 hoặc nhiều), xóa.
 * Nhiều quy trình: kiểu danh sách theo `bulkLayout` của action (dừng ban hành thẻ rời, ban hành khung chung).
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

  get text(): ProcessActionText {
    return ACTION_TEXT[this.action || 'clone'];
  }

  get isBulk(): boolean {
    return this.processes.length > 1;
  }

  get title(): string {
    return this.isBulk
      ? this.text.title.replace('quy trình', `${this.processes.length} quy trình`)
      : this.text.title;
  }

  get confirmLabel(): string {
    return this.isBulk ? `${this.text.confirm} (${this.processes.length})` : this.text.confirm;
  }

  trackByCode(_: number, row: ProcessRow): string {
    return row.item.code;
  }
}
