import { ProcessTemplateItem } from '@core/services/template.service';
import { ConditionRuleItem } from './node-property.model';

/** Loại kích hoạt quy trình (tab "Thông tin chung" › Cấu hình quy trình) */
export type ProcessTriggerType = 'MANUAL' | 'AUTO' | 'SCHEDULE' | 'HYBRID';

/** Đơn vị SLA — cùng bộ giá trị với `slaUnit` của node USER_TASK (FLOW_SCHEMA mục 4) */
export type ProcessSlaUnit = 'Ngày' | 'Giờ' | 'Phút';

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
    info.slaUnit = (t.slaUnit as ProcessSlaUnit) || 'Ngày';
  } else {
    const m = /^(\d+)\s*([hdm])/i.exec(t.sla || '');
    if (m) {
      info.slaValue = +m[1];
      info.slaUnit = m[2].toLowerCase() === 'd' ? 'Ngày' : m[2].toLowerCase() === 'm' ? 'Phút' : 'Giờ';
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
  if (info.triggerType === 'AUTO' && !isConditionRulesComplete(info.auto.conditions.rules)) errors.autoConditions = 'REQUIRED';

  if (info.triggerType === 'SCHEDULE') {
    const validTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(info.schedule.runTime);
    if (info.schedule.mode === 'REPEAT') {
      // Lặp lại: chọn chu kỳ → chọn xong mới hiện + bắt buộc Giờ chạy
      if (!info.schedule.repeat) errors.repeat = 'REQUIRED';
      else if (info.schedule.repeat === 'WEEKLY' && !info.schedule.weekDays?.length) errors.weekDays = 'REQUIRED';
      else if (info.schedule.repeat === 'MONTHLY' && !info.schedule.monthDays?.length) errors.monthDays = 'REQUIRED';
      else if (!validTime) errors.runTime = 'TIME_FORMAT';
    } else {
      if (!info.schedule.runDate) errors.runDate = 'REQUIRED';
      if (!validTime) errors.runTime = 'TIME_FORMAT';
    }
  }
  if (info.triggerType === 'HYBRID') {
    if (!info.hybrid.apiId) errors.apiId = 'REQUIRED';
    if (!isConditionRulesComplete(info.hybrid.conditions.rules)) errors.hybridConditions = 'REQUIRED';
    if (!info.hybrid.inputFormId) errors.inputFormId = 'REQUIRED';
  }

  if (info.slaValue == null || !(info.slaValue > 0)) errors.sla = 'SLA_POSITIVE';
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
      : info.triggerType === 'SCHEDULE' ? { schedule: { ...info.schedule } }
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

/** Một dòng đã nhập đủ Tham số + Kiểu so sánh + Giá trị */
export function isConditionRuleComplete(rule: ConditionRuleItem): boolean {
  return !!(rule.param && rule.operator && String(rule.value ?? '').trim());
}

/** Có ít nhất 1 dòng và mọi dòng đều nhập đủ */
export function isConditionRulesComplete(rules: ConditionRuleItem[]): boolean {
  return rules.length > 0 && rules.every(isConditionRuleComplete);
}
