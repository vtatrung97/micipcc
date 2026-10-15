import { ProcessTemplateItem } from '@core/services/ticket-call-flows/template.service';
import { ConditionRuleItem } from './node-property.model';

/** Loại kích hoạt quy trình (tab "Thông tin chung" › Cấu hình quy trình) */
export type ProcessTriggerType = 'MANUAL' | 'AUTO' | 'SCHEDULE' | 'HYBRID';

/** Đơn vị thời hạn xử lý: Giờ / Ngày / Tuần / Tháng (mặc định Ngày) */
export type ProcessSlaUnit = 'Giờ' | 'Ngày' | 'Tuần' | 'Tháng';
export const PROCESS_SLA_UNITS: ProcessSlaUnit[] = ['Giờ', 'Ngày', 'Tuần', 'Tháng'];

/** Giới hạn độ dài / giá trị các ô của tab Thông tin chung */
export const PROCESS_INFO_LIMITS = {
  name: 255,
  code: 255,
  description: 500,
  slaMax: 99999,
  conditionValue: 255,
};

/** Kích hoạt thủ công: biểu mẫu dữ liệu đầu vào */
export interface ProcessManualConfig {
  inputFormId: string | null;
}

/** Điều kiện kích hoạt (cùng cấu trúc rule với popup Điều kiện của gateway) */
export interface ProcessTriggerConditions {
  logicOperator: 'AND' | 'OR';
  rules: ConditionRuleItem[];
}

/** Kích hoạt tự động: API + điều kiện kích hoạt */
export interface ProcessAutoConfig {
  apiId: string | null;
  conditions: ProcessTriggerConditions;
}

/** Chu kỳ lặp khi mode = REPEAT (ô "Lặp lại") */
export type ProcessScheduleRepeat = 'DAILY' | 'WEEKLY' | 'MONTHLY';

/** Lặp lịch: Chạy một lần (ngày + giờ chạy) / Lặp lại (chu kỳ) */
export interface ProcessScheduleConfig {
  mode: 'ONCE' | 'REPEAT';
  /** YYYY-MM-DD */
  runDate: string;
  /** HH:mm */
  runTime: string;
  /** Chỉ dùng khi mode = REPEAT */
  repeat: ProcessScheduleRepeat | null;
  /** Ngày trong tuần khi repeat = WEEKLY: 1 = Thứ 2 … 7 = Chủ Nhật (ISO) */
  weekDays: number[];
  /** Ngày trong tháng (1–31) khi repeat = MONTHLY */
  monthDays: number[];
}

/** Hybrid: API + điều kiện kích hoạt + biểu mẫu dữ liệu đầu vào */
export interface ProcessHybridConfig {
  apiId: string | null;
  conditions: ProcessTriggerConditions;
  inputFormId: string | null;
}

/**
 * Dữ liệu tab "Thông tin chung": Thông tin cơ bản + Cấu hình quy trình.
 * Gửi kèm payload Lưu nháp (xem FLOW_SCHEMA mục 1).
 */
export interface ProcessInfo {
  name: string;
  code: string;
  /** Phân loại nhóm quy trình */
  category: string | null;
  description: string;
  triggerType: ProcessTriggerType | null;
  /** Chỉ có khi triggerType = MANUAL */
  manual: ProcessManualConfig;
  /** Chỉ có khi triggerType = AUTO */
  auto: ProcessAutoConfig;
  /** Chỉ có khi triggerType = SCHEDULE */
  schedule: ProcessScheduleConfig;
  /** Chỉ có khi triggerType = HYBRID */
  hybrid: ProcessHybridConfig;
  slaValue: number | null;
  slaUnit: ProcessSlaUnit;
}

/** Field bắt buộc → key lỗi i18n (PROCESS_GRAPH.INFO.ERRORS.*) */
export type ProcessInfoErrors = Partial<Record<
  'name' | 'code' | 'category' | 'triggerType' | 'manualFormId' | 'autoApiId' | 'autoConditions' | 'hybridConditions' | 'runDate' | 'runTime' | 'repeat' | 'weekDays' | 'monthDays' | 'apiId' | 'inputFormId' | 'sla',
  string
>>;

