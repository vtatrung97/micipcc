/**
 * Cổng (port) theo type node + luật nối dây và validate đồ thị kiểu BPMN 2.0.
 * Vào/ra: Bắt đầu 0/1 · Giao việc 1/1 (có duyệt 1/2) · Tác vụ hệ thống 1/1 (+ cổng lỗi)
 * · Điều kiện 1/≥2 · Gộp nhánh ≥2/1 · Kết thúc ≥1/0.
 */

import { NodeType, isGatewayType } from '../models/node-type';
import { NODE_HEADER_CENTER_Y, nodeRowCenterY } from './node-view.config';
export type { NodeType } from '../models/node-type';

/** Hàm dịch (TranslateService.instant) truyền từ service vào các hàm thuần trong file này */
export type TranslateFn = (key: string, params?: Record<string, any>) => string;
const V = 'PROCESS_GRAPH.VALIDATION.';
const P = 'PROCESS_GRAPH.CANVAS.PORTS.';

export interface BpmnNodePortRule {
  type: NodeType;
  title: string;
  minIn: number;
  maxIn: number;
  minOut: number;
  maxOut: number;
  description: string;
}

export const BPMN_NODE_PORT_RULES: Record<NodeType, BpmnNodePortRule> = {
  START: {
    type: 'START',
    title: 'Trigger',
    minIn: 0,
    maxIn: 0,
    minOut: 1,
    maxOut: 1,
    description: 'Trigger: Khởi tạo tiến trình. In = 0 | Out = 1',
  },
  USER_TASK: {
    type: 'USER_TASK',
    title: 'User Task',
    minIn: 1,
    maxIn: 1,
    minOut: 1,
    maxOut: 2, // 1 cổng cho tác vụ thường, 2 cổng nếu là Approval Step
    description:
      'User Task: In = 1 | Out = 1 (hoặc Out = 2 nếu là Approval Step: Duyệt / Từ chối)',
  },
  SYSTEM_TASK: {
    type: 'SYSTEM_TASK',
    title: 'Action (Service Task)',
    minIn: 1,
    maxIn: 1,
    minOut: 2,
    maxOut: 2,
    description:
      'Action: Gọi API ngầm. In = 1 | Out = 2 cố định (Out chính: Thành công 200; Out phụ: Ngoại lệ/Lỗi - US-22, BR-INT-05)',
  },
  GATEWAY_EXCLUSIVE: {
    type: 'GATEWAY_EXCLUSIVE',
    title: 'Condition (Exclusive Gateway)',
    minIn: 1,
    maxIn: 1,
    minOut: 2,
    maxOut: 99,
    description:
      'Condition: Exclusive Gateway. In = 1 | Out >= 2 (sinh cổng động theo danh sách nhánh rẽ)',
  },
  GATEWAY_INCLUSIVE: {
    type: 'GATEWAY_INCLUSIVE',
    title: 'Chọn nhiều nhánh (Inclusive Gateway)',
    minIn: 1,
    maxIn: 1,
    minOut: 2,
    maxOut: 99,
    description:
      'Chọn nhiều nhánh: In = 1 | Out >= 2 (đi mọi nhánh có điều kiện thoả mãn)',
  },
  GATEWAY_PARALLEL: {
    type: 'GATEWAY_PARALLEL',
    title: 'Split (Parallel Gateway)',
    minIn: 1,
    maxIn: 1,
    minOut: 2,
    maxOut: 99,
    description:
      'Split: Parallel Gateway. In = 1 | Out >= 2 (phân tách luồng chạy song song đồng thời)',
  },
  JOIN: {
    type: 'JOIN',
    title: 'Merge (Parallel Gateway)',
    minIn: 2,
    maxIn: 99,
    minOut: 1,
    maxOut: 1,
    description:
      'Merge: Parallel Gateway. In >= 2 | Out = 1 (gom và đồng bộ các luồng song song trước khi đi tiếp)',
  },
  END: {
    type: 'END',
    title: 'End',
    minIn: 1,
    maxIn: 99,
    minOut: 0,
    maxOut: 0,
    description: 'End: Kết thúc tiến trình. In >= 1 | Out = 0',
  },
  NOTIFICATION: {
    type: 'NOTIFICATION',
    title: 'Thông báo',
    minIn: 1,
    maxIn: 1,
    minOut: 1,
    maxOut: 1,
    description:
      'Thông báo: Gửi tin nhắn SMS / Email / Webhook. In = 1 | Out = 1',
  },
  SUB_PROCESS: {
    type: 'SUB_PROCESS',
    title: 'Quy trình con',
    minIn: 1,
    maxIn: 1,
    minOut: 1,
    maxOut: 1,
    description: 'Quy trình con: Gọi lồng tiến trình con. In = 1 | Out = 1',
  },
};

