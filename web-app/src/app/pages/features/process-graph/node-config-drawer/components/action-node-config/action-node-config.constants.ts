import { ActionLibraryItem } from '../../../graph-editor.component';

export const DEFAULT_ACTION_LIBRARIES: ActionLibraryItem[] = [
  {
    id: 'act-ipcc-api',
    name: 'Gọi API IPCC 2.0 (Tổng đài)',
    category: 'IPCC Core',
    method: 'POST',
    endpoint: 'https://ipcc.vnpt.vn/api/v2/call/dispatch',
    description: 'Điều phối luồng cuộc gọi và tương tác vào hạ tầng IPCC Core',
    defaultRequestBody: '{\n  "callId": "${flow.variables.call_id}",\n  "agentId": "${flow.variables.agent_id}",\n  "queue": "HOTLINE_1800"\n}',
    defaultResponseMapping: 'flow.variables.dispatch_status = response.data.status;\nflow.variables.ticket_id = response.data.ticketId;'
  },
  {
    id: 'act-sms-brandname',
    name: 'Gửi SMS Brandname Khách hàng',
    category: 'Notification',
    method: 'POST',
    endpoint: 'https://sms.vnpt.vn/api/brandname/send',
    description: 'Gửi tin nhắn thông báo tiến độ xử lý khiếu nại tới số thuê bao',
    defaultRequestBody: '{\n  "phone": "${flow.variables.customer_phone}",\n  "brandname": "VNPT_CARE",\n  "message": "Yeu cau cua Quy khach da duoc ghi nhan thanh cong."\n}',
    defaultResponseMapping: 'flow.variables.sms_sent_status = response.success;'
  },
  {
    id: 'act-cdr-billing',
    name: 'Đối soát cước CDR Viễn thông',
    category: 'Billing',
    method: 'GET',
    endpoint: 'https://billing.telecom.vn/api/cdr/query?msisdn=${flow.variables.phone}',
    description: 'Tra cứu lịch sử tính cước, lưu lượng thoại/data và chiết khấu cước',
    defaultRequestBody: '{}',
    defaultResponseMapping: 'flow.variables.cuoc_phat_sinh = response.data.total_amount;\nflow.variables.cdr_count = response.data.records_count;'
  },
  {
    id: 'act-crm-ticket',
    name: 'Tạo Ticket Siebel CRM',
    category: 'CRM',
    method: 'POST',
    endpoint: 'https://crm.telecom.vn/api/tickets/create',
    description: 'Khởi tạo phiếu khiếu nại cước sang phòng ban chuyên trách',
    defaultRequestBody: '{\n  "customerId": "${flow.variables.cust_id}",\n  "category": "DISPUTE_BILLING",\n  "priority": "HIGH"\n}',
    defaultResponseMapping: 'flow.variables.crm_ticket_id = response.data.id;'
  },
  {
    id: 'act-ftth-olt',
    name: 'Kiểm tra suy hao FTTH / OLT',
    category: 'Technical',
    method: 'POST',
    endpoint: 'https://olt-nms.telecom.vn/api/pon/optical-power',
    description: 'Đo lường công suất quang và trạng thái port OLT thuê bao',
    defaultRequestBody: '{\n  "account": "${flow.variables.broadband_account}"\n}',
    defaultResponseMapping: 'flow.variables.rx_power = response.data.rx_power;'
  }
];
