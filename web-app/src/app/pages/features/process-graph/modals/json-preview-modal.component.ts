import { Component, Input, Optional } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-json-preview-modal',
  templateUrl: './json-preview-modal.component.html',
  styleUrls: ['./json-preview-modal.component.scss']
})
export class JsonPreviewModalComponent {
  @Input() jsonPayload: string | null = '';

  constructor(@Optional() private modalRef: NzModalRef) {}

  copyJson(): void {
    if (this.jsonPayload) {
      navigator.clipboard.writeText(this.jsonPayload).then(() => {
        alert('Đã sao chép Graph JSON Payload vào Clipboard!');
      });
    }
  }

  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
}
