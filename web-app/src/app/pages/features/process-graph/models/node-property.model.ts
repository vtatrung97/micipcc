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
  formOutput?: string;
  endFormTemplate?: string;
  triggerType?: string;
  triggerFormSchedule?: string;
  channelNotification?: boolean;
  channelEmail?: boolean;

  // Action fields
  integratedSystem?: string;
  selectedApi?: string;
  timeoutSeconds?: number;
  apiOutput?: string;

  // Condition flow outputs
  defaultFlowOutput?: string;
  errorFlowOutput?: string;

  // Tác vụ hệ thống: bật cổng Lỗi (out-failure)
  hasExceptionPort?: boolean;

  // Bảng mapping (Đầu vào → Đầu ra)
  actionInputMappings?: Array<{ source: string; target: string }>;
  subProcessInputMappings?: Array<{ source: string; target: string }>;
  subProcessOutputMappings?: Array<{ source: string; target: string }>;

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

