import { SelectOption } from '@shared/components/ant-select/ant-select.component';

/**
 * Danh mục cho tab "Thông tin chung" và drawer node Bắt đầu.
 * ⚠ Dữ liệu giả lập — chờ API danh mục (API tích hợp, biểu mẫu).
 */

/** [mã, tên] → option hiển thị "Tên (mã)" */
const toFieldOptions = (pairs: Array<[string, string]>): SelectOption[] =>
  pairs.map(([value, name]) => ({ value, label: `${name} (${value})` }));

/** API nhận kích hoạt (Tự động / Hybrid) — chỉ API trạng thái "Đã kết nối" */
export const PROCESS_HYBRID_API_OPTIONS: SelectOption[] = [
  { value: 'crm-ticket-create', label: 'CRM · Tạo ticket' },
  { value: 'crm-complaint-create', label: 'CRM · Tạo khiếu nại' },
  { value: 'crm-customer-sync', label: 'CRM · Đồng bộ khách hàng' },
  { value: 'ipcc-call-ended', label: 'IPCC · Kết thúc cuộc gọi' },
  { value: 'ipcc-missed-call', label: 'IPCC · Cuộc gọi nhỡ' },
  { value: 'billing-webhook', label: 'Billing · Webhook cước' },
  { value: 'app-feedback', label: 'App CSKH · Phản hồi khách hàng' }
];

/** Biểu mẫu dữ liệu đầu vào (Thủ công / Hybrid), cũng dùng làm biểu mẫu của node Giao việc */
export const PROCESS_INPUT_FORM_OPTIONS: SelectOption[] = [
  { value: 'form_tiep_nhan', label: 'Biểu mẫu tiếp nhận' },
  { value: 'form_khieu_nai', label: 'Biểu mẫu khiếu nại' },
  { value: 'form_khao_sat', label: 'Biểu mẫu khảo sát' },
  { value: 'form_ho_tro_ky_thuat', label: 'Biểu mẫu hỗ trợ kỹ thuật' },
  { value: 'form_bao_hanh', label: 'Biểu mẫu bảo hành' },
  { value: 'form_dang_ky_dich_vu', label: 'Biểu mẫu đăng ký dịch vụ' }
];

const CUSTOMER_FIELDS: SelectOption[] = [
  { value: 'customer_name', label: 'Họ tên khách hàng' },
  { value: 'customer_phone', label: 'Số điện thoại' },
  { value: 'customer_email', label: 'Email' }
];

const TICKET_FIELDS: SelectOption[] = [
  { value: 'ticket_level_1', label: 'Phân loại ticket cấp 1' },
  { value: 'ticket_level_2', label: 'Phân loại ticket cấp 2' },
  { value: 'ticket_level_3', label: 'Phân loại ticket cấp 3' },
  ...CUSTOMER_FIELDS,
  { value: 'priority', label: 'Mức ưu tiên' },
  { value: 'content', label: 'Nội dung phản ánh' }
];

/** Trường của từng biểu mẫu — dùng cho "Khởi tạo biến quy trình" (node Bắt đầu) và ánh xạ của node Giao việc */
export const PROCESS_FORM_FIELD_OPTIONS: Record<string, SelectOption[]> = {
  form_tiep_nhan: TICKET_FIELDS,
  form_khieu_nai: [
    ...TICKET_FIELDS,
    { value: 'complaint_type', label: 'Loại khiếu nại' },
    { value: 'attachment', label: 'Tệp đính kèm' }
  ],
  form_khao_sat: [
    { value: 'survey_score', label: 'Điểm hài lòng' },
    { value: 'survey_comment', label: 'Góp ý' },
    { value: 'customer_phone', label: 'Số điện thoại' }
  ],
  form_ho_tro_ky_thuat: [
    ...CUSTOMER_FIELDS,
    { value: 'service_account', label: 'Tài khoản dịch vụ' },
    { value: 'issue_type', label: 'Loại sự cố' },
    { value: 'install_address', label: 'Địa chỉ lắp đặt' },
    { value: 'appointment_time', label: 'Thời gian hẹn' }
  ],
  form_bao_hanh: [
    ...CUSTOMER_FIELDS,
    { value: 'product_code', label: 'Mã sản phẩm' },
    { value: 'serial_number', label: 'Số serial' },
    { value: 'purchase_date', label: 'Ngày mua' },
    { value: 'fault_description', label: 'Mô tả lỗi' }
  ],
  form_dang_ky_dich_vu: [
    ...CUSTOMER_FIELDS,
    { value: 'service_package', label: 'Gói dịch vụ' },
    { value: 'id_number', label: 'Số giấy tờ tuỳ thân' },
    { value: 'install_address', label: 'Địa chỉ lắp đặt' }
  ]
};

