import { Component, Input, Optional } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ProcessTemplateItem } from '@core/services/ticket-call-flows/template.service';

@Component({
  selector: 'app-template-info-modal',
  templateUrl: './template-info-modal.component.html',
  styleUrls: ['./template-info-modal.component.scss']
})
export class TemplateInfoModalComponent {
  @Input() template: ProcessTemplateItem | null = null;

  constructor(@Optional() private modalRef: NzModalRef) {}

  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
}
