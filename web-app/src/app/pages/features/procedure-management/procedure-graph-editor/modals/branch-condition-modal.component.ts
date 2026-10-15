import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import { ConditionBranch, ConditionRuleItem } from '../models/node-property.model';
import { ProcessVariableOption, ProcessVariableService } from '../services/process-variable.service';

export type BranchModalMode = 'create' | 'edit' | 'view';

/** Kết quả khi bấm Lưu: tên nhánh + danh sách điều kiện */
export interface BranchModalResult {
  name: string;
  rules: ConditionRuleItem[];
}

/** Kiểu so sánh theo tài liệu: = <> < > <= >= IN NOT IN */
const OPERATORS = ['EQ', 'NEQ', 'LT', 'GT', 'LTE', 'GTE', 'IN', 'NOT_IN'];

/** Modal thêm mới / chỉnh sửa / xem nhánh điều kiện của node Điều kiện */
@Component({
  selector: 'app-branch-condition-modal',
  templateUrl: './branch-condition-modal.component.html',
  styleUrls: ['./branch-condition-modal.component.scss'],
})
export class BranchConditionModalComponent implements OnChanges {
  @Input() visible: boolean = false;
  /** Node điều kiện đang sửa — biến chọn được là biến của các bước đứng trước nó */
  @Input() nodeId: string | null = null;
  @Input() mode: BranchModalMode = 'create';
  /** Nhánh đang sửa / xem; null khi thêm mới */
  @Input() branch: ConditionBranch | null = null;
  /** Tên các nhánh khác của node — để báo trùng tên */
  @Input() otherNames: string[] = [];
  /** Tên gợi ý khi thêm mới (vd: "Nhánh 2") */
  @Input() suggestedName: string = '';

  @Output() saved = new EventEmitter<BranchModalResult>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('ruleScroll') ruleScroll?: ElementRef<HTMLDivElement>;

  name: string = '';
  rules: ConditionRuleItem[] = [];
  isSubmitted: boolean = false;
  variableOptions: ProcessVariableOption[] = [];
  operatorOptions: SelectOption[] = [];

  constructor(
    private variables: ProcessVariableService,
    private translate: TranslateService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['visible'] || !this.visible) return;
    // Mỗi lần mở: làm việc trên bản sao, chỉ phát ra khi bấm Lưu
    this.variableOptions = this.variables.getVariables(this.nodeId);
    this.operatorOptions = OPERATORS.map((op) => ({
      value: op,
      label: this.translate.instant('PROCESS_GRAPH.BRANCH_MODAL.OPERATORS.' + op),
    }));
    this.name = this.branch?.name || this.suggestedName;
    this.rules = (this.branch?.rules || []).map((r) => ({ ...r }));
    if (!this.rules.length && this.mode !== 'view') this.rules = [this.emptyRule()];
    this.isSubmitted = false;
  }

  get isReadonly(): boolean {
    return this.mode === 'view';
  }

  get titleKey(): string {
    return `PROCESS_GRAPH.BRANCH_MODAL.${this.mode === 'create' ? 'CREATE' : this.mode === 'edit' ? 'EDIT' : 'VIEW'}_TITLE`;
  }

  get nameError(): string {
    if (!this.isSubmitted) return '';
    const name = this.name.trim();
    if (!name) return this.translate.instant('PROCESS_GRAPH.DRAWER.VALIDATION.REQUIRED');
    const lower = name.toLowerCase();
    if (this.otherNames.some((n) => n.trim().toLowerCase() === lower)) {
      return this.translate.instant('PROCESS_GRAPH.BRANCH_MODAL.NAME_DUPLICATE');
    }
    return '';
  }

  get hasRuleError(): boolean {
    return this.isSubmitted && this.rules.some((r) => !this.isRuleComplete(r));
  }

  /** Biến + kiểu so sánh bắt buộc; giá trị so sánh không bắt buộc */
  isFieldInvalid(rule: ConditionRuleItem, field: keyof ConditionRuleItem): boolean {
    return this.isSubmitted && field !== 'value' && !String(rule[field] ?? '').trim();
  }

  variableCaption(variable: string): string {
    return this.variableOptions.find((o) => o.value === variable)?.displayName || '';
  }

  operatorLabel(op: string): string {
    return this.operatorOptions.find((o) => o.value === op)?.label || op || '—';
  }

  /** Thêm dòng rồi cuộn xuống dòng mới */
  addRule(): void {
    this.rules = [...this.rules, this.emptyRule()];
    setTimeout(() => {
      const el = this.ruleScroll?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  /** Chỉ 1 dòng thì ẩn nút xoá; từ 2 dòng trở lên thì dòng nào cũng xoá được */
  removeRule(index: number): void {
    if (this.rules.length < 2) return;
    this.rules = this.rules.filter((_, i) => i !== index);
  }

  save(): void {
    this.isSubmitted = true;
    if (this.nameError || this.hasRuleError) return;
    this.saved.emit({
      name: this.name.trim(),
      rules: this.rules.map((r) => ({ param: r.param, operator: r.operator, value: String(r.value).trim() })),
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  private isRuleComplete(rule: ConditionRuleItem): boolean {
    return !!(rule.param && rule.operator);
  }

  private emptyRule(): ConditionRuleItem {
    return { param: '', operator: 'EQ', value: '' };
  }
}