/** Endpoint của API kích hoạt (hiển thị ở drawer node Bắt đầu) */
export const PROCESS_API_ENDPOINTS: Record<string, string> = {
  'crm-ticket-create': 'POST /api/v1/crm/tickets',
  'crm-complaint-create': 'POST /api/v1/crm/complaints',
  'crm-customer-sync': 'POST /api/v1/crm/customers/sync',
  'ipcc-call-ended': 'POST /api/v2/ipcc/calls/ended',
  'ipcc-missed-call': 'POST /api/v2/ipcc/calls/missed',
  'billing-webhook': 'POST /api/v1/billing/webhook',
  'app-feedback': 'POST /api/v1/app/feedbacks'
};

/** Trường dữ liệu trả về của từng API — dùng cho "Khởi tạo biến quy trình" khi kích hoạt tự động */
export const PROCESS_API_FIELD_OPTIONS: Record<string, SelectOption[]> = {
  'crm-ticket-create': toFieldOptions([['ticketId', 'Mã ticket'], ['ticketType', 'Loại ticket cấp 1'], ['ticketType2', 'Loại ticket cấp 2'], ['ticketType3', 'Loại ticket cấp 3'], ['channelId', 'Kênh tiếp nhận'], ['customerId', 'Mã khách hàng'], ['content', 'Nội dung']]),
  'crm-complaint-create': toFieldOptions([['complaintId', 'Mã khiếu nại'], ['complaintType', 'Loại khiếu nại'], ['severity', 'Mức độ'], ['customerId', 'Mã khách hàng'], ['content', 'Nội dung']]),
  'crm-customer-sync': toFieldOptions([['customerId', 'Mã khách hàng'], ['customerName', 'Tên khách hàng'], ['phone', 'Số điện thoại'], ['segment', 'Phân khúc'], ['rank', 'Hạng']]),
  'ipcc-call-ended': toFieldOptions([['callId', 'Mã cuộc gọi'], ['agentId', 'Mã agent'], ['callerPhone', 'Số gọi đến'], ['duration', 'Thời lượng (giây)'], ['queue', 'Hàng đợi']]),
  'ipcc-missed-call': toFieldOptions([['callId', 'Mã cuộc gọi'], ['callerPhone', 'Số gọi đến'], ['queue', 'Hàng đợi'], ['missedAt', 'Thời điểm nhỡ']]),
  'billing-webhook': toFieldOptions([['accountId', 'Mã tài khoản'], ['amount', 'Số tiền'], ['cycle', 'Kỳ cước'], ['status', 'Trạng thái']]),
  'app-feedback': toFieldOptions([['feedbackId', 'Mã phản hồi'], ['rating', 'Điểm đánh giá'], ['category', 'Chủ đề'], ['customerId', 'Mã khách hàng'], ['content', 'Nội dung']])
};

/** Tham số đầu vào (request) của từng API — dùng cho "Tham số kích hoạt" ở Điều kiện kích hoạt */
export const PROCESS_API_INPUT_OPTIONS: Record<string, SelectOption[]> = {
  'crm-ticket-create': toFieldOptions([['ticketType', 'Loại ticket'], ['channelId', 'Kênh tiếp nhận'], ['priority', 'Mức ưu tiên'], ['customerId', 'Mã khách hàng'], ['content', 'Nội dung']]),
  'crm-complaint-create': toFieldOptions([['complaintType', 'Loại khiếu nại'], ['severity', 'Mức độ'], ['channelId', 'Kênh tiếp nhận'], ['customerRank', 'Hạng khách hàng']]),
  'crm-customer-sync': toFieldOptions([['customerId', 'Mã khách hàng'], ['segment', 'Phân khúc'], ['rank', 'Hạng'], ['phone', 'Số điện thoại']]),
  'ipcc-call-ended': toFieldOptions([['queue', 'Hàng đợi'], ['duration', 'Thời lượng (giây)'], ['hangupCause', 'Lý do kết thúc'], ['agentId', 'Mã agent']]),
  'ipcc-missed-call': toFieldOptions([['queue', 'Hàng đợi'], ['callerPhone', 'Số gọi đến'], ['waitTime', 'Thời gian chờ (giây)']]),
  'billing-webhook': toFieldOptions([['accountId', 'Mã tài khoản'], ['amount', 'Số tiền'], ['cycle', 'Kỳ cước'], ['status', 'Trạng thái']]),
  'app-feedback': toFieldOptions([['rating', 'Điểm đánh giá'], ['category', 'Chủ đề'], ['platform', 'Nền tảng']])
};
