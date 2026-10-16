import { NodePropertyModel } from './node-property.model';
import { NodeType, isGatewayType } from './node-type';
import { NODE_KEY_PATTERN } from './node-key';
import { ProcessTriggerType } from './process-info.model';
import { VariableRowError, validateVariableRows, variableTableField } from './process-variable';

/** Giới hạn số của drawer bước */
export const NODE_NUMBER_LIMITS = {
  slaMax: 99999,
  timeoutMax: 99999,
  retryMax: 99,
};

/**
 * Lỗi theo field (key trùng tên field trong NodePropertyModel).
 * `true` = bỏ trống; chuỗi = mã lỗi riêng (vd: nodeKey: 'KEY_FORMAT' | 'KEY_DUPLICATE').
 */
export type NodeFieldErrors = Partial<Record<keyof NodePropertyModel, boolean | string>> & {
  /** Lỗi từng dòng của bảng khai báo biến (chỉ có khi bảng đang lỗi) */
  variableRows?: VariableRowError[];
  /** Lỗi từng ô của bảng dữ liệu đầu vào / kết quả: dòng → tên cột → true */
  inputRows?: Array<Record<string, boolean>>;
};

/** Ngữ cảnh kiểm tra cần cả quy trình (vd: mã bước của các bước khác) */
export interface NodeValidationContext {
  otherNodeKeys?: string[];
  /** Tên biến đã khai báo ở các bước khác — biến mới không được trùng */
  otherVariableNames?: string[];
  /** Loại kích hoạt (quyết định cột nguồn của bảng biến ở node Bắt đầu) */
  triggerType?: ProcessTriggerType | null;
}

/** Loại bước có ô Mã bước trong drawer */
const KEYED_TYPES: NodeType[] = ['USER_TASK', 'SYSTEM_TASK', 'SUB_PROCESS', 'NOTIFICATION', 'GATEWAY_EXCLUSIVE', 'GATEWAY_PARALLEL', 'GATEWAY_INCLUSIVE'];

const isBlank = (value: unknown): boolean => value === null || value === undefined || String(value).trim() === '';

