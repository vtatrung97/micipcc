import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import {
  NodePropertyModel,
  UserTaskInputRow,
  UserTaskOutputRow,
} from '../../../models/node-property.model';
import { NodeFieldErrors } from '../../../models/node-validation';
import { PROCESS_VARIABLE_LIMITS, variableNameFilter } from '../../../models/process-variable';
import { NODE_TEXT_LIMITS, applyLabelChange, nodeKeyFilter } from '../../../models/node-key';
import {
  PROCESS_FORM_FIELD_OPTIONS,
  PROCESS_INPUT_FORM_OPTIONS,
} from '../../../config/process-info.config';
import {
  USER_TASK_AGENTS,
  USER_TASK_DEPARTMENT_KEYS,
  USER_TASK_SLA_UNITS,
  USER_TASK_TEAMS,
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
  readonly varLimits = PROCESS_VARIABLE_LIMITS;
  readonly variableNameFilter = variableNameFilter;

  readonly limits = NODE_TEXT_LIMITS;
  readonly nodeKeyFilter = nodeKeyFilter;

  openSections: Record<SectionKey, boolean> = {
    general: true,
    actor: true,
    form: true,
    output: true,
  };

  readonly formOptions = PROCESS_INPUT_FORM_OPTIONS;
  readonly digitFilter = (v: string) => v.replace(/\D/g, '');
  departmentOptions: SelectOption[] = [];
  /** Nhóm của phòng ban đã chọn */
  teamOptions: SelectOption[] = [];
  /** Agent của phòng ban + nhóm đã chọn (chưa chọn nhóm = mọi agent của phòng ban) */
  agentOptions: SelectOption[] = [];
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
    // Biến của các bước đứng trước bước này
    this.variableOptions = this.variables.getVariables(this.nodeProps.id);
    let changed = false;
    if (!this.nodeProps.assignType) {
      this.nodeProps.assignType = 'MANUAL';
      changed = true;
    }
    if (this.isAutoAssign && !this.nodeProps.assignStrategy) {
      this.nodeProps.assignStrategy = 'ROUND_ROBIN';
      changed = true;
    }
    // Dữ liệu cũ chọn 1 nhóm / 1 agent → chuyển sang danh sách
    if (!this.nodeProps.teams) {
      this.nodeProps.teams = this.nodeProps.team ? [this.nodeProps.team] : [];
      changed = true;
    }
    if (!this.nodeProps.agents) {
      this.nodeProps.agents = this.nodeProps.agent ? [this.nodeProps.agent] : [];
      changed = true;
    }
    this.buildActorOptions();
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

  // ===== Thời hạn xử lý: ô chữ số ⇄ number =====
  get slaText(): string {
    return this.nodeProps.slaSeconds == null ? '' : String(this.nodeProps.slaSeconds);
  }

  set slaText(value: string) {
    const n = parseInt(value, 10);
    this.nodeProps.slaSeconds = isNaN(n) ? undefined : n;
    this.save('slaSeconds');
  }

  /** Đổi phòng ban → bỏ nhóm / agent không thuộc phòng ban mới */
  onDepartmentChange(): void {
    this.buildActorOptions();
    this.save('all');
  }

  /** Đổi nhóm → bỏ agent không thuộc các nhóm đã chọn */
  onTeamsChange(): void {
    this.buildActorOptions();
    this.save('all');
  }

  /** Danh sách nhóm / agent theo phòng ban + nhóm; lọc bỏ giá trị đã chọn không còn hợp lệ */
  private buildActorOptions(): void {
    const t = (key: string) => this.translate.instant('PROCESS_GRAPH.OPTIONS.' + key);
    const dept = this.nodeProps.department;
    const teams = USER_TASK_TEAMS.filter((x) => x.departmentId === dept);
    this.teamOptions = teams.map((x) => ({ value: x.value, label: t(x.label) }));
    this.nodeProps.teams = (this.nodeProps.teams || []).filter((v) => teams.some((x) => x.value === v));
    const picked = this.nodeProps.teams;
    const agents = USER_TASK_AGENTS.filter((a) => a.departmentId === dept && (!picked.length || (a.teamId && picked.includes(a.teamId))));
    this.agentOptions = agents.map((a) => ({ value: a.value, label: a.label }));
    this.nodeProps.agents = (this.nodeProps.agents || []).filter((v) => agents.some((a) => a.value === v));
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

  private buildOptions(): void {
    const t = (key: string) => this.translate.instant('PROCESS_GRAPH.' + key);
    const translateKeys = (list: SelectOption[]) =>
      list.map((o) => ({ value: o.value, label: t('OPTIONS.' + o.label) }));
    this.departmentOptions = translateKeys(USER_TASK_DEPARTMENT_KEYS);
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
