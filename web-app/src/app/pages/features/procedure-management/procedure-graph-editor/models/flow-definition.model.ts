import { NodeType } from './node-type';

/**
 * Định dạng lưu / vẽ lại flow (khớp FLOW_SCHEMA.md): FE gửi `FlowDefinition` dạng chuỗi JSON
 * trong `flowJson` khi Lưu nháp, BE trả nguyên văn để FE vẽ lại canvas.
 */

// ===== Payload / Response với BE =====

/** Body `PUT /api/v1/ticket-call-flows/{id}` khi bấm "Lưu nháp" */
export interface SaveFlowDraftPayload {
  name: string;
  description: string;
  /** Tab "Thông tin chung" (FLOW_SCHEMA mục 1.1) */
  code?: string;
  category?: string | null;
  triggerType?: 'MANUAL' | 'AUTO' | 'SCHEDULE' | 'HYBRID' | null;
  triggerConfig?: {
    manual?: { inputFormId: string | null };
    auto?: {
      apiId: string | null;
      conditions: { logicOperator: 'AND' | 'OR'; rules: { param: string; operator: string; value: string }[] };
    };
    schedule?: {
      mode: 'ONCE' | 'REPEAT';
      runDate: string;                                  // YYYY-MM-DD (ONCE)
      runTime: string;                                  // HH:mm
      repeat: 'DAILY' | 'WEEKLY' | 'MONTHLY' | null;    // REPEAT
      weekDays: number[];                               // 1 = Thứ 2 … 7 = Chủ nhật (WEEKLY)
      monthDays: number[];                              // 1–31 (MONTHLY)
    };
    hybrid?: {
      apiId: string | null;
      inputFormId: string | null;
      conditions: { logicOperator: 'AND' | 'OR'; rules: { param: string; operator: string; value: string }[] };
    };
  } | null;
  slaValue?: number | null;
  slaUnit?: string;
  versionName?: string;
  rowVersion?: number;
  /** JSON.stringify(FlowDefinition) */
  flowJson: string;
}

/** `result` của `GET /api/v1/ticket-call-flows/{id}` – các field FE cần để vẽ lại */
export interface FlowDetailResponse {
  id: string;
  code: string;
  name: string;
  description?: string;
  flowJsonVersionNo: number;
  flowJsonVersionStatus: 'DRAFT' | 'PUBLISHED';
  rowVersion: number;
  /** Chuỗi FlowDefinition, nguyên văn như FE đã gửi */
  flowJson: string;
}

export interface ApiResponse<T> {
  code: number;
  message?: string;
  result: T;
}

// ===== FlowDefinition =====

export interface FlowDefinition {
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport?: { zoom: number; x: number; y: number };
}

export interface FlowNode<C = FlowNodeConfig> {
  id: string;
  type: NodeType;
  /** Tên bước */
  name: string;
  /** Mã bước */
  key: string;
  /** Mô tả */
  description: string;
  position: { x: number; y: number };
  config: C;
}

export interface FlowEdge {
  id: string;
  source: string;
  /** Cổng ra của node nguồn: next | success | error | default | <cases[].id> */
  sourceHandle: string;
  target: string;
}

// ===== config theo từng type node =====

/** Kiểu kích hoạt / biểu mẫu / API / lịch chỉ xem trên drawer — lưu ở triggerType + triggerConfig của payload */
export interface StartConfig {
  /** "Khởi tạo biến quy trình" */
  variables: Array<{
    name: string;                  // Biến quy trình
    formField: string | null;      // Trường biểu mẫu (Thủ công / Hybrid) hoặc trường dữ liệu API (Tự động)
    apiField: string | null;       // Trường dữ liệu API (Hybrid)
    value: string | null;          // Giá trị cố định (Lập lịch)
    displayName: string;           // Tên hiển thị
  }>;
}

export type ConditionOperator = 'EQ' | 'NEQ' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'IN' | 'NOT_IN' | 'CONTAINS';

export interface GatewayCondition {
  field: string;                   // Tham số
  operator: ConditionOperator;     // Kiểu so sánh
  value: string;                   // Giá trị so sánh
}

export interface GatewayCase {
  id: string;                      // = sourceHandle của edge đi ra từ trường hợp này
  name: string;                    // Tên trường hợp
  logicOperator: 'AND' | 'OR';     // Cách nối các dòng điều kiện
  conditions: GatewayCondition[];
}

export interface GatewayConfig {
  cases: GatewayCase[];            // Các trường hợp (không gồm Mặc định – Mặc định là cổng 'default')
  joinNodeId: string | null;       // Node JOIN đi kèm
}

export interface JoinConfig {
  gatewayNodeId: string | null;    // Node GATEWAY_* đi kèm
}

export interface UserTaskConfig {
  assignType: 'MANUAL' | 'AUTO';   // Loại giao việc
  assignStrategy: 'ROUND_ROBIN' | 'LEAST_BUSY' | null; // Cơ chế giao việc (chỉ khi AUTO)
  departmentId: string | null;     // Phòng ban
  groupIds: string[];              // Nhóm (nhiều, trống = tất cả)
  agentIds: string[];              // Agent (nhiều)
  slaValue: number | null;         // SLA › Thời hạn xử lý (số)
  slaUnit: string | null;          // SLA › Thời hạn xử lý (đơn vị: Giờ | Ngày | Tuần | Tháng)
  slaWarning: boolean;             // SLA › Cảnh báo trước khi quá hạn
  formId: string | null;           // Biểu mẫu
  inputs: UserTaskInputMapping[];  // Dữ liệu đầu vào
  outputs: UserTaskOutputMapping[]; // Dữ liệu đầu ra
}

export interface UserTaskInputMapping {
  variable: string;                // Biến quy trình
  formField: string | null;        // Trường biểu mẫu, null khi không ánh xạ
}

export interface UserTaskOutputMapping {
  formField: string;               // Trường biểu mẫu
  variable: string;                // Biến quy trình nhận giá trị
  displayName: string;
}

export interface SystemTaskConfig {
  systemId: string | null;         // Hệ thống tích hợp
  apiId: string | null;            // API
  timeout: number | null;          // Timeout (giây)
  retry: number | null;            // Retry
  inputs: { apiParam: string; variable: string | null }[];  // Dữ liệu đầu vào
  outputs: { apiField: string; variable: string; displayName: string }[]; // Dữ liệu đầu ra
}

export interface NotificationConfig {
  channel: 'EMAIL' | 'SMS' | null;            // Kênh thông báo
  recipientSource: 'VARIABLE' | 'USER' | null; // Nguồn nhận thông báo
  recipientVariable: string | null;           // Người nhận (nguồn = Biến quy trình)
  recipientUserIds: string[];                 // Người nhận (nguồn = Người dùng)
  title: string;                              // Tiêu đề thông báo
  content: string;                            // Nội dung thông báo
}

export interface SubProcessConfig {
  subProcessId: string | null;     // Chọn quy trình con
  inputs: { subField: string; variable: string | null }[];  // Dữ liệu đầu vào
  outputs: { subField: string; variable: string; displayName: string }[]; // Dữ liệu đầu ra
}

export interface EndConfig {
  endFormId: string | null;        // Biểu mẫu kết thúc
  results: { variable: string; formField: string | null }[]; // Kết quả
}

export type FlowNodeConfig =
  | StartConfig
  | GatewayConfig
  | JoinConfig
  | UserTaskConfig
  | SystemTaskConfig
  | NotificationConfig
  | SubProcessConfig
  | EndConfig;
