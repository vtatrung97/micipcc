import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TemplateService, ProcessTemplateItem } from '@core/services/template.service';

/** Giới hạn ô Tên / Mã quy trình (giống tab Thông tin chung) */
const MAX_LENGTH = 255;
const CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

export interface ProcessCloneValue {
  name: string;
  code: string;
}

/**
 * Popup "Nhân bản quy trình": Tên điền sẵn "<tên cũ>_copy", Mã để trống.
 * Cả hai bắt buộc, tối đa 255, không trùng quy trình khác (không phân biệt hoa thường); Mã chỉ gồm chữ, số, _ và -.
 */
@Component({
  selector: 'app-process-clone-modal',
  templateUrl: './process-clone-modal.component.html',
  styleUrls: ['./process-clone-modal.component.scss']
})
export class ProcessCloneModalComponent implements OnChanges {
  /** Quy trình gốc; null = đóng */
  @Input() source: ProcessTemplateItem | null = null;

  @Output() confirmed = new EventEmitter<ProcessCloneValue>();
  @Output() closed = new EventEmitter<void>();

  readonly maxLength = MAX_LENGTH;
  name: string = '';
  code: string = '';
  nameError: string = '';
  codeError: string = '';

  constructor(private templateService: TemplateService) {}

  get visible(): boolean {
    return !!this.source;
  }

  /** Chặn ký tự ngoài chữ không dấu, số, _ và - ngay khi gõ */
  readonly codeFilter = (v: string) => v.replace(/[^A-Za-z0-9_-]/g, '');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['source'] && this.source) {
      this.name = `${this.source.name}_copy`.slice(0, MAX_LENGTH);
      this.code = '';
      this.nameError = '';
      this.codeError = '';
    }
  }

  submit(): void {
    const name = this.name.trim();
    const code = this.code.trim();
    const templates = this.templateService.getTemplates();

    this.nameError = !name ? 'Vui lòng nhập thông tin này'
      : templates.some(t => (t.name || '').trim().toLowerCase() === name.toLowerCase()) ? 'Tên quy trình đã tồn tại'
      : '';
    this.codeError = !code ? 'Vui lòng nhập thông tin này'
      : !CODE_PATTERN.test(code) ? 'Chỉ gồm chữ không dấu, số, dấu _ hoặc -'
      : templates.some(t => (t.code || '').toLowerCase() === code.toLowerCase()) ? 'Mã quy trình đã tồn tại'
      : '';
    if (this.nameError || this.codeError) return;
    this.confirmed.emit({ name, code });
  }
}
