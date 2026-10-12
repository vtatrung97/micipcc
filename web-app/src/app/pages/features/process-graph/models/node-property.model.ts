import { NodeType } from './node-type';

/** Interface dữ liệu node trên canvas. node.data của X6 = NodePropertyModel. */
export interface ActionLibraryItem {
  id: string;
  name: string;
  category: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  defaultRequestBody?: string;
  defaultResponseMapping?: string;
}

export interface ConditionRuleItem {
  param: string;
  operator: string;
  value: string;
}

export interface ConditionBranch {
  id: string;
  name: string;
  defaultLabel?: string;
  value?: string;
  expression: string;
  variableSource?: string;
  isDefault?: boolean;
  rules?: ConditionRuleItem[];
  logicOperator?: 'AND' | 'OR';
}

export interface NodePropertyModel {
  id: string;
  nodeKey?: string;
  type: NodeType;
  gatewayType?: 'exclusive' | 'parallel' | 'inclusive';
  typeTitle: string;
  label: string;
  icon: string;
  description: string;

  // User Task specific
  isApprovalStep?: boolean;
  /** Loại giao việc: thủ công / tự động */
  assignType?: UserTaskAssignType;
  /** Cơ chế giao việc, chỉ dùng khi assignType = AUTO */
  assignStrategy?: UserTaskAssignStrategy;
  /** Dữ liệu đầu vào: biến quy trình → trường biểu mẫu */
  formInputs?: UserTaskInputRow[];
  /** Dữ liệu đầu ra: trường biểu mẫu → biến quy trình */
  formOutputs?: UserTaskOutputRow[];

  // Action specific (US-34, BR-INT-01..05, REQ-11)
  actionSource?: 'library' | 'custom';
  actionLibraryId?: string;
  actionMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  actionEndpoint?: string;
  requestBodyMapping?: string;
  responseMapping?: string;
  slaSeconds?: number;
  retryCount?: number;
  retryInterval?: string;
  circuitBreakerTimeoutMs?: number;

  // Condition specific (Exclusive Gateway / Branch Variable)
  branches?: ConditionBranch[];
  conditionRule?: string;
  servicePivotSource?: string;
  conditionVariable?: string;

  // General task/trigger fields
  timeout?: string;
  sla?: string;
  assignee?: string;
  triggerEvent?: string;

  // Notification specific
  notificationChannel?: string;
  notificationRecipient?: string;
  notificationTitle?: string;
  notificationContent?: string;

  // Sub-process specific
  subProcessTemplateId?: string;
  subProcessVersion?: string;
  subProcessWaitComplete?: boolean;
  subProcessInputMapping?: string;

  // Viettel Customer Service Node Config fields
  department?: string;
  team?: string;
  agent?: string;
  slaWarning?: boolean;
  formTemplate?: string;
  endFormTemplate?: string;
  /** Kết quả của node Kết thúc: biến quy trình → trường biểu mẫu kết thúc */
  endResults?: EndResultRow[];
  triggerType?: string;
  triggerFormSchedule?: string;
  startVariables?: StartVariableRow[];
  channelNotification?: boolean;
  channelEmail?: boolean;

  // Action fields
  integratedSystem?: string;
  selectedApi?: string;
  timeoutSeconds?: number;
  /** Dữ liệu đầu vào: tham số yêu cầu API ← biến quy trình */
  apiInputs?: SystemTaskInputRow[];
  /** Dữ liệu đầu ra: trường dữ liệu API → biến quy trình */
  apiOutputs?: SystemTaskOutputRow[];

  // Condition flow outputs
  defaultFlowOutput?: string;
  errorFlowOutput?: string;

  // Tác vụ hệ thống: bật cổng Lỗi (out-failure)
  hasExceptionPort?: boolean;

  // Quy trình con: đầu vào quy trình con ← biến quy trình; biến quy trình con → biến quy trình
  subProcessInputs?: SubProcessInputRow[];
  subProcessOutputs?: SubProcessOutputRow[];

  // Cặp Gateway ⇄ JOIN tự sinh
  joinNodeId?: string;
  gatewayNodeId?: string;
}

export interface PaletteItem {
  type: NodeType;
  category?: 'condition' | 'general';
  typeTitle: string;
  defaultName: string;
  icon: string;
  label: string;
  badge: string;
  bg: string;
  border: string;
  color: string;
  tooltipText: string;
  avatarInitial?: string;
  avatarBg?: string;
}

/** Một dòng "Khởi tạo biến quy trình" của node Bắt đầu */
export interface StartVariableRow {
  /** Biến quy trình, vd: ticket_type */
  variable: string;
  /** Trường nguồn gán giá trị cho biến: trường biểu mẫu (thủ công) hoặc trường dữ liệu API (tự động) */
  formField: string | null;
  /** Tên hiển thị của biến */
  displayName: string;
  /** Giá trị cố định gán cho biến (kích hoạt Lập lịch) */
  fixedValue?: string;
  /** Trường dữ liệu API (kích hoạt Hybrid — dùng cùng formField là trường biểu mẫu) */
  apiField?: string | null;
}

export type UserTaskAssignType = 'MANUAL' | 'AUTO';

/** Xoay vòng / Rảnh nhất */
export type UserTaskAssignStrategy = 'ROUND_ROBIN' | 'LEAST_BUSY';

/** Một dòng "Dữ liệu đầu vào" của node Giao việc */
export interface UserTaskInputRow {
  /** Biến quy trình (khai báo ở node Bắt đầu) */
  variable: string | null;
  /** Có ánh xạ biến vào trường biểu mẫu không */
  mapped: boolean;
  /** Trường biểu mẫu nhận giá trị, chỉ dùng khi mapped = true */
  formField: string | null;
}

/** Một dòng "Dữ liệu đầu vào" của node Tác vụ hệ thống */
export interface SystemTaskInputRow {
  apiParam: string | null;
  variable: string | null;
}

/** Một dòng "Dữ liệu đầu ra" của node Tác vụ hệ thống */
export interface SystemTaskOutputRow {
  apiField: string | null;
  variable: string;
  displayName: string;
}

/** Một dòng "Dữ liệu đầu vào" của node Quy trình con */
export interface SubProcessInputRow {
  subField: string | null;
  variable: string | null;
}

/** Một dòng "Dữ liệu đầu ra" của node Quy trình con */
export interface SubProcessOutputRow {
  subField: string | null;
  variable: string;
  displayName: string;
}

/** Một dòng "Kết quả" của node Kết thúc */
export interface EndResultRow {
  variable: string | null;
  formField: string | null;
}

/** Một dòng "Dữ liệu đầu ra" của node Giao việc */
export interface UserTaskOutputRow {
  variable: string;
  formField: string | null;
  displayName: string;
}