/** Kiểm tra các ô có dấu * trong drawer theo loại bước. Trả về object rỗng nếu hợp lệ. */
export function validateNodeProps(props: NodePropertyModel, ctx: NodeValidationContext = {}): NodeFieldErrors {
  const errors: NodeFieldErrors = {};
  const require = (field: keyof NodePropertyModel) => {
    if (isBlank(props[field])) errors[field] = true;
  };

  // Mã bước: bắt buộc, chỉ chữ / số / "_", không trùng bước khác
  if (KEYED_TYPES.includes(props.type)) {
    const key = (props.nodeKey || '').trim();
    if (!key) errors.nodeKey = true;
    else if (!NODE_KEY_PATTERN.test(key)) errors.nodeKey = 'KEY_FORMAT';
    else if ((ctx.otherNodeKeys || []).some((k) => (k || '').toLowerCase() === key.toLowerCase())) errors.nodeKey = 'KEY_DUPLICATE';
  }

  // Bảng khai báo biến mới (Bắt đầu / đầu ra Giao việc, Tác vụ hệ thống, Quy trình con)
  const varField = variableTableField(props.type);
  if (varField) {
    const check = validateVariableRows(props, ctx.otherVariableNames || [], ctx.triggerType);
    if (check.code) {
      errors[varField] = check.code;
      errors.variableRows = check.rows;
    }
  }

  switch (props.type) {
    case 'USER_TASK': {
      require('label');
      // Thời hạn xử lý: bắt buộc, số nguyên 1 – 99999
      const sla = errorOfInt(props.slaSeconds, 1, NODE_NUMBER_LIMITS.slaMax, true);
      if (sla) errors.slaSeconds = sla === 'REQUIRED' ? 'SLA_REQUIRED' : 'SLA_RANGE';
      require('department');
      if (!props.agents?.length) errors.agents = true;
      require('formTemplate');
      // Dữ liệu đầu vào không bắt buộc; dòng đã khai báo phải chọn biến, tích Ánh xạ thì phải chọn trường biểu mẫu
      const rows = (props.formInputs || []).map((r) => {
        const used = !isBlank(r.variable) || r.mapped;
        return { variable: used && isBlank(r.variable), formField: !!r.mapped && isBlank(r.formField) };
      });
      setInputRows(errors, 'formInputs', rows);
      break;
    }
    case 'SYSTEM_TASK': {
      require('label');
      require('integratedSystem');
      require('selectedApi');
      const timeout = errorOfInt(props.timeoutSeconds, 1, NODE_NUMBER_LIMITS.timeoutMax, true);
      if (timeout) errors.timeoutSeconds = timeout === 'REQUIRED' ? true : 'TIMEOUT_RANGE';
      // Retry không bắt buộc: số nguyên dương tối đa 2 chữ số
      if (errorOfInt(props.retryCount, 1, NODE_NUMBER_LIMITS.retryMax, false)) errors.retryCount = 'RETRY_RANGE';
      // Đầu vào: dòng đã khai báo phải đủ Trường dữ liệu API + Biến quy trình
      setInputRows(errors, 'apiInputs', pairRows(props.apiInputs || [], ['apiParam', 'variable']));
      break;
    }
    case 'SUB_PROCESS': {
      require('label');
      require('subProcessTemplateId');
      // Đầu vào: bắt buộc ít nhất 1 dòng đủ Đầu vào quy trình con + Biến quy trình
      const inputs = props.subProcessInputs || [];
      setInputRows(errors, 'subProcessInputs', pairRows(inputs, ['subField', 'variable']));
      const hasComplete = inputs.some((r) => !isBlank(r.subField) && !isBlank(r.variable));
      if (!errors.subProcessInputs && !hasComplete) {
        errors.subProcessInputs = 'INPUT_MIN_ONE';
        errors.inputRows = inputs.map(() => ({ subField: true, variable: true }));
      }
      break;
    }
    case 'NOTIFICATION':
      require('label');
      require('notificationChannel');
      require('notificationSource');
      // Người nhận: 1 biến quy trình hoặc ít nhất 1 người dùng hệ thống
      if (props.notificationSource === 'USER') {
        if (!props.notificationRecipients?.length) errors.notificationRecipients = true;
      } else {
        require('notificationRecipient');
      }
      require('notificationTitle');
      require('notificationContent');
      break;
    case 'END':
      require('endFormTemplate');
      // Kết quả không bắt buộc; dòng đã khai báo phải đủ Biến quy trình + Trường biểu mẫu
      setInputRows(errors, 'endResults', pairRows(props.endResults || [], ['variable', 'formField']));
      break;
    default:
      if (isGatewayType(props.type)) require('label');
  }
  return errors;
}

/** Số nguyên trong [min, max]; trống → REQUIRED nếu bắt buộc */
function errorOfInt(value: unknown, min: number, max: number, required: boolean): 'REQUIRED' | 'RANGE' | null {
  if (isBlank(value)) return required ? 'REQUIRED' : null;
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? null : 'RANGE';
}

/** Bảng 2 cột: dòng có nhập ít nhất 1 ô thì ô còn lại bắt buộc */
function pairRows(rows: any[], keys: string[]): Array<Record<string, boolean>> {
  return rows.map((r) => {
    const used = keys.some((k) => !isBlank(r[k]));
    return Object.fromEntries(keys.map((k) => [k, used && isBlank(r[k])]));
  });
}

/** Gắn lỗi bảng đầu vào nếu có ô lỗi */
function setInputRows(errors: NodeFieldErrors, field: keyof NodePropertyModel, rows: Array<Record<string, boolean>>): void {
  if (!rows.some((r) => Object.values(r).some(Boolean))) return;
  errors[field] = 'INPUT_REQUIRED';
  errors.inputRows = rows;
}

export function hasNodeErrors(errors: NodeFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Mã bước của mọi bước khác trên canvas (để kiểm tra trùng) */
export function otherNodeKeys(graph: any, nodeId: string): string[] {
  return (graph?.getNodes() || [])
    .filter((n: any) => n.id !== nodeId)
    .map((n: any) => n.getData()?.nodeKey)
    .filter((k: string) => !!k);
}