const PORT_IN = (title: string) => ({
  markup: [
    { tagName: 'circle', selector: 'portCircle' },
    { tagName: 'title', selector: 'portTitle' },
  ],
  attrs: {
    portCircle: {
      r: 6,
      magnet: 'passive',
      fill: 'transparent',
      stroke: 'none',
    },
    portTitle: { text: title },
  },
});

const PORT_OUT = (title: string) => ({
  markup: [
    { tagName: 'circle', selector: 'portRing' },
    { tagName: 'circle', selector: 'portCircle' },
    { tagName: 'title', selector: 'portTitle' },
  ],
  attrs: {
    portRing: { r: 4.5, fill: '#ffc0cd', stroke: 'none' },
    portCircle: {
      r: 4,
      magnet: true,
      fill: '#ed0231',
      stroke: '#ffffff',
      strokeWidth: 1,
      cursor: 'crosshair',
    },
    portTitle: { text: title },
  },
});

/** Nhóm cổng X6 dùng cho mọi loại node */
export const BPMN_PORT_GROUPS = {
  in: { position: 'left', ...PORT_IN('Cổng vào (In)') },
  // Cổng vào ở tâm phần đầu card (card có dòng nhánh cao hơn 72)
  inHeader: {
    position: { name: 'absolute', args: { x: 0, y: NODE_HEADER_CENTER_Y } },
    ...PORT_IN('Cổng vào (In)'),
  },
  inMerge: { position: 'left', ...PORT_IN('Cổng vào đồng bộ (Merge In)') },
  out: { position: 'right', ...PORT_OUT('Cổng ra (Output)') },
  outSuccess: { position: 'absolute', ...PORT_OUT('Thành công (200 OK)') },
  outException: {
    position: 'absolute',
    ...PORT_OUT('Ngoại lệ / Lỗi (Exception Path - BR-INT-05)'),
  },
  outCondition: {
    position: 'absolute',
    ...PORT_OUT('Cổng rẽ nhánh (Condition Out)'),
  },
  outApprove: { position: 'absolute', ...PORT_OUT('Đồng ý / Duyệt (Approve)') },
  outReject: { position: 'absolute', ...PORT_OUT('Từ chối (Reject)') },
  outSplit: {
    position: 'right',
    ...PORT_OUT('Cổng luồng song song (Parallel Out)'),
  },
};
/** Danh sách cổng của node theo type */
export function getNodePortItems(
  type: NodeType,
  customData: any,
  cardWidth: number,
  t: TranslateFn,
): any[] {
  switch (type) {
    case 'START':
      // Trigger: In = 0 | Out = 1
      return [
        {
          id: 'out',
          group: 'out',
          attrs: { portTitle: { text: t(P + 'START_OUT') } },
        },
      ];

    case 'USER_TASK':
      // User Task: In = 1 | Out = 1 (hoặc Out = 2 nếu là Approval Step)
      if (customData?.isApprovalStep) {
        return [
          {
            id: 'in',
            group: 'inHeader',
            attrs: { portTitle: { text: t(P + 'IN') } },
          },
          {
            id: 'out-approve',
            group: 'outApprove',
            args: { x: cardWidth, y: nodeRowCenterY(0) },
            attrs: { portTitle: { text: t(P + 'APPROVE') } },
          },
          {
            id: 'out-reject',
            group: 'outReject',
            args: { x: cardWidth, y: nodeRowCenterY(1) },
            attrs: { portTitle: { text: t(P + 'REJECT') } },
          },
        ];
      }
      return [
        { id: 'in', group: 'in', attrs: { portTitle: { text: t(P + 'IN') } } },
        {
          id: 'out',
          group: 'out',
          attrs: { portTitle: { text: t(P + 'COMPLETE') } },
        },
      ];

    case 'SYSTEM_TASK':
      // Action: 1 cổng ra chuẩn (hoặc 2 cổng nếu bật hasExceptionPort)
      if (customData?.hasExceptionPort) {
        return [
          {
            id: 'in',
            group: 'inHeader',
            attrs: { portTitle: { text: t(P + 'IN') } },
          },
          {
            id: 'out-success',
            group: 'outSuccess',
            args: { x: cardWidth, y: nodeRowCenterY(0) },
            attrs: { portTitle: { text: t(P + 'SUCCESS') } },
          },
          {
            id: 'out-failure',
            group: 'outException',
            args: { x: cardWidth, y: nodeRowCenterY(1) },
            attrs: { portTitle: { text: t(P + 'FAILURE') } },
          },
        ];
      }
      return [
        { id: 'in', group: 'in', attrs: { portTitle: { text: t(P + 'IN') } } },
        {
          id: 'out',
          group: 'out',
          attrs: { portTitle: { text: t(P + 'OUT') } },
        },
      ];

    case 'GATEWAY_EXCLUSIVE':
    case 'GATEWAY_PARALLEL':
    case 'GATEWAY_INCLUSIVE': {
      // 3 loại điều kiện dùng chung cổng ra theo danh sách trường hợp (+ Mặc định)
      // Condition (Exclusive Gateway): In = 1 | Out >= 2
      let branches: any[] = customData?.branches
        ? [...customData.branches]
        : [];
      if (!branches || branches.length === 0) {
        branches = [
          {
            id: 'br-1',
            name: t('PROCESS_GRAPH.CANVAS.DEFAULT_CASE_NAME'),
            value: 'valid',
            expression: 'true',
            isDefault: false,
          },
          {
            id: 'br-default',
            name: t('PROCESS_GRAPH.CANVAS.DEFAULT_BRANCH'),
            value: 'default',
            expression: 'default',
            isDefault: true,
          },
        ];
      }

      // Nhánh Mặc định luôn có và nằm cuối (dưới cùng)
      const defaultIdx = branches.findIndex((b: any) => b.isDefault);
      if (defaultIdx === -1) {
        branches.push({
          id: 'br-default',
          name: t('PROCESS_GRAPH.CANVAS.DEFAULT_BRANCH'),
          value: 'default',
          expression: 'default',
          isDefault: true,
        });
      } else if (defaultIdx !== branches.length - 1) {
        const [defBr] = branches.splice(defaultIdx, 1);
        branches.push(defBr);
      }

      return [
        {
          id: 'in',
          group: 'inHeader',
          attrs: { portTitle: { text: t(P + 'IN') } },
        },
        ...branches.map((b: any, idx: number) => ({
          id: b.id || (b.isDefault ? 'out-default' : `out-branch-${idx}`),
          group: 'outCondition',
          args: { x: cardWidth, y: nodeRowCenterY(idx) },
          attrs: {
            portTitle: {
              text: b.isDefault
                ? t(P + 'DEFAULT_BRANCH')
                : b.name ||
                  b.defaultLabel ||
                  t('PROCESS_GRAPH.CANVAS.BRANCH_N', { index: idx + 1 }),
            },
          },
        })),
      ];
    }

    case 'JOIN':
      // Merge (Parallel Gateway): In >= 2 | Out = 1
      return [
        {
          id: 'in-merge-0',
          group: 'inMerge',
          attrs: { portTitle: { text: t(P + 'MERGE_IN_N', { index: 1 }) } },
        },
        {
          id: 'in-merge-1',
          group: 'inMerge',
          attrs: { portTitle: { text: t(P + 'MERGE_IN_N', { index: 2 }) } },
        },
        {
          id: 'out',
          group: 'out',
          attrs: { portTitle: { text: t(P + 'CONTINUE') } },
        },
      ];

    case 'END':
      // End: In >= 1 | Out = 0
      return [
        {
          id: 'in',
          group: 'in',
          attrs: { portTitle: { text: t(P + 'END_IN') } },
        },
      ];

    case 'NOTIFICATION':
      return [
        { id: 'in', group: 'in', attrs: { portTitle: { text: t(P + 'IN') } } },
        {
          id: 'out',
          group: 'out',
          attrs: { portTitle: { text: t(P + 'NOTIFY_DONE') } },
        },
      ];

    case 'SUB_PROCESS':
      return [
        { id: 'in', group: 'in', attrs: { portTitle: { text: t(P + 'IN') } } },
        {
          id: 'out',
          group: 'out',
          attrs: { portTitle: { text: t(P + 'SUB_PROCESS_DONE') } },
        },
      ];

    default:
      return [
        { id: 'in', group: 'in' },
        { id: 'out', group: 'out' },
      ];
  }
}

