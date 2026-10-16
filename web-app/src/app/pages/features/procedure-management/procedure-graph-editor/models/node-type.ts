/**
 * Loại node trên Canvas Builder. Giá trị này được lưu trong `node.data.type`
 * và gửi nguyên văn lên BE trong `flowJson.nodes[].type` (xem FLOW_SCHEMA.md).
 */
export type NodeType =
  | 'START'              // Bắt đầu (có sẵn, 1 node/flow)
  | 'GATEWAY_EXCLUSIVE'  // Điều kiện › Chọn một nhánh
  | 'GATEWAY_PARALLEL'   // Điều kiện › Chạy song song
  | 'GATEWAY_INCLUSIVE'  // Điều kiện › Chọn nhiều nhánh
  | 'JOIN'               // Gộp nhánh (tự sinh kèm mỗi gateway)
  | 'USER_TASK'          // Giao việc
  | 'SYSTEM_TASK'        // Tác vụ hệ thống
  | 'NOTIFICATION'       // Thông báo
  | 'SUB_PROCESS'        // Quy trình con
  | 'END';               // Kết thúc

export const GATEWAY_NODE_TYPES: NodeType[] = ['GATEWAY_EXCLUSIVE', 'GATEWAY_PARALLEL', 'GATEWAY_INCLUSIVE'];

export function isGatewayType(type: string | undefined | null): boolean {
  return !!type && (GATEWAY_NODE_TYPES as string[]).includes(type);
}

/** Toàn bộ type. Tên hiển thị nằm ở i18n: PROCESS_GRAPH.NODE_TYPES.<type>, nhãn JOIN: PROCESS_GRAPH.JOIN_LABELS.<gateway> */
export const ALL_NODE_TYPES: NodeType[] = [
  'START', 'GATEWAY_EXCLUSIVE', 'GATEWAY_PARALLEL', 'GATEWAY_INCLUSIVE', 'JOIN',
  'USER_TASK', 'SYSTEM_TASK', 'NOTIFICATION', 'SUB_PROCESS', 'END',
];

/**
 * Chuyển type cũ (trigger, task, action, condition + gatewayType, split, merge, end,
 * notification, sub_process) sang type mới. Dùng khi mở dữ liệu canvas lưu trước đây.
 */
export function normalizeNodeType(type: string | undefined | null, gatewayType?: string): NodeType {
  switch (type) {
    case 'trigger': return 'START';
    case 'task': return 'USER_TASK';
    case 'action': return 'SYSTEM_TASK';
    case 'condition':
      if (gatewayType === 'parallel') return 'GATEWAY_PARALLEL';
      if (gatewayType === 'inclusive') return 'GATEWAY_INCLUSIVE';
      return 'GATEWAY_EXCLUSIVE';
    case 'split': return 'GATEWAY_PARALLEL';
    case 'merge': return 'JOIN';
    case 'end': return 'END';
    case 'notification': return 'NOTIFICATION';
    case 'sub_process': return 'SUB_PROCESS';
    default:
      return (type && (ALL_NODE_TYPES as string[]).includes(type) ? type : 'USER_TASK') as NodeType;
  }
}
