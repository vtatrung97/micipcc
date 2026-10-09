import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

/**
 * Khung modal giữa màn hình: tiêu đề + nút đóng · nội dung (ng-content) · footer (chiếu qua [modal-footer]).
 */
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() visible: boolean = false;
  @Input() title: string = '';
  @Input() width: number = 600;
  /** Bấm nền tối để đóng */
  @Input() maskClosable: boolean = true;

  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }

  onMaskClick(): void {
    if (this.maskClosable) this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible) this.close();
  }
}
