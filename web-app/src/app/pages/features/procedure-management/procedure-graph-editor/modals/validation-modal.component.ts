import { Component, Input, Output, EventEmitter, Optional } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { GraphValidationResult } from '../config/ports.config';

@Component({
  selector: 'app-validation-modal',
  templateUrl: './validation-modal.component.html',
  styleUrls: ['./validation-modal.component.scss']
})
export class ValidationModalComponent {
  @Input() validationResult: GraphValidationResult | null = null;
  @Output() revalidate = new EventEmitter<void>();
  @Output() focusNode = new EventEmitter<string>();

  constructor(@Optional() private modalRef: NzModalRef) {}

  onFocusNode(nodeId: string): void {
    if (this.modalRef) {
      this.modalRef.close();
    }
    this.focusNode.emit(nodeId);
  }

  onRevalidate(): void {
    this.revalidate.emit();
  }

  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
}