/** Kiểm tra khi kéo dây (X6 connecting.validateConnection): chặn nối sai luật cổng */
export function validateBpmnConnection(params: {
  sourceCell: any;
  targetCell: any;
  sourcePort?: string;
  targetPort?: string;
  edge?: any;
  graph?: any;
}): boolean {
  const { sourceCell, targetCell, sourcePort, targetPort, edge, graph } =
    params;

  // 1. Chỉ cho phép nối giữa 2 Node khác nhau
  if (!sourceCell || !targetCell) return false;
  if (!sourceCell.isNode?.() || !targetCell.isNode?.()) return false;
  if (sourceCell.id === targetCell.id) return false;

  const sourceData = sourceCell.getData() || {};
  const targetData = targetCell.getData() || {};
  const sourceType = (sourceData.type || 'USER_TASK') as NodeType;
  const targetType = (targetData.type || 'USER_TASK') as NodeType;

  // 2. BPMN BOUNDARY:
  // - Trigger không có cổng vào (In = 0): Cấm mọi đường nối VÀO Trigger
  if (targetType === 'START') {
    return false;
  }
  // - End không có cổng ra (Out = 0): Cấm mọi đường nối TỪ End đi ra
  if (sourceType === 'END') {
    return false;
  }

  // 3. DIRECTIONALITY: Source port phải là Out, Target port phải là In
  const sPort = (sourcePort || '').toLowerCase();
  const tPort = (targetPort || '').toLowerCase();

  if (sPort) {
    const isOutPort = sPort.startsWith('out') || !sPort.startsWith('in');
    if (!isOutPort) return false; // Không được kéo từ cổng In
  }
  if (tPort) {
    const isInPort = tPort.startsWith('in') || !tPort.startsWith('out');
    if (!isInPort) return false; // Không được cắm vào cổng Out
  }

  const currentGraph = graph || sourceCell.model?.graph || sourceCell.graph;
  if (currentGraph) {
    const existingEdges = currentGraph.getEdges() || [];

    // 4. DUPLICATE EDGE: Tránh kéo trùng lặp 2 dây giữa cùng 1 cặp cổng
    const isDuplicate = existingEdges.some((e: any) => {
      if (edge && e.id === edge.id) return false;
      const s = e.getSource();
      const t = e.getTarget();
      const sCellId = s?.cell || s;
      const tCellId = t?.cell || t;
      const sPId = s?.port || '';
      const tPId = t?.port || '';
      return (
        sCellId === sourceCell.id &&
        tCellId === targetCell.id &&
        sPId === sourcePort &&
        tPId === targetPort
      );
    });
    if (isDuplicate) return false;

    // 5. IN-DEGREE CHECK:
    // Ngoại trừ JOIN (gom luồng) và END (kết thúc), các node khác chỉ nhận tối đa 1 dây vào (In = 1)
    if (targetType !== 'JOIN' && targetType !== 'END') {
      const incomingEdges = currentGraph.getIncomingEdges(targetCell) || [];
      const incomingOtherEdges = incomingEdges.filter(
        (e: any) => !edge || e.id !== edge.id,
      );
      if (incomingOtherEdges.length >= 1) {
        return false; // Đã có 1 luồng nối vào Node này
      }
    }

    // 6. OUT-DEGREE CHECK THEO TỪNG CỔNG:
    // Mỗi cổng ra cụ thể chỉ được nối đến 1 đích duy nhất
    if (sourcePort) {
      const outgoingEdges = currentGraph.getOutgoingEdges(sourceCell) || [];
      const portOutgoing = outgoingEdges.filter((e: any) => {
        if (edge && e.id === edge.id) return false;
        const pId = e.getSourcePortId?.() || e.getSource()?.port;
        return pId === sourcePort;
      });
      if (portOutgoing.length >= 1) {
        return false; // Cổng này đã có dây nối
      }
    }
  }

  return true;
}

