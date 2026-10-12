import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import { TemplateService } from '@core/services/template.service';
import {
  NodePropertyModel,
  SubProcessInputRow,
  SubProcessOutputRow,
} from '../../../models/node-property.model';
import { NodeFieldErrors } from '../../../models/node-validation';
import { SUB_PROCESS_INPUT_FIELDS, SUB_PROCESS_OUTPUT_FIELDS } from '../../../config/sub-process.config';
import { GraphBridgeService } from '../../../services/graph-bridge.service';
import { ProcessVariableOption, ProcessVariableService } from '../../../services/process-variable.service';
import { GraphEditorStore } from '../../../state/graph-editor.store';

type SectionKey = 'general' | 'subProcess' | 'input' | 'output';

/** Nội dung drawer node Quy trình con */
@Component({
  selector: 'app-sub-process-node-config',
  templateUrl: './sub-process-node-config.component.html',
  styleUrls: ['./sub-process-node-config.component.scss'],
})
export class SubProcessNodeConfigComponent implements OnChanges {
  @Input() nodeProps!: NodePropertyModel;
  /** Lỗi trường bắt buộc do drawer kiểm tra khi bấm Lưu */
  @Input() errors: NodeFieldErrors = {};

  openSections: Record<SectionKey, boolean> = {
    general: true,
    subProcess: true,
    input: true,
    output: true,
  };

  readonly subInputOptions = SUB_PROCESS_INPUT_FIELDS;
  readonly subOutputOptions = SUB_PROCESS_OUTPUT_FIELDS;
  processOptions: SelectOption[] = [];
  variableOptions: ProcessVariableOption[] = [];

  constructor(
    private bridgeService: GraphBridgeService,
    private variables: ProcessVariableService,
    private templateService: TemplateService,
    private store: GraphEditorStore,
    private router: Router,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['nodeProps'] || !this.nodeProps) return;
    this.variableOptions = this.variables.getVariables();
    // Quy trình con: mọi quy trình trừ quy trình đang thiết kế
    const currentCode = this.store.currentTemplate?.code;
    this.processOptions = this.templateService
      .getTemplates()
      .filter((t) => t.code !== currentCode)
      .map((t) => ({ value: t.code, label: t.name }));

    let changed = false;
    if (!this.nodeProps.subProcessInputs?.length) {
      this.nodeProps.subProcessInputs = [this.emptyInputRow()];
      changed = true;
    }
    if (!this.nodeProps.subProcessOutputs?.length) {
      this.nodeProps.subProcessOutputs = [this.emptyOutputRow()];
      changed = true;
    }
    if (changed) this.save('all');
  }

  get inputs(): SubProcessInputRow[] {
    return this.nodeProps.subProcessInputs || [];
  }

  get outputs(): SubProcessOutputRow[] {
    return this.nodeProps.subProcessOutputs || [];
  }

  isOpen(key: SectionKey): boolean {
    return this.openSections[key];
  }

  toggleSection(key: SectionKey): void {
    this.openSections[key] = !this.openSections[key];
  }

  variableCaption(variable: string | null): string {
    return this.variableOptions.find((o) => o.value === variable)?.displayName || '';
  }

  /** Đổi quy trình con → bỏ các trường đã chọn của quy trình cũ */
  onProcessChange(): void {
    this.inputs.forEach((r) => (r.subField = null));
    this.outputs.forEach((r) => (r.subField = null));
    this.save('all');
  }

  /** Mở quy trình con ở tab mới để không mất bản vẽ đang sửa */
  viewProcess(): void {
    const code = this.nodeProps.subProcessTemplateId;
    if (!code) return;
    const url = this.router.serializeUrl(this.router.createUrlTree(['/process/graph'], { queryParams: { id: code } }));
    window.open(url, '_blank');
  }

  addRow(kind: 'input' | 'output'): void {
    if (kind === 'input') {
      this.nodeProps.subProcessInputs = [...this.inputs, this.emptyInputRow()];
      this.save('subProcessInputs');
    } else {
      this.nodeProps.subProcessOutputs = [...this.outputs, this.emptyOutputRow()];
      this.save('subProcessOutputs');
    }
  }

  /** Chỉ 1 dòng thì ẩn nút xoá; từ 2 dòng trở lên thì dòng nào cũng xoá được */
  removeRow(kind: 'input' | 'output', index: number): void {
    if (kind === 'input' && this.inputs.length > 1) {
      this.nodeProps.subProcessInputs = this.inputs.filter((_, i) => i !== index);
      this.save('subProcessInputs');
    } else if (kind === 'output' && this.outputs.length > 1) {
      this.nodeProps.subProcessOutputs = this.outputs.filter((_, i) => i !== index);
      this.save('subProcessOutputs');
    }
  }

  onLabelChange(): void {
    this.bridgeService.updateNodeLabel(this.nodeProps.id, this.nodeProps.label, this.nodeProps);
  }

  save(field: keyof NodePropertyModel | 'all'): void {
    const value = field === 'all' ? this.nodeProps : this.nodeProps[field];
    this.bridgeService.updateNodeProp(this.nodeProps.id, field, value, this.nodeProps);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private emptyInputRow(): SubProcessInputRow {
    return { subField: null, variable: null };
  }

  private emptyOutputRow(): SubProcessOutputRow {
    return { subField: null, variable: '', displayName: '' };
  }
}
