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

/** Kích hoạt tự động: API + điều kiện kích hoạt (cùng cấu trúc rule với popup Điều kiện của gateway) */
export interface ProcessAutoConfig {
  apiId: string | null;
  conditions: { logicOperator: 'AND' | 'OR'; rules: ConditionRuleItem[] };
}

/** Lặp lịch: Chạy một lần / Lặp lại + ngày giờ chạy */
export interface ProcessScheduleConfig {
  mode: 'ONCE' | 'REPEAT';
  /** YYYY-MM-DD */
  runDate: string;
  /** HH:mm */
  runTime: string;
}

/** Hybrid: API + biểu mẫu dữ liệu đầu vào */
export interface ProcessHybridConfig {
  apiId: string | null;
  inputFormId: string | null;
}

/**
 * Dữ liệu tab "Thông tin chung" (Figma 264:42051): Thông tin cơ bản + Cấu hình quy trình.
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
  'name' | 'code' | 'category' | 'triggerType' | 'manualFormId' | 'autoApiId' | 'runDate' | 'runTime' | 'apiId' | 'inputFormId' | 'sla',
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
    auto: { apiId: null, conditions: { logicOperator: 'AND', rules: [] } },
    schedule: { mode: 'ONCE', runDate: '', runTime: '' },
    hybrid: { apiId: null, inputFormId: null },
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
      conditions: {
        logicOperator: t.triggerConfig.auto.conditions?.logicOperator || 'AND',
        rules: [...(t.triggerConfig.auto.conditions?.rules || [])]
      }
    };
  }
  if (t.triggerConfig?.schedule) info.schedule = { ...info.schedule, ...t.triggerConfig.schedule };
  if (t.triggerConfig?.hybrid) info.hybrid = { ...info.hybrid, ...t.triggerConfig.hybrid };

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

/** Kiểm tra các ô có dấu * trên design. Trả về object rỗng nếu hợp lệ. */
export function validateProcessInfo(info: ProcessInfo): ProcessInfoErrors {
  const errors: ProcessInfoErrors = {};
  if (!info.name.trim()) errors.name = 'REQUIRED';
  if (!info.code.trim()) errors.code = 'REQUIRED';
  else if (!/^[A-Za-z0-9_-]+$/.test(info.code.trim())) errors.code = 'CODE_FORMAT';
  if (!info.category) errors.category = 'REQUIRED';
  if (!info.triggerType) errors.triggerType = 'REQUIRED';

  if (info.triggerType === 'MANUAL' && !info.manual.inputFormId) errors.manualFormId = 'REQUIRED';
  // ⚠ "Điều kiện kích hoạt" có dấu * nhưng chưa có design popup cài điều kiện → tạm chưa bắt buộc
  if (info.triggerType === 'AUTO' && !info.auto.apiId) errors.autoApiId = 'REQUIRED';

  if (info.triggerType === 'SCHEDULE') {
    if (!info.schedule.runDate) errors.runDate = 'REQUIRED';
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(info.schedule.runTime)) errors.runTime = 'TIME_FORMAT';
  }
  if (info.triggerType === 'HYBRID') {
    if (!info.hybrid.apiId) errors.apiId = 'REQUIRED';
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
      : info.triggerType === 'HYBRID' ? { hybrid: { ...info.hybrid } }
      : null,
    slaValue: info.slaValue,
    slaUnit: info.slaUnit
  };
}
