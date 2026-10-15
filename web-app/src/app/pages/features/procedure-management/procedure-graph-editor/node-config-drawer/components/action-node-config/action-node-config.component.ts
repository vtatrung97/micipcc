import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import {
  NodePropertyModel,
  SystemTaskInputRow,
  SystemTaskOutputRow,
} from '../../../models/node-property.model';
import { NODE_NUMBER_LIMITS, NodeFieldErrors } from '../../../models/node-validation';
import { PROCESS_VARIABLE_LIMITS, variableNameFilter } from '../../../models/process-variable';
import { NODE_TEXT_LIMITS, applyLabelChange, nodeKeyFilter } from '../../../models/node-key';
import { SYSTEM_APIS, SYSTEM_KEYS, SystemApiDef } from '../../../config/system-task.config';
import { GraphBridgeService } from '../../../services/graph-bridge.service';
import { ProcessVariableOption, ProcessVariableService } from '../../../services/process-variable.service';

type SectionKey = 'general' | 'integration' | 'input' | 'output';

/** Nội dung drawer node Tác vụ hệ thống */
@Component({
  selector: 'app-action-node-config',
  templateUrl: './action-node-config.component.html',
  styleUrls: ['./action-node-config.component.scss'],
})
export class ActionNodeConfigComponent implements OnChanges {
  @Input() nodeProps!: NodePropertyModel;
  /** Lỗi trường bắt buộc do drawer kiểm tra khi bấm Lưu */
  @Input() errors: NodeFieldErrors = {};
  readonly varLimits = PROCESS_VARIABLE_LIMITS;
  readonly numberLimits = NODE_NUMBER_LIMITS;
  readonly variableNameFilter = variableNameFilter;

  readonly limits = NODE_TEXT_LIMITS;
  readonly nodeKeyFilter = nodeKeyFilter;

  openSections: Record<SectionKey, boolean> = {
    general: true,
    integration: true,
    input: true,
    output: true,
  };

  systemOptions: SelectOption[] = [];
  apiOptions: SelectOption[] = [];
  variableOptions: ProcessVariableOption[] = [];
  /** Kết quả "Kiểm tra kết nối" của API đang chọn; null = chưa kiểm tra */
  connectionStatus: 'success' | 'failed' | null = null;

  constructor(
    private bridgeService: GraphBridgeService,
    private variables: ProcessVariableService,
    translate: TranslateService,
  ) {
    this.systemOptions = SYSTEM_KEYS.map((o) => ({
      value: o.value,
      label: translate.instant('PROCESS_GRAPH.OPTIONS.SYSTEMS.' + o.label),
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['nodeProps'] || !this.nodeProps) return;
    // Biến của các bước đứng trước bước này
    this.variableOptions = this.variables.getVariables(this.nodeProps.id);
    this.connectionStatus = null;
    this.refreshApiOptions();
    let changed = false;
    if (!this.nodeProps.apiInputs?.length) {
      this.nodeProps.apiInputs = [this.emptyInputRow()];
      changed = true;
    }
    if (!this.nodeProps.apiOutputs?.length) {
      this.nodeProps.apiOutputs = [this.emptyOutputRow()];
      changed = true;
    }
    if (changed) this.save('all');
  }

  get inputs(): SystemTaskInputRow[] {
    return this.nodeProps.apiInputs || [];
  }

  get outputs(): SystemTaskOutputRow[] {
    return this.nodeProps.apiOutputs || [];
  }

  get selectedApi(): SystemApiDef | undefined {
    return (SYSTEM_APIS[this.nodeProps.integratedSystem || ''] || []).find(
      (a) => a.value === this.nodeProps.selectedApi,
    );
  }

  get requestParamOptions(): SelectOption[] {
    return this.selectedApi?.requestParams || [];
  }

  get responseFieldOptions(): SelectOption[] {
    return this.selectedApi?.responseFields || [];
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

  /** Đổi hệ thống → bỏ API đã chọn */
  onSystemChange(): void {
    this.nodeProps.selectedApi = '';
    this.refreshApiOptions();
    this.onApiChange();
  }

  /** Đổi API → bỏ tham số/trường của API cũ, phải kiểm tra kết nối lại */
  onApiChange(): void {
    this.connectionStatus = null;
    this.inputs.forEach((r) => (r.apiParam = null));
    this.outputs.forEach((r) => (r.apiField = null));
    this.save('all');
  }

  /** ⚠ Giả lập: chưa có API kiểm tra kết nối, kết quả lấy theo isReachable của API trong config */
  testConnection(): void {
    const api = this.selectedApi;
    if (!api) return;
    this.connectionStatus = api.isReachable === false ? 'failed' : 'success';
  }

  addRow(kind: 'input' | 'output'): void {
    if (kind === 'input') {
      this.nodeProps.apiInputs = [...this.inputs, this.emptyInputRow()];
      this.save('apiInputs');
    } else {
      this.nodeProps.apiOutputs = [...this.outputs, this.emptyOutputRow()];
      this.save('apiOutputs');
    }
  }

  /** Chỉ 1 dòng thì ẩn nút xoá; từ 2 dòng trở lên thì dòng nào cũng xoá được */
  removeRow(kind: 'input' | 'output', index: number): void {
    if (kind === 'input' && this.inputs.length > 1) {
      this.nodeProps.apiInputs = this.inputs.filter((_, i) => i !== index);
      this.save('apiInputs');
    } else if (kind === 'output' && this.outputs.length > 1) {
      this.nodeProps.apiOutputs = this.outputs.filter((_, i) => i !== index);
      this.save('apiOutputs');
    }
  }

  /** Đổi tên bước; mã bước còn tự sinh thì sinh lại theo tên mới */
  onLabelChange(label: string): void {
    applyLabelChange(this.nodeProps, label);
    this.bridgeService.updateNodeLabel(this.nodeProps.id, this.nodeProps.label, this.nodeProps);
  }

  save(field: keyof NodePropertyModel | 'all'): void {
    const value = field === 'all' ? this.nodeProps : this.nodeProps[field];
    this.bridgeService.updateNodeProp(this.nodeProps.id, field, value, this.nodeProps);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private refreshApiOptions(): void {
    this.apiOptions = (SYSTEM_APIS[this.nodeProps.integratedSystem || ''] || []).map((a) => ({
      value: a.value,
      label: a.label,
    }));
  }

  private emptyInputRow(): SystemTaskInputRow {
    return { apiParam: null, variable: null };
  }

  private emptyOutputRow(): SystemTaskOutputRow {
    return { apiField: null, variable: '', displayName: '' };
  }
}
