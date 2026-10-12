import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import {
  NodePropertyModel,
  UserTaskInputRow,
  UserTaskOutputRow,
} from '../../../models/node-property.model';
import { NodeFieldErrors } from '../../../models/node-validation';
import {
  PROCESS_FORM_FIELD_OPTIONS,
  PROCESS_INPUT_FORM_OPTIONS,
} from '../../../config/process-info.config';
import {
  USER_TASK_AGENT_OPTIONS,
  USER_TASK_DEPARTMENT_KEYS,
  USER_TASK_SLA_UNITS,
  USER_TASK_TEAM_KEYS,
} from '../../../config/user-task.config';
import { GraphBridgeService } from '../../../services/graph-bridge.service';
import { ProcessVariableOption, ProcessVariableService } from '../../../services/process-variable.service';

type SectionKey = 'general' | 'actor' | 'form' | 'output';

/** Nội dung drawer node Giao việc */
@Component({
  selector: 'app-task-node-config',
  templateUrl: './task-node-config.component.html',
  styleUrls: ['./task-node-config.component.scss'],
})
export class TaskNodeConfigComponent implements OnChanges {
  @Input() nodeProps!: NodePropertyModel;
  /** Lỗi trường bắt buộc do drawer kiểm tra khi bấm Lưu */
  @Input() errors: NodeFieldErrors = {};

  openSections: Record<SectionKey, boolean> = {
    general: true,
    actor: true,
    form: true,
    output: true,
  };

  readonly agentOptions = USER_TASK_AGENT_OPTIONS;
  readonly formOptions = PROCESS_INPUT_FORM_OPTIONS;
  departmentOptions: SelectOption[] = [];
  teamOptions: SelectOption[] = [];
  slaUnitOptions: SelectOption[] = [];
  assignTypeOptions: SelectOption[] = [];
  strategyOptions: SelectOption[] = [];

  /** Biến quy trình trên canvas (node Bắt đầu + đầu ra các node Giao việc) */
  variableOptions: ProcessVariableOption[] = [];

  constructor(
    private bridgeService: GraphBridgeService,
    private variables: ProcessVariableService,
    private translate: TranslateService,
  ) {
    this.buildOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['nodeProps'] || !this.nodeProps) return;
    this.variableOptions = this.variables.getVariables();
    let changed = false;
    if (!this.nodeProps.assignType) {
      this.nodeProps.assignType = 'MANUAL';
      changed = true;
    }
    if (this.isAutoAssign && !this.nodeProps.assignStrategy) {
      this.nodeProps.assignStrategy = 'ROUND_ROBIN';
      changed = true;
    }
    // Đơn vị không thuộc danh sách (dữ liệu cũ) → về mặc định Ngày
    if (!USER_TASK_SLA_UNITS.some((u) => u.value === this.nodeProps.sla)) {
      this.nodeProps.sla = 'Ngày';
      changed = true;
    }
    // Lần đầu mở: dữ liệu đầu vào lấy sẵn các biến quy trình hiện có
    if (!this.nodeProps.formInputs?.length) {
      const names = this.variableOptions.map((o) => o.value as string);
      this.nodeProps.formInputs = names.length
        ? names.map((v) => this.emptyInputRow(v))
        : [this.emptyInputRow(null)];
      changed = true;
    }
    if (!this.nodeProps.formOutputs?.length) {
      this.nodeProps.formOutputs = [this.emptyOutputRow()];
      changed = true;
    }
    if (changed) this.save('all');
  }

  get isAutoAssign(): boolean {
    return this.nodeProps.assignType === 'AUTO';
  }

  get formFieldOptions(): SelectOption[] {
    return (this.nodeProps.formTemplate && PROCESS_FORM_FIELD_OPTIONS[this.nodeProps.formTemplate]) || [];
  }

  get inputs(): UserTaskInputRow[] {
    return this.nodeProps.formInputs || [];
  }

  get outputs(): UserTaskOutputRow[] {
    return this.nodeProps.formOutputs || [];
  }

  isOpen(key: SectionKey): boolean {
    return this.openSections[key];
  }

  toggleSection(key: SectionKey): void {
    this.openSections[key] = !this.openSections[key];
  }

  /** Tên hiển thị của biến (dòng phụ dưới tên biến) */
  variableCaption(variable: string | null): string {
    return this.variableOptions.find((o) => o.value === variable)?.displayName || '';
  }

  onAssignTypeChange(): void {
    if (this.isAutoAssign && !this.nodeProps.assignStrategy) {
      this.nodeProps.assignStrategy = 'ROUND_ROBIN';
    }
    this.save('all');
  }

  /** Đổi biểu mẫu → bỏ các trường đã chọn của biểu mẫu cũ */
  onFormChange(): void {
    this.inputs.forEach((r) => (r.formField = null));
    this.outputs.forEach((r) => (r.formField = null));
    this.save('all');
  }

  /** Bỏ tích Ánh xạ → xoá trường biểu mẫu của dòng */
  onMappedChange(row: UserTaskInputRow): void {
    if (!row.mapped) row.formField = null;
    this.save('formInputs');
  }

  addRow(kind: 'input' | 'output'): void {
    if (kind === 'input') {
      this.nodeProps.formInputs = [...this.inputs, this.emptyInputRow(null)];
      this.save('formInputs');
    } else {
      this.nodeProps.formOutputs = [...this.outputs, this.emptyOutputRow()];
      this.save('formOutputs');
    }
  }

  /** Chỉ 1 dòng thì ẩn nút xoá; từ 2 dòng trở lên thì dòng nào cũng xoá được */
  removeRow(kind: 'input' | 'output', index: number): void {
    if (kind === 'input' && this.inputs.length > 1) {
      this.nodeProps.formInputs = this.inputs.filter((_, i) => i !== index);
      this.save('formInputs');
    } else if (kind === 'output' && this.outputs.length > 1) {
      this.nodeProps.formOutputs = this.outputs.filter((_, i) => i !== index);
      this.save('formOutputs');
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

  private buildOptions(): void {
    const t = (key: string) => this.translate.instant('PROCESS_GRAPH.' + key);
    const translateKeys = (list: SelectOption[]) =>
      list.map((o) => ({ value: o.value, label: t('OPTIONS.' + o.label) }));
    this.departmentOptions = translateKeys(USER_TASK_DEPARTMENT_KEYS);
    this.teamOptions = translateKeys(USER_TASK_TEAM_KEYS);
    this.slaUnitOptions = USER_TASK_SLA_UNITS.map((u) => ({ value: u.value, label: t('DRAWER.UNITS.' + u.key) }));
    this.assignTypeOptions = ['MANUAL', 'AUTO'].map((v) => ({
      value: v,
      label: t('DRAWER.USER_TASK.ASSIGN_TYPES.' + v),
    }));
    this.strategyOptions = ['ROUND_ROBIN', 'LEAST_BUSY'].map((v) => ({
      value: v,
      label: t('DRAWER.USER_TASK.STRATEGIES.' + v),
    }));
  }

  private emptyInputRow(variable: string | null): UserTaskInputRow {
    return { variable, mapped: false, formField: null };
  }

  private emptyOutputRow(): UserTaskOutputRow {
    return { variable: '', formField: null, displayName: '' };
  }
}
