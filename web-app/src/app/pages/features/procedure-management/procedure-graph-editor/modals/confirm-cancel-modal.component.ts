import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

/**
 * Popup xác nhận (mặc định: rời màn hình khi còn thay đổi chưa lưu; dùng lại cho Dừng ban hành).
 * "Xác nhận" → (confirmed), "Hủy" / "X" / nền tối / Esc → (closed).
 */
@Component({
  selector: 'app-confirm-cancel-modal',
  templateUrl: './confirm-cancel-modal.component.html',
  styleUrls: ['./confirm-cancel-modal.component.scss']
})
export class ConfirmCancelModalComponent {
  @Input() visible: boolean = false;
  @Input() titleKey: string = 'PROCESS_GRAPH.CANCEL_CONFIRM.TITLE';
  @Input() messageKey: string = 'PROCESS_GRAPH.CANCEL_CONFIRM.MESSAGE';
  @Input() iconSrc: string = 'assets/icons/processx/alert-circle-warning.svg';
  @Input() iconSize: number | string = 24;

  @Output() confirmed = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible) this.closed.emit();
  }
}
