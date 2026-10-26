import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  @Input() visible: boolean = false;
  @Input() title: string = 'Xác nhận hành động';
  @Input() content?: string;
  @Input() type: 'danger' | 'warning' | 'info' = 'danger';
  @Input() confirmText?: string;
  @Input() cancelText?: string;
  @Input() loading: boolean = false;

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  handleConfirm(): void {
    if (this.loading) return;
    this.onConfirm.emit();
  }

  handleCancel(): void {
    if (this.loading) return;
    this.visible = false;
    this.onCancel.emit();
  }
}
