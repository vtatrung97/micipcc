import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ProcessCategoryService } from '@core/services/process-category.service';
import { PROCESS_CATEGORY_MAX_LENGTH } from '@core/services/process-category.constant';

/**
 * Popup "Thêm mới nhóm quy trình": tên tối đa 255, không trùng (không phân biệt hoa thường).
 * Lưu → thêm vào danh sách nhóm và trả tên nhóm qua (saved); Hủy / X / Esc → (closed).
 */
@Component({
  selector: 'app-category-add-modal',
  templateUrl: './category-add-modal.component.html',
  styleUrls: ['./category-add-modal.component.scss'],
})
export class CategoryAddModalComponent implements OnChanges {
  @Input() visible: boolean = false;
  /** Tên gợi ý (từ khoá đang tìm trong dropdown) */
  @Input() initialName: string = '';

  @Output() saved = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  readonly maxLength = PROCESS_CATEGORY_MAX_LENGTH;
  name: string = '';
  error: string = '';

  constructor(
    private categories: ProcessCategoryService,
    private translate: TranslateService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.name = (this.initialName || '').trim();
      this.error = '';
    }
  }

  save(): void {
    const code = this.categories.validate(this.name);
    if (code) {
      this.error = this.translate.instant('PROCESS_GRAPH.INFO.CATEGORY_ERRORS.' + code);
      return;
    }
    this.saved.emit(this.categories.add(this.name));
  }
}
