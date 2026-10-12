import { Component, Input, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import {
  ConditionRuleItem,
  NodePropertyModel,
  StartVariableRow,
} from '../../../models/node-property.model';
import {
  ProcessScheduleConfig,
  ProcessTriggerType,
} from '../../../models/process-info.model';
import {
  PROCESS_API_ENDPOINTS,
  PROCESS_API_FIELD_OPTIONS,
  PROCESS_FORM_FIELD_OPTIONS,
  PROCESS_HYBRID_API_OPTIONS,
  PROCESS_INPUT_FORM_OPTIONS,
} from '../../../config/process-info.config';
import { GraphBridgeService } from '../../../services/graph-bridge.service';
import { GraphEditorStore } from '../../../state/graph-editor.store';

@Component({
  selector: 'app-trigger-node-config',
  templateUrl: './trigger-node-config.component.html',
  styleUrls: ['./trigger-node-config.component.scss'],
})
export class TriggerNodeConfigComponent implements OnChanges {
  @Input() nodeProps!: NodePropertyModel;

  /** Mở / thu gọn khối "Khởi tạo biến quy trình" */
  isVariablesOpen: boolean = true;

  constructor(
    private bridgeService: GraphBridgeService,
    private store: GraphEditorStore,
    private translate: TranslateService,
  ) {}

  ngOnChanges(): void {
    // Luôn có ít nhất 1 dòng biến
    if (this.nodeProps && !this.nodeProps.startVariables?.length) {
      this.nodeProps.startVariables = [this.emptyRow()];
    }
  }

  get triggerType(): ProcessTriggerType | null {
    return this.store.processInfo?.triggerType || null;
  }

  /** Biểu mẫu của kích hoạt thủ công (chọn ở tab Thông tin chung) */
  get formId(): string | null {
    const info = this.store.processInfo;
    return (
      (this.triggerType === 'HYBRID'
        ? info?.hybrid?.inputFormId
        : info?.manual?.inputFormId) || null
    );
  }

  get formLabel(): string {
    return (
      PROCESS_INPUT_FORM_OPTIONS.find((o) => o.value === this.formId)?.label ||
      ''
    );
  }

  get formFieldOptions(): SelectOption[] {
    return (this.formId && PROCESS_FORM_FIELD_OPTIONS[this.formId]) || [];
  }

  /** API của kích hoạt tự động (chọn ở tab Thông tin chung) */
  get apiId(): string | null {
    const info = this.store.processInfo;
    return (
      (this.triggerType === 'HYBRID'
        ? info?.hybrid?.apiId
        : info?.auto?.apiId) || null
    );
  }

  get apiEndpoint(): string {
    const id = this.apiId;
    if (!id) return '';
    return (
      PROCESS_API_ENDPOINTS[id] ||
      PROCESS_HYBRID_API_OPTIONS.find((o) => o.value === id)?.label ||
      id
    );
  }

  /** Điều kiện kích hoạt đã cài ở tab Thông tin chung (chỉ xem) */
  get conditionRules(): ConditionRuleItem[] {
    // ⚠ Tab Thông tin chung chưa có ô cài điều kiện cho Hybrid → Hybrid hiện khung trống
    if (this.triggerType !== 'AUTO') return [];
    return this.store.processInfo?.auto?.conditions?.rules || [];
  }

  /** Có dòng Biểu mẫu (thủ công / hybrid) */
  get hasForm(): boolean {
    return this.triggerType === 'MANUAL' || this.triggerType === 'HYBRID';
  }

  /** Có API endpoint + Điều kiện kích hoạt (tự động / hybrid) */
  get hasApi(): boolean {
    return this.triggerType === 'AUTO' || this.triggerType === 'HYBRID';
  }

  /** Hybrid: bảng biến có 2 cột nguồn (Trường dữ liệu API + Trường biểu mẫu) */
  get isHybrid(): boolean {
    return this.triggerType === 'HYBRID';
  }

  get apiFieldOptions(): SelectOption[] {
    return (this.apiId && PROCESS_API_FIELD_OPTIONS[this.apiId]) || [];
  }

  /** Lịch chạy của kích hoạt Lập lịch (chọn ở tab Thông tin chung, chỉ xem) */
  get schedule(): ProcessScheduleConfig | null {
    return this.store.processInfo?.schedule || null;
  }

  /** Chạy một lần / Lặp lại (nhãn theo ngôn ngữ hiện tại) */
  readonly scheduleModeOptions: SelectOption[] = ['ONCE', 'REPEAT'].map(
    (v) => ({
      value: v,
      label: this.translate.instant('PROCESS_GRAPH.INFO.SCHEDULE_MODES.' + v),
    }),
  );

  get runHour(): string {
    return (this.schedule?.runTime || '').split(':')[0] || '';
  }

  get runMinute(): string {
    return (this.schedule?.runTime || '').split(':')[1] || '';
  }

  /** 'YYYY-MM-DD' → 'DD/MM/YYYY' */
  get runDateText(): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(this.schedule?.runDate || '');
    return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
  }

  get monthDaysText(): string {
    return (this.schedule?.monthDays || []).join(', ');
  }

  /** Có bảng "Khởi tạo biến quy trình" (thủ công / tự động / lập lịch) */
  get hasVariables(): boolean {
    return !!this.triggerType;
  }

  /** Lập lịch: cột giữa là ô nhập "Giá trị cố định" thay cho ô chọn trường nguồn */
  get isFixedValue(): boolean {
    return this.triggerType === 'SCHEDULE';
  }

  /** Nhãn cột giữa: "Trường biểu mẫu" (thủ công) / "Trường dữ liệu API" (tự động) / "Giá trị cố định" (lập lịch) */
  get sourceColumnKey(): string {
    if (this.triggerType === 'AUTO') return 'COL_API_FIELD';
    if (this.triggerType === 'SCHEDULE') return 'COL_FIXED_VALUE';
    return 'COL_FORM_FIELD';
  }

  /** Danh sách trường nguồn của biến theo loại kích hoạt */
  get sourceFieldOptions(): SelectOption[] {
    if (this.triggerType === 'AUTO') return this.apiFieldOptions;
    return this.formFieldOptions;
  }

  get rows(): StartVariableRow[] {
    return this.nodeProps.startVariables || [];
  }

  addRow(): void {
    this.nodeProps.startVariables = [...this.rows, this.emptyRow()];
    this.save();
  }

  /** Nút xoá dòng (cả 4 loại kích hoạt): chỉ 1 dòng thì ẩn; từ 2 dòng trở lên thì dòng nào cũng xoá được */
  canRemove(_index: number): boolean {
    return this.rows.length > 1;
  }

  removeRow(index: number): void {
    if (!this.canRemove(index)) return;
    this.nodeProps.startVariables = this.rows.filter((_, i) => i !== index);
    this.save();
  }

  save(): void {
    this.bridgeService.updateNodeProp(
      this.nodeProps.id,
      'startVariables',
      this.nodeProps.startVariables,
      this.nodeProps,
    );
  }

  trackByIndex(index: number): number {
    return index;
  }

  private emptyRow(): StartVariableRow {
    return { variable: '', formField: null, apiField: null, displayName: '' };
  }
}
