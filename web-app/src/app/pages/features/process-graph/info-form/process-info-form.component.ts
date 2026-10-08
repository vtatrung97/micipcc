import { Component, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import {
  PROCESS_CATEGORY_OPTIONS,
  PROCESS_HYBRID_API_OPTIONS,
  PROCESS_INPUT_FORM_OPTIONS
} from '../config/process-info.config';
import { ProcessInfo, ProcessInfoErrors, ProcessTriggerType, createEmptyConditionRule } from '../models/process-info.model';
import { ConditionRuleItem } from '../models/node-property.model';

/**
 * Tab "Thông tin chung" của Canvas Builder (Figma 264:42051):
 * card "Thông tin cơ bản" + card "Cấu hình quy trình" (Loại kích hoạt, SLA).
 * Ghi thẳng vào `info` (store.processInfo); validate do GraphEditorComponent gọi khi Lưu nháp / Ban hành.
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

  readonly categoryOptions = PROCESS_CATEGORY_OPTIONS;
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
  conditionParamOptions: SelectOption[] = [];
  conditionOperatorOptions: SelectOption[] = [];

  private langSub: Subscription;

  constructor(private translate: TranslateService) {
    this.buildOptions();
    this.langSub = this.translate.onLangChange.subscribe(() => this.buildOptions());
  }

  ngOnDestroy(): void {
    this.langSub.unsubscribe();
  }

  /** Thông báo lỗi đã dịch của một field (rỗng nếu hợp lệ) */
  error(field: keyof ProcessInfoErrors): string {
    const code = this.errors[field];
    return code ? this.translate.instant('PROCESS_GRAPH.INFO.ERRORS.' + code) : '';
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

  /** Mã quy trình: viết hoa, bỏ khoảng trắng */
  onCodeChange(value: string): void {
    this.info.code = (value || '').toUpperCase().replace(/\s+/g, '_');
  }

  // ===== Điều kiện kích hoạt (Kích hoạt tự động, Figma 364:24387) =====
  /** Thêm một dòng điều kiện trống */
  addConditionRule(): void {
    this.info.auto.conditions.rules.push(createEmptyConditionRule());
  }

  /** Xoá dòng điều kiện — luôn giữ lại ít nhất 1 dòng (dòng đầu không có nút xoá) */
  removeConditionRule(index: number): void {
    const rules = this.info.auto.conditions.rules;
    if (rules.length > 1) rules.splice(index, 1);
  }

  /** Ô trống của một dòng → viền đỏ khi form đang báo lỗi điều kiện */
  isRuleFieldInvalid(rule: ConditionRuleItem, field: keyof ConditionRuleItem): boolean {
    return !!this.errors.autoConditions && !String(rule[field] ?? '').trim();
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
    const c = (key: string) => this.translate.instant('PROCESS_GRAPH.CONDITION_MODAL.' + key);
    this.conditionParamOptions = [
      { value: '.priority', label: c('PARAMS.PRIORITY') },
      { value: 'paknID', label: c('PARAMS.PAKN_ID') },
      { value: 'complaintType', label: c('PARAMS.COMPLAINT_TYPE') },
      { value: 'code', label: c('PARAMS.CODE') },
      { value: 'startedAt', label: c('PARAMS.STARTED_AT') }
    ];
    // Toán tử của điều kiện kích hoạt: =, >=, <=, >, <, !=
    this.conditionOperatorOptions = ['EQ', 'GTE', 'LTE', 'GT', 'LT', 'NEQ']
      .map(v => ({ value: v, label: c('OPERATORS.' + v) }));
    // Giá trị giữ nguyên chuỗi tiếng Việt như slaUnit của node USER_TASK (FLOW_SCHEMA mục 4)
    this.slaUnitOptions = [
      { value: 'Ngày', label: t('SLA_UNITS.DAY') },
      { value: 'Giờ', label: t('SLA_UNITS.HOUR') },
      { value: 'Phút', label: t('SLA_UNITS.MINUTE') }
    ];
  }
}
