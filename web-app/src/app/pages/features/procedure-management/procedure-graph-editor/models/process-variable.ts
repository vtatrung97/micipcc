import { NodePropertyModel } from './node-property.model';
import { ProcessTriggerType } from './process-info.model';

/** Giới hạn ô của bảng khai báo biến quy trình */
export const PROCESS_VARIABLE_LIMITS = {
  name: 50,
  displayName: 50,
  fixedValue: 50,
};

/** Tên biến quy trình: chỉ chữ không dấu, số và "_" */
export const PROCESS_VARIABLE_PATTERN = /^[A-Za-z0-9_]+$/;
export const variableNameFilter = (value: string): string => value.replace(/[^A-Za-z0-9_]/g, '');

export interface DeclaredVariable {
  name: string;
  displayName: string;
}

/** Field chứa bảng khai báo biến của từng loại bước */
export type VariableTableField = 'startVariables' | 'formOutputs' | 'apiOutputs' | 'subProcessOutputs';

/**
 * Bước được khai báo biến quy trình mới:
 * Bắt đầu (Khởi tạo biến) · Giao việc / Tác vụ hệ thống / Quy trình con (Dữ liệu đầu ra).
 */
export function variableTableField(type: string | undefined): VariableTableField | null {
  switch (type) {
    case 'START': return 'startVariables';
    case 'USER_TASK': return 'formOutputs';
    case 'SYSTEM_TASK': return 'apiOutputs';
    case 'SUB_PROCESS': return 'subProcessOutputs';
    default: return null;
  }
}

/** Một dòng khai báo biến, quy về dạng chung để kiểm tra */
interface VariableRowView {
  variable: string;
  displayName: string;
  /** Các ô nguồn dữ liệu bắt buộc của dòng (trường biểu mẫu / trường API / giá trị cố định / biến quy trình con) */
  sources: unknown[];
}

function rowsOf(data: NodePropertyModel, triggerType?: ProcessTriggerType | null): VariableRowView[] {
  switch (data.type) {
    case 'START':
      return (data.startVariables || []).map((r) => ({
        variable: r.variable,
        displayName: r.displayName,
        sources: triggerType === 'HYBRID' ? [r.apiField, r.formField]
          : triggerType === 'SCHEDULE' ? [r.fixedValue]
          : triggerType ? [r.formField] : [],
      }));
    case 'USER_TASK':
      return (data.formOutputs || []).map((r) => ({ variable: r.variable, displayName: r.displayName, sources: [r.formField] }));
    case 'SYSTEM_TASK':
      return (data.apiOutputs || []).map((r) => ({ variable: r.variable, displayName: r.displayName, sources: [r.apiField] }));
    case 'SUB_PROCESS':
      return (data.subProcessOutputs || []).map((r) => ({ variable: r.variable, displayName: r.displayName, sources: [r.subField] }));
    default:
      return [];
  }
}

const isBlank = (value: unknown): boolean => value === null || value === undefined || String(value).trim() === '';

/** Biến quy trình do một bước khai báo (bỏ dòng chưa nhập tên biến) */
export function declaredVariables(data: NodePropertyModel): DeclaredVariable[] {
  return rowsOf(data)
    .filter((r) => !isBlank(r.variable))
    .map((r) => ({ name: r.variable.trim(), displayName: (r.displayName || '').trim() }));
}

/** Lỗi từng ô của một dòng khai báo biến */
export interface VariableRowError {
  variable?: 'REQUIRED' | 'VAR_FORMAT' | 'VAR_DUPLICATE';
  displayName?: boolean;
  source?: boolean;
}

/**
 * Kiểm tra bảng khai báo biến: dòng trống hoàn toàn được bỏ qua; dòng đã nhập thì
 * tên biến bắt buộc, đúng định dạng, không trùng biến khác trong quy trình; nguồn + tên hiển thị bắt buộc.
 * `code` = lỗi tiêu biểu để hiện dưới bảng (trùng > định dạng > bỏ trống).
 */
export function validateVariableRows(
  data: NodePropertyModel,
  otherNames: string[],
  triggerType?: ProcessTriggerType | null,
): { rows: VariableRowError[]; code: string | null } {
  const rows = rowsOf(data, triggerType);
  const taken = new Set(otherNames.map((n) => n.toLowerCase()));
  const seen = new Set<string>();
  let dup = false;
  let format = false;
  let required = false;

  const result = rows.map((r) => {
    const err: VariableRowError = {};
    const name = (r.variable || '').trim();
    const isEmptyRow = !name && isBlank(r.displayName) && r.sources.every(isBlank);
    if (isEmptyRow) return err;

    if (!name) err.variable = 'REQUIRED';
    else if (!PROCESS_VARIABLE_PATTERN.test(name) || name.length > PROCESS_VARIABLE_LIMITS.name) err.variable = 'VAR_FORMAT';
    else if (taken.has(name.toLowerCase()) || seen.has(name.toLowerCase())) err.variable = 'VAR_DUPLICATE';
    if (name) seen.add(name.toLowerCase());
    if (isBlank(r.displayName)) err.displayName = true;
    if (r.sources.some(isBlank)) err.source = true;

    dup = dup || err.variable === 'VAR_DUPLICATE';
    format = format || err.variable === 'VAR_FORMAT';
    required = required || err.variable === 'REQUIRED' || !!err.displayName || !!err.source;
    return err;
  });

  const code = dup ? 'VAR_DUPLICATE' : format ? 'VAR_FORMAT' : required ? 'VAR_REQUIRED' : null;
  return { rows: result, code };
}

/**
 * Bỏ mọi chỗ một bước đang dùng các biến đã bị xoá: dòng đầu vào / kết quả chọn biến đó,
 * điều kiện nhánh dùng biến đó, người nhận thông báo là biến đó. Trả về data mới + số chỗ đã bỏ.
 */
export function removeVariableReferences(data: NodePropertyModel, removed: Set<string>): { data: NodePropertyModel; count: number } {
  let count = 0;
  const keep = <T extends { variable?: string | null }>(rows: T[] | undefined): T[] | undefined => {
    if (!rows) return rows;
    const next = rows.filter((r) => !(r.variable && removed.has(r.variable)));
    count += rows.length - next.length;
    return next;
  };
  const next: NodePropertyModel = { ...data };
  next.formInputs = keep(data.formInputs);
  next.apiInputs = keep(data.apiInputs);
  next.subProcessInputs = keep(data.subProcessInputs);
  next.endResults = keep(data.endResults);
  if (data.branches) {
    next.branches = data.branches.map((b) => {
      if (!b.rules) return b;
      const rules = b.rules.filter((r) => !(r.param && removed.has(r.param)));
      count += b.rules.length - rules.length;
      return rules.length === b.rules.length ? b : { ...b, rules };
    });
  }
  if (data.notificationSource === 'VARIABLE' && data.notificationRecipient && removed.has(data.notificationRecipient)) {
    next.notificationRecipient = undefined;
    count++;
  }
  return { data: next, count };
}
