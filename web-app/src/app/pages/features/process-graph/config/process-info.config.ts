import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import { PROCESS_CATEGORIES } from '@core/services/process-category.constant';

/**
 * Danh mục cho tab "Thông tin chung".
 * ⚠ Dữ liệu giả lập — chờ API danh mục (nhóm quy trình, API tích hợp, biểu mẫu).
 */

/** Phân loại nhóm quy trình (đồng bộ với danh sách ở màn Danh sách quy trình) */
export const PROCESS_CATEGORY_OPTIONS: SelectOption[] = PROCESS_CATEGORIES.map(c => ({ value: c, label: c }));

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

/**
 * Trường của từng biểu mẫu đầu vào — dùng cho "Khởi tạo biến quy trình" ở drawer node Bắt đầu.
 * ⚠ Dữ liệu giả lập — chờ API danh mục biểu mẫu.
 */
const TICKET_FIELDS: SelectOption[] = [
  { value: 'ticket_level_1', label: 'Phân loại ticket cấp 1' },
  { value: 'ticket_level_2', label: 'Phân loại ticket cấp 2' },
  { value: 'ticket_level_3', label: 'Phân loại ticket cấp 3' },
  { value: 'customer_name', label: 'Họ tên khách hàng' },
  { value: 'customer_phone', label: 'Số điện thoại' },
  { value: 'content', label: 'Nội dung phản ánh' }
];

export const PROCESS_FORM_FIELD_OPTIONS: Record<string, SelectOption[]> = {
  form_tiep_nhan: TICKET_FIELDS,
  form_khieu_nai: TICKET_FIELDS,
  form_khao_sat: [
    { value: 'survey_score', label: 'Điểm hài lòng' },
    { value: 'survey_comment', label: 'Góp ý' },
    { value: 'customer_phone', label: 'Số điện thoại' }
  ]
};

/** Endpoint của API kích hoạt (hiển thị ở drawer node Bắt đầu). ⚠ Dữ liệu giả lập. */
export const PROCESS_API_ENDPOINTS: Record<string, string> = {
  'crm-ticket-create': 'POST /api/v1/crm/tickets',
  'crm-customer-sync': 'POST /api/v1/crm/customers/sync',
  'billing-webhook': 'POST /api/v1/billing/webhook'
};

/** Trường dữ liệu trả về của từng API — dùng cho "Khởi tạo biến quy trình" khi kích hoạt tự động. ⚠ Dữ liệu giả lập. */
export const PROCESS_API_FIELD_OPTIONS: Record<string, SelectOption[]> = {
  'crm-ticket-create': ['ticketType', 'ticketType2', 'ticketType3', 'channelId', 'customerId'].map(v => ({ value: v, label: v })),
  'crm-customer-sync': ['customerId', 'customerName', 'phone', 'segment'].map(v => ({ value: v, label: v })),
  'billing-webhook': ['accountId', 'amount', 'cycle', 'status'].map(v => ({ value: v, label: v }))
};
