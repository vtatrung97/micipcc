import { SelectOption } from '@shared/components/ant-select/ant-select.component';

/**
 * Danh mục cho drawer node Tác vụ hệ thống.
 * ⚠ Dữ liệu giả lập — chờ API danh mục hệ thống tích hợp và API.
 */

/** Hệ thống tích hợp: label là key i18n trong PROCESS_GRAPH.OPTIONS.SYSTEMS */
export const SYSTEM_KEYS: SelectOption[] = [
  { value: 'crm', label: 'CRM' },
  { value: 'ipcc', label: 'IPCC' },
  { value: 'billing', label: 'BILLING' },
  { value: 'ftth', label: 'FTTH' }
];

export interface SystemApiDef {
  value: string;
  label: string;
  /** Tham số yêu cầu của API (cột "Yêu cầu API") */
  requestParams: SelectOption[];
  /** Trường dữ liệu trả về (cột "Trường dữ liệu API") */
  responseFields: SelectOption[];
  /** Giả lập kết quả "Kiểm tra kết nối": false = không kết nối được */
  isReachable?: boolean;
}

const TICKET_PARAMS: SelectOption[] = [
  { value: 'ticketId', label: 'Mã ticket' },
  { value: 'channelType', label: 'Loại kênh' },
  { value: 'content', label: 'Nội dung phản ánh' },
  { value: 'customerPhone', label: 'Số điện thoại' }
];

const RESULT_FIELDS: SelectOption[] = [
  { value: 'title', label: 'Tiêu đề' },
  { value: 'result', label: 'Kết quả' },
  { value: 'status', label: 'Trạng thái' }
];

const BILLING_PARAMS: SelectOption[] = [
  { value: 'accountId', label: 'Mã tài khoản' },
  { value: 'cycle', label: 'Kỳ cước' }
];

const BILLING_FIELDS: SelectOption[] = [{ value: 'amount', label: 'Số tiền' }, ...RESULT_FIELDS];

/** API theo từng hệ thống tích hợp. Giả lập: API thứ 1 kết nối được, API thứ 2 báo lỗi */
export const SYSTEM_APIS: Record<string, SystemApiDef[]> = {
  crm: [
    { value: 'crm_ticket_create', label: 'POST /api/v1/crm/tickets', requestParams: TICKET_PARAMS, responseFields: RESULT_FIELDS },
    { value: 'crm_ticket_sync', label: 'PUT /api/v1/crm/tickets/sync', requestParams: TICKET_PARAMS, responseFields: RESULT_FIELDS, isReachable: false }
  ],
  ipcc: [
    { value: 'ipcc_dispatch', label: 'POST /api/v2/call/dispatch', requestParams: TICKET_PARAMS, responseFields: RESULT_FIELDS },
    { value: 'ipcc_call_status', label: 'GET /api/v2/call/status', requestParams: TICKET_PARAMS, responseFields: RESULT_FIELDS, isReachable: false }
  ],
  billing: [
    { value: 'billing_query', label: 'GET /api/v3/cdr/query', requestParams: BILLING_PARAMS, responseFields: BILLING_FIELDS },
    { value: 'billing_adjust', label: 'POST /api/v3/charges/adjust', requestParams: BILLING_PARAMS, responseFields: BILLING_FIELDS, isReachable: false }
  ],
  ftth: [
    { value: 'ftth_check', label: 'POST /api/v1/ftth/line-check', requestParams: TICKET_PARAMS, responseFields: RESULT_FIELDS },
    { value: 'ftth_reset', label: 'POST /api/v1/ftth/port-reset', requestParams: TICKET_PARAMS, responseFields: RESULT_FIELDS, isReachable: false }
  ]
};
