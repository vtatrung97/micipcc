import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ProcessTemplateItem } from '@core/services/ticket-call-flows/template.service';
import { ProcessInfo, processInfoFromTemplate } from '../models/process-info.model';

/**
 * Popup xem một quy trình (chỉ xem): tab Thông tin chung + tab Thiết kế quy trình.
 * Dùng cho nút "Xem quy trình" của node Quy trình con.
 */
@Component({
  selector: 'app-process-preview-modal',
  templateUrl: './process-preview-modal.component.html',
  styleUrls: ['./process-preview-modal.component.scss'],
})
export class ProcessPreviewModalComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() template: ProcessTemplateItem | null = null;
  @Output() closed = new EventEmitter<void>();

  activeTab: 'info' | 'design' = 'info';
  info: ProcessInfo | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['visible'] || changes['template']) && this.visible && this.template) {
      this.activeTab = 'info';
      this.info = processInfoFromTemplate(this.template);
    }
  }
}
