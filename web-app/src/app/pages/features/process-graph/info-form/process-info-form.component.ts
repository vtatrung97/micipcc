import { Component, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import {
  PROCESS_CATEGORY_OPTIONS,
  PROCESS_HYBRID_API_OPTIONS,
  PROCESS_INPUT_FORM_OPTIONS
} from '../config/process-info.config';
import { ProcessInfo, ProcessInfoErrors, ProcessTriggerType } from '../models/process-info.model';

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
  slaUnitOptions: SelectOption[] = [];

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

  /**
   * Ô "Điều kiện kích hoạt" (Kích hoạt tự động).
   * ⚠ Chưa có design popup cài điều kiện → tạm thời chưa mở gì. Khi có design: mở popup,
   * ghi kết quả vào info.auto.conditions (logicOperator + rules param/operator/value).
   */
  openTriggerConditions(): void {
    // TODO: mở popup cài điều kiện kích hoạt khi có design
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
    // Giá trị giữ nguyên chuỗi tiếng Việt như slaUnit của node USER_TASK (FLOW_SCHEMA mục 4)
    this.slaUnitOptions = [
      { value: 'Ngày', label: t('SLA_UNITS.DAY') },
      { value: 'Giờ', label: t('SLA_UNITS.HOUR') },
      { value: 'Phút', label: t('SLA_UNITS.MINUTE') }
    ];
  }
}
