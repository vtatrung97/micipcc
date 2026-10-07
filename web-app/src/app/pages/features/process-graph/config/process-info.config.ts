import { SelectOption } from '@shared/components/ant-select/ant-select.component';

/**
 * Danh mục cho tab "Thông tin chung".
 * ⚠ Dữ liệu giả lập — chờ API danh mục (nhóm quy trình, API tích hợp, biểu mẫu).
 */

/** Phân loại nhóm quy trình (đồng bộ với danh sách ở màn Danh sách quy trình) */
export const PROCESS_CATEGORY_OPTIONS: SelectOption[] = [
  'Xử lý khiếu nại',
  'Cảnh báo chỉ số',
  'Chăm sóc sau tương tác',
  'Happy Call / Telesales',
  'Khảo sát CSAT'
].map(c => ({ value: c, label: c }));

/** API dùng cho kích hoạt Hybrid */
export const PROCESS_HYBRID_API_OPTIONS: SelectOption[] = [
  { value: 'crm-ticket-create', label: 'CRM · Tạo ticket' },
  { value: 'crm-customer-sync', label: 'CRM · Đồng bộ khách hàng' },
  { value: 'billing-webhook', label: 'Billing · Webhook cước' }
];

/** Biểu mẫu dữ liệu đầu vào cho kích hoạt Hybrid */
export const PROCESS_INPUT_FORM_OPTIONS: SelectOption[] = [
  { value: 'form_tiep_nhan', label: 'Biểu mẫu tiếp nhận' },
  { value: 'form_khieu_nai', label: 'Biểu mẫu khiếu nại' },
  { value: 'form_khao_sat', label: 'Biểu mẫu khảo sát' }
];
