import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import { EndResultRow, NodePropertyModel } from '../../../models/node-property.model';
import { NodeFieldErrors } from '../../../models/node-validation';
import { END_FORM_FIELD_OPTIONS, END_FORM_KEYS } from '../../../config/end-node.config';
import { GraphBridgeService } from '../../../services/graph-bridge.service';
import { ProcessVariableOption, ProcessVariableService } from '../../../services/process-variable.service';

/** Nội dung drawer node Kết thúc: biểu mẫu kết thúc + bảng Kết quả */
@Component({
  selector: 'app-end-node-config',
  templateUrl: './end-node-config.component.html',
  styleUrls: ['./end-node-config.component.scss'],
})
export class EndNodeConfigComponent implements OnChanges {
  @Input() nodeProps!: NodePropertyModel;
  /** Lỗi trường bắt buộc do drawer kiểm tra khi bấm Lưu */
  @Input() errors: NodeFieldErrors = {};

  isResultsOpen: boolean = true;
  formOptions: SelectOption[] = [];
  variableOptions: ProcessVariableOption[] = [];

  constructor(
    private bridgeService: GraphBridgeService,
    private variables: ProcessVariableService,
    translate: TranslateService,
  ) {
    this.formOptions = END_FORM_KEYS.map((o) => ({
      value: o.value,
      label: translate.instant('PROCESS_GRAPH.OPTIONS.END_FORMS.' + o.label),
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['nodeProps'] || !this.nodeProps) return;
    // Biến của các bước đứng trước bước này
    this.variableOptions = this.variables.getVariables(this.nodeProps.id);
    if (!this.nodeProps.endResults?.length) {
      this.nodeProps.endResults = [this.emptyRow()];
      this.save('endResults');
    }
  }

  get rows(): EndResultRow[] {
    return this.nodeProps.endResults || [];
  }

  get formFieldOptions(): SelectOption[] {
    return (this.nodeProps.endFormTemplate && END_FORM_FIELD_OPTIONS[this.nodeProps.endFormTemplate]) || [];
  }

  variableCaption(variable: string | null): string {
    return this.variableOptions.find((o) => o.value === variable)?.displayName || '';
  }

  /** Đổi biểu mẫu → bỏ các trường đã chọn của biểu mẫu cũ */
  onFormChange(): void {
    this.rows.forEach((r) => (r.formField = null));
    this.save('all');
  }

  addRow(): void {
    this.nodeProps.endResults = [...this.rows, this.emptyRow()];
    this.save('endResults');
  }

  /** Chỉ 1 dòng thì ẩn nút xoá; từ 2 dòng trở lên thì dòng nào cũng xoá được */
  removeRow(index: number): void {
    if (this.rows.length < 2) return;
    this.nodeProps.endResults = this.rows.filter((_, i) => i !== index);
    this.save('endResults');
  }

  save(field: keyof NodePropertyModel | 'all'): void {
    const value = field === 'all' ? this.nodeProps : this.nodeProps[field];
    this.bridgeService.updateNodeProp(this.nodeProps.id, field, value, this.nodeProps);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private emptyRow(): EndResultRow {
    return { variable: null, formField: null };
  }
}