export function createEmptyProcessInfo(): ProcessInfo {
  return {
    name: '',
    code: '',
    category: null,
    description: '',
    triggerType: null,
    manual: { inputFormId: null },
    auto: { apiId: null, conditions: toTriggerConditions(null) },
    schedule: { mode: 'ONCE', runDate: '', runTime: '', repeat: null, weekDays: [], monthDays: [] },
    hybrid: { apiId: null, conditions: toTriggerConditions(null), inputFormId: null },
    slaValue: null,
    slaUnit: 'Ngày'
  };
}

/** Dựng ProcessInfo từ template đang mở (SLA cũ dạng "2h SLA" → 2 Giờ) */
export function processInfoFromTemplate(t: ProcessTemplateItem | null | undefined): ProcessInfo {
  const info = createEmptyProcessInfo();
  if (!t) return info;

  info.name = t.name || '';
  info.code = t.code || '';
  info.category = t.category || null;
  info.description = t.description || '';
  info.triggerType = (t.triggerType as ProcessTriggerType) || null;
  if (t.triggerConfig?.manual) info.manual = { ...info.manual, ...t.triggerConfig.manual };
  if (t.triggerConfig?.auto) {
    info.auto = {
      apiId: t.triggerConfig.auto.apiId ?? null,
      conditions: toTriggerConditions(t.triggerConfig.auto.conditions)
    };
  }
  if (t.triggerConfig?.schedule) {
    info.schedule = { ...info.schedule, ...t.triggerConfig.schedule, repeat: t.triggerConfig.schedule.repeat ?? null, weekDays: [...(t.triggerConfig.schedule.weekDays || [])], monthDays: [...(t.triggerConfig.schedule.monthDays || [])] };
  }
  if (t.triggerConfig?.hybrid) {
    info.hybrid = {
      apiId: t.triggerConfig.hybrid.apiId ?? null,
      conditions: toTriggerConditions(t.triggerConfig.hybrid.conditions),
      inputFormId: t.triggerConfig.hybrid.inputFormId ?? null
    };
  }

  if (t.slaValue != null) {
    info.slaValue = t.slaValue;
    info.slaUnit = PROCESS_SLA_UNITS.includes(t.slaUnit as ProcessSlaUnit) ? (t.slaUnit as ProcessSlaUnit) : 'Ngày';
  } else {
    const m = /^(\d+)\s*([hdm])/i.exec(t.sla || '');
    if (m) {
      info.slaValue = +m[1];
      info.slaUnit = m[2].toLowerCase() === 'h' ? 'Giờ' : 'Ngày';
    }
  }
  return info;
}

/** Kiểm tra các ô bắt buộc (dấu *). Trả về object rỗng nếu hợp lệ. */
export function validateProcessInfo(info: ProcessInfo): ProcessInfoErrors {
  const errors: ProcessInfoErrors = {};
  if (!info.name.trim()) errors.name = 'REQUIRED';
  if (!info.code.trim()) errors.code = 'REQUIRED';
  else if (!/^[A-Za-z0-9_-]+$/.test(info.code.trim())) errors.code = 'CODE_FORMAT';
  if (!info.category) errors.category = 'REQUIRED';
  if (!info.triggerType) errors.triggerType = 'REQUIRED';

  if (info.triggerType === 'MANUAL' && !info.manual.inputFormId) errors.manualFormId = 'REQUIRED';
  // Điều kiện kích hoạt: mọi dòng phải đủ Tham số + Kiểu so sánh + Giá trị
  if (info.triggerType === 'AUTO' && !info.auto.apiId) errors.autoApiId = 'REQUIRED';
  const autoRuleError = info.triggerType === 'AUTO' ? conditionRulesError(info.auto.conditions.rules) : null;
  if (autoRuleError) errors.autoConditions = autoRuleError;

  if (info.triggerType === 'SCHEDULE') {
    // Giờ chạy: giờ bắt buộc (00–23), phút để trống = 00
    const timeError = runTimeError(info.schedule.runTime);
    if (info.schedule.mode === 'REPEAT') {
      // Lặp lại: chọn tần suất → chọn xong mới hiện + bắt buộc Giờ chạy
      if (!info.schedule.repeat) errors.repeat = 'REQUIRED';
      else if (info.schedule.repeat === 'WEEKLY' && !info.schedule.weekDays?.length) errors.weekDays = 'REQUIRED';
      else if (info.schedule.repeat === 'MONTHLY' && !info.schedule.monthDays?.length) errors.monthDays = 'REQUIRED';
      else if (timeError) errors.runTime = timeError;
    } else {
      if (!info.schedule.runDate) errors.runDate = 'REQUIRED';
      if (timeError) errors.runTime = timeError;
    }
  }
  if (info.triggerType === 'HYBRID') {
    if (!info.hybrid.apiId) errors.apiId = 'REQUIRED';
    const hybridRuleError = conditionRulesError(info.hybrid.conditions.rules);
    if (hybridRuleError) errors.hybridConditions = hybridRuleError;
    if (!info.hybrid.inputFormId) errors.inputFormId = 'REQUIRED';
  }

  // Thời hạn xử lý: bắt buộc, số nguyên 1 – 99999
  if (info.slaValue == null) errors.sla = 'REQUIRED';
  else if (!Number.isInteger(info.slaValue) || info.slaValue < 1 || info.slaValue > PROCESS_INFO_LIMITS.slaMax) errors.sla = 'SLA_RANGE';
  return errors;
}