export interface GraphValidationError {
  nodeId?: string;
  nodeKey?: string;
  nodeLabel?: string;
  type: NodeType;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface GraphValidationResult {
  isValid: boolean;
  errors: GraphValidationError[];
  warnings: GraphValidationError[];
  summary: string;
}

/** Validate toàn bộ đồ thị theo luật cổng của từng loại node, trả về lỗi / cảnh báo */
export function validateBpmnGraph(
  graph: any,
  t: TranslateFn,
): GraphValidationResult {
  const errors: GraphValidationError[] = [];
  const warnings: GraphValidationError[] = [];

  if (!graph) {
    return {
      isValid: false,
      errors: [
        {
          type: 'START',
          code: 'GRAPH_NULL',
          message: t(V + 'GRAPH_NULL'),
          severity: 'error',
        },
      ],
      warnings: [],
      summary: t(V + 'GRAPH_NULL'),
    };
  }

  const nodes = graph.getNodes() || [];
  const edges = graph.getEdges() || [];

  if (nodes.length === 0) {
    return {
      isValid: false,
      errors: [
        {
          type: 'START',
          code: 'GRAPH_EMPTY',
          message: t(V + 'GRAPH_EMPTY'),
          severity: 'error',
        },
      ],
      warnings: [],
      summary: t(V + 'GRAPH_EMPTY_SUMMARY'),
    };
  }

  // 1. KIỂM TRA TRIGGER (In = 0 | Out = 1)
  const triggers = nodes.filter(
    (n: any) => (n.getData()?.type || '') === 'START',
  );
  if (triggers.length === 0) {
    errors.push({
      type: 'START',
      code: 'TRIGGER_MISSING',
      message: t(V + 'TRIGGER_MISSING'),
      severity: 'error',
    });
  } else if (triggers.length > 1) {
    warnings.push({
      type: 'START',
      code: 'TRIGGER_MULTIPLE',
      message: t(V + 'TRIGGER_MULTIPLE', { count: triggers.length }),
      severity: 'warning',
    });
  }

  triggers.forEach((trgNode: any) => {
    const data = trgNode.getData() || {};
    const label = data.label || t('PROCESS_GRAPH.NODE_TYPES.START');
    const inEdges = graph.getIncomingEdges(trgNode) || [];
    const outEdges = graph.getOutgoingEdges(trgNode) || [];

    // Trigger: In = 0
    if (inEdges.length > 0) {
      errors.push({
        nodeId: trgNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'START',
        code: 'TRIGGER_IN_INVALID',
        message: t(V + 'TRIGGER_IN_INVALID', { label, count: inEdges.length }),
        severity: 'error',
      });
    }

    // Trigger: Out = 1
    if (outEdges.length === 0) {
      errors.push({
        nodeId: trgNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'START',
        code: 'TRIGGER_OUT_ZERO',
        message: t(V + 'TRIGGER_OUT_ZERO', { label }),
        severity: 'error',
      });
    } else if (outEdges.length > 1) {
      errors.push({
        nodeId: trgNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'START',
        code: 'TRIGGER_OUT_EXCESS',
        message: t(V + 'TRIGGER_OUT_EXCESS', { label, count: outEdges.length }),
        severity: 'error',
      });
    }
  });

  // 2. KIỂM TRA END EVENT (In >= 1 | Out = 0)
  const endNodes = nodes.filter(
    (n: any) => (n.getData()?.type || '') === 'END',
  );
  if (endNodes.length === 0) {
    errors.push({
      type: 'END',
      code: 'END_MISSING',
      message: t(V + 'END_MISSING'),
      severity: 'error',
    });
  }

  endNodes.forEach((endNode: any) => {
    const data = endNode.getData() || {};
    const label = data.label || t('PROCESS_GRAPH.NODE_TYPES.END');
    const inEdges = graph.getIncomingEdges(endNode) || [];
    const outEdges = graph.getOutgoingEdges(endNode) || [];

    // End: In >= 1
    if (inEdges.length === 0) {
      errors.push({
        nodeId: endNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'END',
        code: 'END_IN_ZERO',
        message: t(V + 'END_IN_ZERO', { label }),
        severity: 'error',
      });
    }

    // End: Out = 0
    if (outEdges.length > 0) {
      errors.push({
        nodeId: endNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'END',
        code: 'END_OUT_INVALID',
        message: t(V + 'END_OUT_INVALID', { label, count: outEdges.length }),
        severity: 'error',
      });
    }
  });

  // 3. KIỂM TRA ACTION (Service Task: In = 1 | Out = 1, thêm cổng Lỗi khi bật hasExceptionPort)
  const actionNodes = nodes.filter(
    (n: any) => (n.getData()?.type || '') === 'SYSTEM_TASK',
  );
  actionNodes.forEach((actNode: any) => {
    const data = actNode.getData() || {};
    const label = data.label || t('PROCESS_GRAPH.NODE_TYPES.SYSTEM_TASK');
    const inEdges = graph.getIncomingEdges(actNode) || [];
    const outEdges = graph.getOutgoingEdges(actNode) || [];

    // Action: In = 1
    if (inEdges.length === 0) {
      errors.push({
        nodeId: actNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'SYSTEM_TASK',
        code: 'ACTION_IN_ZERO',
        message: t(V + 'ACTION_IN_ZERO', { label }),
        severity: 'error',
      });
    }

    // Action: cổng Thành công ('out' / 'out-success') + cổng Lỗi ('out-failure', khi bật hasExceptionPort)
    const outPortIds = outEdges.map(
      (e: any) => e.getSourcePortId?.() || e.getSource()?.port,
    );
    const hasSuccessOut =
      outPortIds.includes('out') || outPortIds.includes('out-success');
    const hasFailureOut =
      !data.hasExceptionPort || outPortIds.includes('out-failure');

    if (!hasSuccessOut) {
      errors.push({
        nodeId: actNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'SYSTEM_TASK',
        code: 'ACTION_SUCCESS_OUT_MISSING',
        message: t(V + 'ACTION_SUCCESS_OUT_MISSING', { label }),
        severity: 'error',
      });
    }

    if (!hasFailureOut) {
      errors.push({
        nodeId: actNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'SYSTEM_TASK',
        code: 'ACTION_EXCEPTION_OUT_MISSING',
        message: t(V + 'ACTION_EXCEPTION_OUT_MISSING', { label }),
        severity: 'error',
      });
    }
  });

  // 4. KIỂM TRA CONDITION (Exclusive Gateway: In = 1 | Out >= 2)
  const conditionNodes = nodes.filter((n: any) =>
    isGatewayType(n.getData()?.type),
  );
  conditionNodes.forEach((condNode: any) => {
    const data = condNode.getData() || {};
    const label = data.label || t('PROCESS_GRAPH.NODE_TYPES.GATEWAY_EXCLUSIVE');
    const branches = data.branches || [];
    const inEdges = graph.getIncomingEdges(condNode) || [];
    const outEdges = graph.getOutgoingEdges(condNode) || [];

    // Condition: In = 1
    if (inEdges.length === 0) {
      errors.push({
        nodeId: condNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: data.type,
        code: 'CONDITION_IN_ZERO',
        message: t(V + 'CONDITION_IN_ZERO', { label }),
        severity: 'error',
      });
    }

    // Condition: Cần tối thiểu 2 nhánh rẽ
    if (branches.length < 2) {
      errors.push({
        nodeId: condNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: data.type,
        code: 'CONDITION_BRANCH_LESS_THAN_2',
        message: t(V + 'CONDITION_BRANCH_LESS_THAN_2', {
          label,
          count: branches.length,
        }),
        severity: 'error',
      });
    }

    // Từng cổng nhánh rẽ phải được nối dây ra ngoài
    branches.forEach((br: any, idx: number) => {
      const portId =
        br.id || (br.isDefault ? 'out-default' : `out-branch-${idx}`);
      const isConnected = outEdges.some((e: any) => {
        const p = e.getSourcePortId?.() || e.getSource()?.port;
        return (
          p === portId ||
          p === `out-branch-${idx}` ||
          (br.isDefault && (p === 'out-default' || p === 'br-default'))
        );
      });
      if (!isConnected) {
        if (br.isDefault) {
          warnings.push({
            nodeId: condNode.id,
            nodeKey: data.nodeKey,
            nodeLabel: label,
            type: data.type,
            code: 'CONDITION_DEFAULT_UNCONNECTED',
            message: t(V + 'CONDITION_DEFAULT_UNCONNECTED', {
              branch: t('PROCESS_GRAPH.CANVAS.DEFAULT_BRANCH'),
              label,
            }),
            severity: 'warning',
          });
        } else {
          errors.push({
            nodeId: condNode.id,
            nodeKey: data.nodeKey,
            nodeLabel: label,
            type: data.type,
            code: 'CONDITION_BRANCH_UNCONNECTED',
            message: t(V + 'CONDITION_BRANCH_UNCONNECTED', {
              branch:
                br.name ||
                t('PROCESS_GRAPH.CANVAS.BRANCH_N', { index: idx + 1 }),
              label,
            }),
            severity: 'error',
          });
        }
      }
    });
  });

  // 5. KIỂM TRA USER TASK (In = 1 | Out = 1 hoặc Out = 2 nếu là Approval Step)
  const taskNodes = nodes.filter(
    (n: any) => (n.getData()?.type || '') === 'USER_TASK',
  );
  taskNodes.forEach((taskNode: any) => {
    const data = taskNode.getData() || {};
    const label = data.label || t('PROCESS_GRAPH.NODE_TYPES.USER_TASK');
    const isApproval = !!data.isApprovalStep;
    const inEdges = graph.getIncomingEdges(taskNode) || [];
    const outEdges = graph.getOutgoingEdges(taskNode) || [];

    // User Task: In = 1
    if (inEdges.length === 0) {
      errors.push({
        nodeId: taskNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'USER_TASK',
        code: 'TASK_IN_ZERO',
        message: t(V + 'TASK_IN_ZERO', { label }),
        severity: 'error',
      });
    }

    // User Task: Out = 1 (hoặc Out = 2 nếu Approval Step)
    if (isApproval) {
      const hasApprove = outEdges.some(
        (e: any) =>
          (e.getSourcePortId?.() || e.getSource()?.port) === 'out-approve',
      );
      const hasReject = outEdges.some(
        (e: any) =>
          (e.getSourcePortId?.() || e.getSource()?.port) === 'out-reject',
      );
      if (!hasApprove || !hasReject) {
        errors.push({
          nodeId: taskNode.id,
          nodeKey: data.nodeKey,
          nodeLabel: label,
          type: 'USER_TASK',
          code: 'TASK_APPROVAL_OUT_MISSING',
          message: t(V + 'TASK_APPROVAL_OUT_MISSING', { label }),
          severity: 'error',
        });
      }
    } else {
      if (outEdges.length === 0) {
        errors.push({
          nodeId: taskNode.id,
          nodeKey: data.nodeKey,
          nodeLabel: label,
          type: 'USER_TASK',
          code: 'TASK_OUT_ZERO',
          message: t(V + 'TASK_OUT_ZERO', { label }),
          severity: 'error',
        });
      } else if (outEdges.length > 1) {
        errors.push({
          nodeId: taskNode.id,
          nodeKey: data.nodeKey,
          nodeLabel: label,
          type: 'USER_TASK',
          code: 'TASK_OUT_EXCESS',
          message: t(V + 'TASK_OUT_EXCESS', { label }),
          severity: 'error',
        });
      }
    }
  });

  // 6. KIỂM TRA JOIN – Gộp nhánh (In >= 2 | Out = 1)
  const mergeNodes = nodes.filter(
    (n: any) => (n.getData()?.type || '') === 'JOIN',
  );
  mergeNodes.forEach((mNode: any) => {
    const data = mNode.getData() || {};
    const label = data.label || t('PROCESS_GRAPH.NODE_TYPES.JOIN');
    const inEdges = graph.getIncomingEdges(mNode) || [];
    const outEdges = graph.getOutgoingEdges(mNode) || [];

    // Merge: In >= 2
    if (inEdges.length < 2) {
      errors.push({
        nodeId: mNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'JOIN',
        code: 'MERGE_IN_LESS_THAN_2',
        message: t(V + 'MERGE_IN_LESS_THAN_2', {
          label,
          count: inEdges.length,
        }),
        severity: 'error',
      });
    }

    // Merge: Out = 1
    if (outEdges.length === 0) {
      errors.push({
        nodeId: mNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'JOIN',
        code: 'MERGE_OUT_ZERO',
        message: t(V + 'MERGE_OUT_ZERO', { label }),
        severity: 'error',
      });
    } else if (outEdges.length > 1) {
      errors.push({
        nodeId: mNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'JOIN',
        code: 'MERGE_OUT_EXCESS',
        message: t(V + 'MERGE_OUT_EXCESS', { label, count: outEdges.length }),
        severity: 'error',
      });
    }
  });

  // 7. KIỂM TRA NODE CÔ LẬP (ISOLATED NODES)
  nodes.forEach((node: any) => {
    const inEdges = graph.getIncomingEdges(node) || [];
    const outEdges = graph.getOutgoingEdges(node) || [];
    const data = node.getData() || {};
    const label =
      data.label || data.typeTitle || t('PROCESS_GRAPH.NODE_TYPES.STEP');

    if (inEdges.length === 0 && outEdges.length === 0) {
      errors.push({
        nodeId: node.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: data.type || 'USER_TASK',
        code: 'NODE_ISOLATED',
        message: t(V + 'NODE_ISOLATED', { label }),
        severity: 'error',
      });
    }
  });

  const isValid = errors.length === 0;
  const summary = isValid
    ? t(V + 'SUMMARY_VALID')
    : t(V + 'SUMMARY_INVALID', { count: errors.length });

  return {
    isValid,
    errors,
    warnings,
    summary,
  };
}
