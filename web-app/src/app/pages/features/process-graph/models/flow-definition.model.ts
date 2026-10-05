import { NodeType } from './node-type';

/**
 * Định dạng dữ liệu lưu / vẽ lại flow (khớp FLOW_SCHEMA.md).
 * FE gửi `FlowDefinition` (dạng chuỗi JSON) trong `flowJson` khi Lưu nháp,
 * BE trả lại nguyên văn để FE vẽ lại canvas.
 */

// ============================================================================
// Payload / Response với BE
// ============================================================================

/** Body `PUT /api/v1/ticket-call-flows/{id}` khi bấm "Lưu nháp" */
export interface SaveFlowDraftPayload {
  name: string;
  description: string;
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

// ============================================================================
// FlowDefinition
// ============================================================================

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

// ============================================================================
// config theo từng type (theo drawer design)
// ============================================================================

export interface StartConfig {
  triggerType: string | null;      // Kiểu kích hoạt
  triggerRefId: string | null;     // Form / Lịch được chọn
}

export type ConditionOperator = 'EQ' | 'NEQ' | 'GT' | 'LT' | 'CONTAINS';

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
  departmentId: string | null;     // Phòng ban
  groupId: string | null;          // Nhóm
  agentId: string | null;          // Agent
  slaValue: number | null;         // SLA › Thời hạn xử lý (số)
  slaUnit: string | null;          // SLA › Thời hạn xử lý (đơn vị: Giờ | Ngày | Tuần)
  slaWarning: boolean;             // SLA › Cảnh báo trước khi quá hạn
  formId: string | null;           // Output từ biểu mẫu › Biểu mẫu
  formOutputFieldId: string | null; // Output từ biểu mẫu › Output từ biểu mẫu
}

export interface MappingRow {
  input: string;                   // cột Đầu vào
  output: string | null;           // cột Đầu ra
}

export interface SystemTaskConfig {
  systemId: string | null;         // Hệ thống tích hợp
  apiId: string | null;            // API
  timeout: number | null;          // Timeout (giây)
  retry: number | null;            // Retry
  inputMapping: MappingRow[];      // Mapping Input
  outputFieldId: string | null;    // Output API › Output từ biểu mẫu
}

export interface NotificationConfig {
  recipientId: string | null;      // Người nhận
  content: string;                 // Nội dung thông báo
  channels: Array<'NOTIFICATION' | 'EMAIL'>; // Kênh thông báo
}

export interface SubProcessConfig {
  subProcessId: string | null;     // Chọn quy trình con
  inputMapping: MappingRow[];      // Mapping Input
  outputMapping: MappingRow[];     // Output
}

export interface EndConfig {
  endFormId: string | null;        // Biểu mẫu kết thúc
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
