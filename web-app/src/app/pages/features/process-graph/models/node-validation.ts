import { NodePropertyModel } from './node-property.model';
import { isGatewayType } from './node-type';

/** Field bắt buộc còn thiếu → true (key trùng tên field trong NodePropertyModel) */
export type NodeFieldErrors = Partial<Record<keyof NodePropertyModel, boolean>>;

const isBlank = (value: unknown): boolean => value === null || value === undefined || String(value).trim() === '';

/** Kiểm tra các ô có dấu * trong drawer theo loại bước. Trả về object rỗng nếu hợp lệ. */
export function validateNodeProps(props: NodePropertyModel): NodeFieldErrors {
  const errors: NodeFieldErrors = {};
  const require = (field: keyof NodePropertyModel) => {
    if (isBlank(props[field])) errors[field] = true;
  };

  switch (props.type) {
    case 'USER_TASK': {
      require('label');
      require('department');
      require('agent');
      require('formTemplate');
      // Dữ liệu đầu vào: có ít nhất 1 biến; dòng tích Ánh xạ phải chọn trường biểu mẫu
      const rows = props.formInputs || [];
      const hasVariable = rows.some((r) => !isBlank(r.variable));
      const missingField = rows.some((r) => r.mapped && isBlank(r.formField));
      if (!hasVariable || missingField) errors.formInputs = true;
      break;
    }
    case 'SYSTEM_TASK':
      require('label');
      require('integratedSystem');
      require('selectedApi');
      require('timeoutSeconds');
      require('retryCount');
      break;
    case 'SUB_PROCESS':
    case 'NOTIFICATION':
      require('label');
      break;
    case 'END':
      require('endFormTemplate');
      break;
    default:
      if (isGatewayType(props.type)) require('label');
  }
  return errors;
}

export function hasNodeErrors(errors: NodeFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