/** Phần "Thông tin chung" gửi kèm payload Lưu nháp */
export function toProcessInfoPayload(info: ProcessInfo) {
  return {
    code: info.code.trim(),
    category: info.category,
    triggerType: info.triggerType,
    triggerConfig:
      info.triggerType === 'MANUAL' ? { manual: { ...info.manual } }
      : info.triggerType === 'AUTO'
        ? { auto: { apiId: info.auto.apiId, conditions: { ...info.auto.conditions, rules: [...info.auto.conditions.rules] } } }
      : info.triggerType === 'SCHEDULE' ? { schedule: { ...info.schedule, runTime: normalizeRunTime(info.schedule.runTime) } }
      : info.triggerType === 'HYBRID'
        ? { hybrid: { ...info.hybrid, conditions: { ...info.hybrid.conditions, rules: [...info.hybrid.conditions.rules] } } }
      : null,
    slaValue: info.slaValue,
    slaUnit: info.slaUnit
  };
}

/** Sao chép điều kiện kích hoạt từ dữ liệu lưu; luôn có ít nhất 1 dòng */
function toTriggerConditions(src: { logicOperator?: 'AND' | 'OR'; rules?: ConditionRuleItem[] } | null | undefined): ProcessTriggerConditions {
  return {
    logicOperator: src?.logicOperator || 'AND',
    rules: src?.rules?.length ? src.rules.map(r => ({ ...r })) : [createEmptyConditionRule()]
  };
}

/** Một dòng điều kiện kích hoạt trống, mặc định kiểu so sánh "Bằng (=)" */
export function createEmptyConditionRule(): ConditionRuleItem {
  return { param: '', operator: 'EQ', value: '' };
}

/** Điều kiện kích hoạt: Tham số + Kiểu so sánh bắt buộc, Giá trị so sánh không bắt buộc */
export function conditionRulesError(rules: ConditionRuleItem[]): string | null {
  if (!rules.length || rules.some(r => !r.param)) return 'PARAM_REQUIRED';
  if (rules.some(r => !r.operator)) return 'OPERATOR_REQUIRED';
  return null;
}

/** Lỗi giờ chạy "H:m": thiếu giờ → REQUIRED, ngoài 0–23 / 0–59 → TIME_FORMAT */
function runTimeError(runTime: string): string | null {
  const [h = '', m = ''] = (runTime || '').split(':');
  if (!h) return 'REQUIRED';
  if (+h > 23 || (m !== '' && +m > 59)) return 'TIME_FORMAT';
  return null;
}

/** Chuẩn hoá giờ chạy về HH:mm (phút trống = 00) */
export function normalizeRunTime(runTime: string): string {
  const [h = '', m = ''] = (runTime || '').split(':');
  return h ? `${h.padStart(2, '0')}:${(m || '0').padStart(2, '0')}` : '';
}
