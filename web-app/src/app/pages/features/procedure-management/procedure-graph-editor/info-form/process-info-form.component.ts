import { Component, HostBinding, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import {
  PROCESS_API_INPUT_OPTIONS,
  PROCESS_HYBRID_API_OPTIONS,
  PROCESS_INPUT_FORM_OPTIONS
} from '../config/process-info.config';
import { ProcessCategoryService } from '@core/services/ticket-call-flows/process-category.service';
import { PROCESS_CATEGORY_MAX_LENGTH } from '@core/services/ticket-call-flows/process-category.constant';
import {
  PROCESS_INFO_LIMITS,
  PROCESS_SLA_UNITS,
  ProcessInfo,
  ProcessInfoErrors,
  ProcessTriggerType,
  createEmptyConditionRule
} from '../models/process-info.model';
import { ConditionRuleItem } from '../models/node-property.model';

const EMPTY_OPTIONS: SelectOption[] = [];
/** Kiểu so sánh của điều kiện kích hoạt (thứ tự theo tài liệu) */
export const CONDITION_OPERATORS = ['EQ', 'NEQ', 'LT', 'GT', 'LTE', 'GTE', 'IN', 'NOT_IN'];

function clampDigits(value: string, max: number): string {
  const digits = value.replace(/\D/g, '').slice(0, 2);
  return digits && +digits > max ? String(max) : digits;
}

function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Tab "Thông tin chung": card Thông tin cơ bản + card Cấu hình quy trình (kích hoạt, SLA).
 * Ghi thẳng vào `info` (store.processInfo); GraphEditorComponent validate khi Lưu nháp / Ban hành.
 */
@Component({
  selector: 'app-process-info-form',
  templateUrl: './process-info-form.component.html',
  styleUrls: ['./process-info-form.component.scss']
})
export class ProcessInfoFormComponent implements OnDestroy {
  @Input() info!: ProcessInfo;
  @Input() errors: ProcessInfoErrors = {};
  /** Mã quy trình chỉ sửa được khi tạo mới */
  @Input() codeEditable: boolean = true;
  /** Chỉ xem (popup xem quy trình): khoá mọi ô, nền xám */
  @HostBinding('class.is-readonly')
  @Input() readonly: boolean = false;

  readonly limits = { ...PROCESS_INFO_LIMITS, category: PROCESS_CATEGORY_MAX_LENGTH };
  /** Hôm nay (YYYY-MM-DD) — "Chạy một lần" không cho chọn ngày quá khứ */
  readonly today = toIsoDate(new Date());
  categoryOptions: SelectOption[] = [];

  /** Popup "Thêm mới nhóm quy trình" */
  isCategoryModalOpen: boolean = false;
  /** Tên gợi ý cho popup = từ khoá đang tìm trong dropdown */
  categoryDraftName: string = '';
  readonly apiOptions = PROCESS_HYBRID_API_OPTIONS;
  readonly inputFormOptions = PROCESS_INPUT_FORM_OPTIONS;

  triggerOptions: SelectOption[] = [];
  scheduleModeOptions: SelectOption[] = [];
  /** Chu kỳ của "Lặp lại" */
  repeatOptions: SelectOption[] = [];
  /** Thứ trong tuần cho "Hàng tuần": 1 = Thứ 2 … 7 = Chủ Nhật */
  weekDayOptions: SelectOption[] = [];
  slaUnitOptions: SelectOption[] = [];
  /** Tham số + kiểu so sánh của điều kiện kích hoạt (dùng chung bộ với popup Điều kiện của gateway) */
  conditionOperatorOptions: SelectOption[] = [];

  private langSub: Subscription;
  private categorySub: Subscription;

  constructor(
    private translate: TranslateService,
    private categories: ProcessCategoryService,
  ) {
    this.buildOptions();
    this.langSub = this.translate.onLangChange.subscribe(() => this.buildOptions());
    this.categorySub = this.categories.categories$.subscribe((list) => {
      this.categoryOptions = list.map((c) => ({ value: c, label: c }));
    });
  }

  ngOnDestroy(): void {
    this.langSub.unsubscribe();
    this.categorySub.unsubscribe();
  }

  /**
   * Thông báo lỗi đã dịch của một field (rỗng nếu hợp lệ).
   * Lỗi bỏ trống dùng câu riêng của từng trường (vd: "Tên quy trình không được để trống").
   */
  error(field: keyof ProcessInfoErrors): string {
    const code = this.errors[field];
    if (!code) return '';
    const fieldKey = `PROCESS_GRAPH.INFO.REQUIRED_MESSAGES.${field}`;
    if (code === 'REQUIRED') {
      const message = this.translate.instant(fieldKey);
      if (message !== fieldKey) return message;
    }
    return this.translate.instant('PROCESS_GRAPH.INFO.ERRORS.' + code);
  }

  /** Tham số kích hoạt = danh sách đầu vào của API đã chọn */
  apiInputOptions(apiId: string | null): SelectOption[] {
    return (apiId && PROCESS_API_INPUT_OPTIONS[apiId]) || EMPTY_OPTIONS;
  }

  /** Đổi API: bỏ tham số không còn thuộc API mới */
  onApiChange(rules: ConditionRuleItem[], apiId: string | null): void {
    const valid = new Set(this.apiInputOptions(apiId).map(o => o.value));
    rules.forEach(r => { if (r.param && !valid.has(r.param)) r.param = ''; });
  }

  /** IN / NOT IN: nhập nhiều giá trị cách nhau bởi dấu phẩy */
  isMultiValue(operator: string): boolean {
    return operator === 'IN' || operator === 'NOT_IN';
  }

  // ===== Thêm nhóm quy trình mới (popup) =====
  openCategoryModal(keyword: string, closeDropdown: () => void): void {
    this.categoryDraftName = (keyword || '').trim();
    closeDropdown();
    this.isCategoryModalOpen = true;
  }

  /** Popup đã thêm nhóm → chọn luôn nhóm vừa tạo */
  onCategorySaved(name: string): void {
    this.info.category = name;
    this.isCategoryModalOpen = false;
  }

  // ===== SLA: ô số ⇄ number =====
  get slaText(): string {
    return this.info.slaValue == null ? '' : String(this.info.slaValue);
  }

  set slaText(value: string) {
    const n = parseInt(String(value).replace(/\D/g, ''), 10);
    this.info.slaValue = isNaN(n) ? null : n;
  }

  // ===== Giờ chạy: 2 ô hh / mm ⇄ "HH:mm" =====
  get runHour(): string {
    return this.info.schedule.runTime.split(':')[0] || '';
  }

  set runHour(value: string) {
    this.setRunTime(value, this.runMinute);
  }

  get runMinute(): string {
    return this.info.schedule.runTime.split(':')[1] || '';
  }

  set runMinute(value: string) {
    this.setRunTime(this.runHour, value);
  }

  // ===== Lọc ký tự khi gõ =====
  /** Mã quy trình: chỉ chữ không dấu, số, "_" và "-" */
  readonly codeFilter = (v: string) => v.replace(/[^A-Za-z0-9_-]/g, '');
  readonly digitFilter = (v: string) => v.replace(/\D/g, '');
  /** Giờ 0–23, phút 0–59: gõ quá thì đưa về giá trị lớn nhất */
  readonly hourFilter = (v: string) => clampDigits(v, 23);
  readonly minuteFilter = (v: string) => clampDigits(v, 59);

  // ===== Điều kiện kích hoạt (Tự động / Hybrid) =====
  /** Thêm một dòng điều kiện trống */
  addConditionRule(rules: ConditionRuleItem[]): void {
    rules.push(createEmptyConditionRule());
  }

  /** Xoá dòng điều kiện — luôn giữ lại ít nhất 1 dòng (dòng đầu không có nút xoá) */
  removeConditionRule(rules: ConditionRuleItem[], index: number): void {
    if (rules.length > 1) rules.splice(index, 1);
  }

  /** Tham số / kiểu so sánh còn trống → viền đỏ khi form đang báo lỗi điều kiện */
  isRuleFieldInvalid(rule: ConditionRuleItem, field: keyof ConditionRuleItem, errorKey: keyof ProcessInfoErrors): boolean {
    return !!this.errors[errorKey] && !String(rule[field] ?? '').trim();
  }

  isTrigger(option: SelectOption, type: ProcessTriggerType): boolean {
    return option.value === type;
  }

  private setRunTime(hour: string, minute: string): void {
    const h = String(hour || '').replace(/\D/g, '').slice(0, 2);
    const m = String(minute || '').replace(/\D/g, '').slice(0, 2);
    this.info.schedule.runTime = h || m ? `${h}:${m}` : '';
  }

  private buildOptions(): void {
    const t = (key: string) => this.translate.instant('PROCESS_GRAPH.INFO.' + key);
    this.triggerOptions = (['MANUAL', 'AUTO', 'SCHEDULE', 'HYBRID'] as ProcessTriggerType[])
      .map(v => ({ value: v, label: t('TRIGGERS.' + v) }));
    this.scheduleModeOptions = [
      { value: 'ONCE', label: t('SCHEDULE_MODES.ONCE') },
      { value: 'REPEAT', label: t('SCHEDULE_MODES.REPEAT') }
    ];
    this.repeatOptions = (['DAILY', 'WEEKLY', 'MONTHLY'] as const)
      .map(v => ({ value: v, label: t('REPEAT_OPTIONS.' + v) }));
    this.weekDayOptions = [1, 2, 3, 4, 5, 6, 7].map(v => ({ value: v, label: t('WEEK_DAYS.' + v) }));
    // Kiểu so sánh theo tài liệu: = <> < > <= >= IN NOT IN
    this.conditionOperatorOptions = CONDITION_OPERATORS
      .map(v => ({ value: v, label: this.translate.instant('PROCESS_GRAPH.CONDITION_OPERATORS.' + v) }));
    // Giá trị lưu là chuỗi tiếng Việt (Giờ / Ngày / Tuần / Tháng)
    const unitKeys: Record<string, string> = { 'Giờ': 'HOUR', 'Ngày': 'DAY', 'Tuần': 'WEEK', 'Tháng': 'MONTH' };
    this.slaUnitOptions = PROCESS_SLA_UNITS.map(u => ({ value: u, label: t('SLA_UNITS.' + unitKeys[u]) }));
  }
}
