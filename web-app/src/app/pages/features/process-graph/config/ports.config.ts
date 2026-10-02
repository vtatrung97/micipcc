/**
 * BPMN 2.0 Standard Node Ports & Graph Validation Configuration
 * 
 * Rules:
 * 1. Trigger: In = 0 | Out = 1
 * 2. User Task: In = 1 | Out = 1 (hoặc Out = 2 nếu là Approval Step)
 * 3. Action (Service Task): In = 1 | Out = 2 cố định (Out chính: Thành công; Out phụ màu đỏ: Ngoại lệ/Lỗi - US-22, BR-INT-05)
 * 4. Condition (Exclusive Gateway): In = 1 | Out >= 2 (sinh cổng động theo danh sách nhánh rẽ)
 * 5. Split (Parallel Gateway): In = 1 | Out >= 2 (phân tách luồng chạy song song đồng thời)
 * 6. Merge (Parallel Gateway): In >= 2 | Out = 1 (gom và đồng bộ các luồng song song trước khi đi tiếp)
 * 7. End: In >= 1 | Out = 0 (kết thúc tiến trình)
 */

export type NodeType = 'trigger' | 'task' | 'action' | 'condition' | 'split' | 'merge' | 'end';

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
  trigger: {
    type: 'trigger',
    title: 'Trigger',
    minIn: 0,
    maxIn: 0,
    minOut: 1,
    maxOut: 1,
    description: 'Trigger: Khởi tạo tiến trình. In = 0 | Out = 1'
  },
  task: {
    type: 'task',
    title: 'User Task',
    minIn: 1,
    maxIn: 1,
    minOut: 1,
    maxOut: 2, // 1 cổng cho tác vụ thường, 2 cổng nếu là Approval Step
    description: 'User Task: In = 1 | Out = 1 (hoặc Out = 2 nếu là Approval Step: Duyệt / Từ chối)'
  },
  action: {
    type: 'action',
    title: 'Action (Service Task)',
    minIn: 1,
    maxIn: 1,
    minOut: 2,
    maxOut: 2,
    description: 'Action: Gọi API ngầm. In = 1 | Out = 2 cố định (Out chính: Thành công 200; Out phụ: Ngoại lệ/Lỗi - US-22, BR-INT-05)'
  },
  condition: {
    type: 'condition',
    title: 'Condition (Exclusive Gateway)',
    minIn: 1,
    maxIn: 1,
    minOut: 2,
    maxOut: 99,
    description: 'Condition: Exclusive Gateway. In = 1 | Out >= 2 (sinh cổng động theo danh sách nhánh rẽ)'
  },
  split: {
    type: 'split',
    title: 'Split (Parallel Gateway)',
    minIn: 1,
    maxIn: 1,
    minOut: 2,
    maxOut: 99,
    description: 'Split: Parallel Gateway. In = 1 | Out >= 2 (phân tách luồng chạy song song đồng thời)'
  },
  merge: {
    type: 'merge',
    title: 'Merge (Parallel Gateway)',
    minIn: 2,
    maxIn: 99,
    minOut: 1,
    maxOut: 1,
    description: 'Merge: Parallel Gateway. In >= 2 | Out = 1 (gom và đồng bộ các luồng song song trước khi đi tiếp)'
  },
  end: {
    type: 'end',
    title: 'End',
    minIn: 1,
    maxIn: 99,
    minOut: 0,
    maxOut: 0,
    description: 'End: Kết thúc tiến trình. In >= 1 | Out = 0'
  }
};

/**
 * X6 Port Groups definition for BPMN Nodes
 */
export const BPMN_PORT_GROUPS = {
  in: {
    position: 'left',
    markup: [
      { tagName: 'circle', selector: 'portCircle' },
      { tagName: 'title', selector: 'portTitle' }
    ],
    attrs: {
      portCircle: {
        r: 4,
        magnet: true,
        stroke: '#ffffff',
        fill: '#94a3b8',
        strokeWidth: 1.5
      },
      portTitle: { text: 'Cổng vào (In)' }
    }
  },
  inHeader: {
    position: { name: 'absolute', args: { x: 0, y: 22 } },
    markup: [
      { tagName: 'circle', selector: 'portCircle' },
      { tagName: 'title', selector: 'portTitle' }
    ],
    attrs: {
      portCircle: {
        r: 4,
        magnet: true,
        stroke: '#ffffff',
        fill: '#94a3b8',
        strokeWidth: 1.5
      },
      portTitle: { text: 'Cổng vào (In)' }
    }
  },
  inMerge: {
    position: 'left',
    markup: [
      { tagName: 'circle', selector: 'portCircle' },
      { tagName: 'title', selector: 'portTitle' }
    ],
    attrs: {
      portCircle: {
        r: 4,
        magnet: true,
        stroke: '#ffffff',
        fill: '#94a3b8',
        strokeWidth: 1.5
      },
      portTitle: { text: 'Cổng vào đồng bộ (Merge In)' }
    }
  },
  out: {
    position: 'right',
    markup: [
      { tagName: 'circle', selector: 'portCircle' },
      { tagName: 'title', selector: 'portTitle' }
    ],
    attrs: {
      portCircle: {
        r: 4,
        magnet: true,
        stroke: '#ffffff',
        fill: '#22c55e',
        strokeWidth: 1.5
      },
      portTitle: { text: 'Cổng ra (Output)' }
    }
  },
  outSuccess: {
    position: 'absolute',
    markup: [
      { tagName: 'circle', selector: 'portCircle' },
      { tagName: 'title', selector: 'portTitle' }
    ],
    attrs: {
      portCircle: {
        r: 4,
        magnet: true,
        stroke: '#ffffff',
        fill: '#22c55e',
        strokeWidth: 1.5
      },
      portTitle: { text: 'Thành công (200 OK)' }
    }
  },
  outException: {
    position: 'absolute',
    markup: [
      { tagName: 'circle', selector: 'portCircle' },
      { tagName: 'title', selector: 'portTitle' }
    ],
    attrs: {
      portCircle: {
        r: 4,
        magnet: true,
        stroke: '#ffffff',
        fill: '#22c55e',
        strokeWidth: 1.5
      },
      portTitle: { text: 'Ngoại lệ / Lỗi (Exception Path - BR-INT-05)' }
    }
  },
  outCondition: {
    position: 'absolute',
    markup: [
      { tagName: 'circle', selector: 'portCircle' },
      { tagName: 'title', selector: 'portTitle' }
    ],
    attrs: {
      portCircle: {
        r: 4,
        magnet: true,
        stroke: '#ffffff',
        fill: '#22c55e',
        strokeWidth: 1.5
      },
      portTitle: { text: 'Cổng rẽ nhánh (Condition Out)' }
    }
  },
  outApprove: {
    position: 'absolute',
    markup: [
      { tagName: 'circle', selector: 'portCircle' },
      { tagName: 'title', selector: 'portTitle' }
    ],
    attrs: {
      portCircle: {
        r: 4,
        magnet: true,
        stroke: '#ffffff',
        fill: '#22c55e',
        strokeWidth: 1.5
      },
      portTitle: { text: 'Đồng ý / Duyệt (Approve)' }
    }
  },
  outReject: {
    position: 'absolute',
    markup: [
      { tagName: 'circle', selector: 'portCircle' },
      { tagName: 'title', selector: 'portTitle' }
    ],
    attrs: {
      portCircle: {
        r: 4,
        magnet: true,
        stroke: '#ffffff',
        fill: '#22c55e',
        strokeWidth: 1.5
      },
      portTitle: { text: 'Từ chối (Reject)' }
    }
  },
  outSplit: {
    position: 'right',
    markup: [
      { tagName: 'circle', selector: 'portCircle' },
      { tagName: 'title', selector: 'portTitle' }
    ],
    attrs: {
      portCircle: {
        r: 4,
        magnet: true,
        stroke: '#ffffff',
        fill: '#22c55e',
        strokeWidth: 1.5
      },
      portTitle: { text: 'Cổng luồng song song (Parallel Out)' }
    }
  }
};

/**
 * Standard Port Configuration Generator for all 7 BPMN Node types
 */
export function getNodePortItems(type: NodeType, customData?: any, cardWidth: number = 168): any[] {
  switch (type) {
    case 'trigger':
      // Trigger: In = 0 | Out = 1
      return [
        {
          id: 'out',
          group: 'out',
          attrs: { portTitle: { text: 'Khởi tạo luồng (Trigger Out)' } }
        }
      ];

    case 'task':
      // User Task: In = 1 | Out = 1 (hoặc Out = 2 nếu là Approval Step)
      if (customData?.isApprovalStep) {
        return [
          { id: 'in', group: 'inHeader', attrs: { portTitle: { text: 'Cổng vào (In)' } } },
          {
            id: 'out-approve',
            group: 'outApprove',
            args: { x: cardWidth, y: 60 },
            attrs: { portTitle: { text: 'Đồng ý (Approve)' } }
          },
          {
            id: 'out-reject',
            group: 'outReject',
            args: { x: cardWidth, y: 82 },
            attrs: { portTitle: { text: 'Từ chối (Reject)' } }
          }
        ];
      }
      return [
        { id: 'in', group: 'in', attrs: { portTitle: { text: 'Cổng vào (In)' } } },
        { id: 'out', group: 'out', attrs: { portTitle: { text: 'Hoàn tất (Complete)' } } }
      ];

    case 'action':
      // Action (Service Task): In = 1 | Out = 2 cố định (Success + Exception Path)
      return [
        { id: 'in', group: 'inHeader', attrs: { portTitle: { text: 'Cổng vào (In)' } } },
        {
          id: 'out-success',
          group: 'outSuccess',
          args: { x: cardWidth, y: 60 },
          attrs: { portTitle: { text: 'Thành công (200 OK)' } }
        },
        {
          id: 'out-failure',
          group: 'outException',
          args: { x: cardWidth, y: 82 },
          attrs: { portTitle: { text: 'Ngoại lệ / Lỗi (Exception Path - BR-INT-05)' } }
        }
      ];

    case 'condition': {
      // Condition (Exclusive Gateway): In = 1 | Out >= 2
      // Lưu ý: Dòng chữ 'Định tuyến' là tiêu đề khu vực (Header), KHÔNG CÓ PORT OUT.
      // Cổng ra bắt đầu từ nhánh 'Mặc định' (y = 78) và các nhánh con tiếp theo (Nhánh 1, Nhánh 2...)
      let branches: any[] = customData?.branches ? [...customData.branches] : [];
      if (!branches || branches.length === 0) {
        branches = [
          { id: 'br-1', name: 'Nhánh 1', value: '> 500k', expression: '${flow.variables.cuoc > 500000}', isDefault: false, defaultLabel: 'Nhánh 1' },
          { id: 'br-default', name: 'Mặc định', value: 'default', expression: 'default', isDefault: true, defaultLabel: 'Mặc định' }
        ];
      }

      // Ensure default branch is always present and placed at the END (dưới cùng)
      const defaultIdx = branches.findIndex((b: any) => b.isDefault);
      if (defaultIdx === -1) {
        branches.push({ id: 'br-default', name: 'Mặc định', value: 'default', expression: 'default', isDefault: true, defaultLabel: 'Mặc định' });
      } else if (defaultIdx !== branches.length - 1) {
        const [defBr] = branches.splice(defaultIdx, 1);
        branches.push(defBr);
      }

      return [
        { id: 'in', group: 'inHeader', attrs: { portTitle: { text: 'Cổng vào (In)' } } },
        ...branches.map((b: any, idx: number) => ({
          id: b.id || (b.isDefault ? 'out-default' : `out-branch-${idx}`),
          group: 'outCondition',
          args: { x: cardWidth, y: 78 + idx * 22 },
          attrs: {
            portCircle: {
              r: 4,
              magnet: true,
              fill: '#22c55e',
              stroke: '#ffffff',
              strokeWidth: 1.5
            },
            portTitle: { text: b.name || (b.isDefault ? 'Nhánh Mặc định' : (b.defaultLabel || `Nhánh ${idx + 1}`)) }
          }
        }))
      ];
    }

    case 'split':
      // Split (Parallel Gateway): In = 1 | Out >= 2
      return [
        { id: 'in', group: 'in', attrs: { portTitle: { text: 'Cổng vào (In)' } } },
        { id: 'out-split-0', group: 'outSplit', attrs: { portTitle: { text: 'Nhánh song song 1' } } },
        { id: 'out-split-1', group: 'outSplit', attrs: { portTitle: { text: 'Nhánh song song 2' } } }
      ];

    case 'merge':
      // Merge (Parallel Gateway): In >= 2 | Out = 1
      return [
        { id: 'in-merge-0', group: 'inMerge', attrs: { portTitle: { text: 'Luồng song song 1' } } },
        { id: 'in-merge-1', group: 'inMerge', attrs: { portTitle: { text: 'Luồng song song 2' } } },
        { id: 'out', group: 'out', attrs: { portTitle: { text: 'Tiếp tục luồng' } } }
      ];

    case 'end':
      // End: In >= 1 | Out = 0
      return [
        { id: 'in', group: 'in', attrs: { portTitle: { text: 'Điểm kết thúc (End)' } } }
      ];

    default:
      return [
        { id: 'in', group: 'in' },
        { id: 'out', group: 'out' }
      ];
  }
}

/**
 * Real-time BPMN Connection Dragging Validator (X6 connecting.validateConnection)
 * Ensures user CANNOT draw invalid wires violating BPMN port rules.
 */
export function validateBpmnConnection(params: {
  sourceCell: any;
  targetCell: any;
  sourcePort?: string;
  targetPort?: string;
  edge?: any;
  graph?: any;
}): boolean {
  const { sourceCell, targetCell, sourcePort, targetPort, edge, graph } = params;

  // 1. Chỉ cho phép nối giữa 2 Node khác nhau
  if (!sourceCell || !targetCell) return false;
  if (!sourceCell.isNode?.() || !targetCell.isNode?.()) return false;
  if (sourceCell.id === targetCell.id) return false;

  const sourceData = sourceCell.getData() || {};
  const targetData = targetCell.getData() || {};
  const sourceType = (sourceData.type || 'task') as NodeType;
  const targetType = (targetData.type || 'task') as NodeType;

  // 2. BPMN BOUNDARY:
  // - Trigger không có cổng vào (In = 0): Cấm mọi đường nối VÀO Trigger
  if (targetType === 'trigger') {
    return false;
  }
  // - End không có cổng ra (Out = 0): Cấm mọi đường nối TỪ End đi ra
  if (sourceType === 'end') {
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
      return sCellId === sourceCell.id && tCellId === targetCell.id && sPId === sourcePort && tPId === targetPort;
    });
    if (isDuplicate) return false;

    // 5. IN-DEGREE CHECK:
    // Ngoại trừ 'merge' (gom luồng) và 'end' (kết thúc), các Node khác (Task, Action, Condition, Split) chỉ nhận tối đa 1 dây vào (In = 1)
    if (targetType !== 'merge' && targetType !== 'end') {
      const incomingEdges = currentGraph.getIncomingEdges(targetCell) || [];
      const incomingOtherEdges = incomingEdges.filter((e: any) => !edge || e.id !== edge.id);
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

/**
 * BPMN 2.0 Comprehensive Graph Validation Function
 * Checks all 7 BPMN node connectivity rules and returns detailed diagnostics.
 */
export function validateBpmnGraph(graph: any): GraphValidationResult {
  const errors: GraphValidationError[] = [];
  const warnings: GraphValidationError[] = [];

  if (!graph) {
    return {
      isValid: false,
      errors: [{ type: 'trigger', code: 'GRAPH_NULL', message: 'Đồ thị chưa được khởi tạo', severity: 'error' }],
      warnings: [],
      summary: 'Đồ thị chưa được khởi tạo'
    };
  }

  const nodes = graph.getNodes() || [];
  const edges = graph.getEdges() || [];

  if (nodes.length === 0) {
    return {
      isValid: false,
      errors: [{ type: 'trigger', code: 'GRAPH_EMPTY', message: 'Sơ đồ trống, vui lòng thêm các bước quy trình', severity: 'error' }],
      warnings: [],
      summary: 'Bản vẽ đang trống'
    };
  }

  // 1. KIỂM TRA TRIGGER (In = 0 | Out = 1)
  const triggers = nodes.filter((n: any) => (n.getData()?.type || '') === 'trigger');
  if (triggers.length === 0) {
    errors.push({
      type: 'trigger',
      code: 'TRIGGER_MISSING',
      message: 'Quy trình thiếu điểm khởi tạo Trigger (bắt buộc có ít nhất 1 Trigger)',
      severity: 'error'
    });
  } else if (triggers.length > 1) {
    warnings.push({
      type: 'trigger',
      code: 'TRIGGER_MULTIPLE',
      message: `Quy trình đang có ${triggers.length} điểm khởi tạo Trigger`,
      severity: 'warning'
    });
  }

  triggers.forEach((trgNode: any) => {
    const data = trgNode.getData() || {};
    const label = data.label || 'Trigger';
    const inEdges = graph.getIncomingEdges(trgNode) || [];
    const outEdges = graph.getOutgoingEdges(trgNode) || [];

    // Trigger: In = 0
    if (inEdges.length > 0) {
      errors.push({
        nodeId: trgNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'trigger',
        code: 'TRIGGER_IN_INVALID',
        message: `Trigger [${label}] không được phép có luồng vào (In = 0, hiện có ${inEdges.length})`,
        severity: 'error'
      });
    }

    // Trigger: Out = 1
    if (outEdges.length === 0) {
      errors.push({
        nodeId: trgNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'trigger',
        code: 'TRIGGER_OUT_ZERO',
        message: `Trigger [${label}] chưa kết nối với bước tiếp theo (Out = 1)`,
        severity: 'error'
      });
    } else if (outEdges.length > 1) {
      errors.push({
        nodeId: trgNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'trigger',
        code: 'TRIGGER_OUT_EXCESS',
        message: `Trigger [${label}] chỉ được phép có đúng 1 luồng ra (Out = 1, hiện có ${outEdges.length})`,
        severity: 'error'
      });
    }
  });

  // 2. KIỂM TRA END EVENT (In >= 1 | Out = 0)
  const endNodes = nodes.filter((n: any) => (n.getData()?.type || '') === 'end');
  if (endNodes.length === 0) {
    errors.push({
      type: 'end',
      code: 'END_MISSING',
      message: 'Quy trình thiếu điểm kết thúc (End Event)',
      severity: 'error'
    });
  }

  endNodes.forEach((endNode: any) => {
    const data = endNode.getData() || {};
    const label = data.label || 'End';
    const inEdges = graph.getIncomingEdges(endNode) || [];
    const outEdges = graph.getOutgoingEdges(endNode) || [];

    // End: In >= 1
    if (inEdges.length === 0) {
      errors.push({
        nodeId: endNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'end',
        code: 'END_IN_ZERO',
        message: `Điểm kết thúc [${label}] chưa nhận bất kỳ luồng nào (In >= 1)`,
        severity: 'error'
      });
    }

    // End: Out = 0
    if (outEdges.length > 0) {
      errors.push({
        nodeId: endNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'end',
        code: 'END_OUT_INVALID',
        message: `Điểm kết thúc [${label}] không được phép có luồng ra (Out = 0, hiện có ${outEdges.length})`,
        severity: 'error'
      });
    }
  });

  // 3. KIỂM TRA ACTION (Service Task: In = 1 | Out = 2 cố định - US-22, BR-INT-05)
  const actionNodes = nodes.filter((n: any) => (n.getData()?.type || '') === 'action');
  actionNodes.forEach((actNode: any) => {
    const data = actNode.getData() || {};
    const label = data.label || 'Action';
    const inEdges = graph.getIncomingEdges(actNode) || [];
    const outEdges = graph.getOutgoingEdges(actNode) || [];

    // Action: In = 1
    if (inEdges.length === 0) {
      errors.push({
        nodeId: actNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'action',
        code: 'ACTION_IN_ZERO',
        message: `Action [${label}] chưa có luồng kích hoạt từ bước trước (In = 1)`,
        severity: 'error'
      });
    }

    // Action: Out = 2 cố định (Success + Exception Path)
    const hasSuccessOut = outEdges.some((e: any) => (e.getSourcePortId?.() || e.getSource()?.port) === 'out-success');
    const hasFailureOut = outEdges.some((e: any) => (e.getSourcePortId?.() || e.getSource()?.port) === 'out-failure');

    if (!hasSuccessOut) {
      errors.push({
        nodeId: actNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'action',
        code: 'ACTION_SUCCESS_OUT_MISSING',
        message: `Action [${label}] bắt buộc phải nối dây cổng Thành công (200 OK)`,
        severity: 'error'
      });
    }

    if (!hasFailureOut) {
      errors.push({
        nodeId: actNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'action',
        code: 'ACTION_EXCEPTION_OUT_MISSING',
        message: `Action [${label}] bắt buộc phải nối dây cổng Ngoại lệ/Lỗi màu đỏ (Exception Path theo US-22, BR-INT-05)`,
        severity: 'error'
      });
    }
  });

  // 4. KIỂM TRA CONDITION (Exclusive Gateway: In = 1 | Out >= 2)
  const conditionNodes = nodes.filter((n: any) => (n.getData()?.type || '') === 'condition');
  conditionNodes.forEach((condNode: any) => {
    const data = condNode.getData() || {};
    const label = data.label || 'Condition';
    const branches = data.branches || [];
    const inEdges = graph.getIncomingEdges(condNode) || [];
    const outEdges = graph.getOutgoingEdges(condNode) || [];

    // Condition: In = 1
    if (inEdges.length === 0) {
      errors.push({
        nodeId: condNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'condition',
        code: 'CONDITION_IN_ZERO',
        message: `Condition [${label}] chưa nhận luồng từ bước trước (In = 1)`,
        severity: 'error'
      });
    }

    // Condition: Cần tối thiểu 2 nhánh rẽ
    if (branches.length < 2) {
      errors.push({
        nodeId: condNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'condition',
        code: 'CONDITION_BRANCH_LESS_THAN_2',
        message: `Condition [${label}] cần cấu hình tối thiểu 2 nhánh rẽ (Out >= 2, hiện có ${branches.length})`,
        severity: 'error'
      });
    }

    // Từng cổng nhánh rẽ phải được nối dây ra ngoài
    branches.forEach((br: any, idx: number) => {
      const portId = br.id || (br.isDefault ? 'out-default' : `out-branch-${idx}`);
      const isConnected = outEdges.some((e: any) => {
        const p = e.getSourcePortId?.() || e.getSource()?.port;
        return p === portId || p === `out-branch-${idx}` || (br.isDefault && (p === 'out-default' || p === 'br-default'));
      });
      if (!isConnected) {
        if (br.isDefault) {
          warnings.push({
            nodeId: condNode.id,
            nodeKey: data.nodeKey,
            nodeLabel: label,
            type: 'condition',
            code: 'CONDITION_DEFAULT_UNCONNECTED',
            message: `Nhánh mặc định [${br.name || 'Định tuyến'}] của Condition [${label}] chưa được nối dây (tuỳ chọn dự phòng)`,
            severity: 'warning'
          });
        } else {
          errors.push({
            nodeId: condNode.id,
            nodeKey: data.nodeKey,
            nodeLabel: label,
            type: 'condition',
            code: 'CONDITION_BRANCH_UNCONNECTED',
            message: `Nhánh [${br.name || `Nhánh ${idx + 1}`}] của Condition [${label}] chưa được nối dây (Out >= 2)`,
            severity: 'error'
          });
        }
      }
    });
  });

  // 5. KIỂM TRA USER TASK (In = 1 | Out = 1 hoặc Out = 2 nếu là Approval Step)
  const taskNodes = nodes.filter((n: any) => (n.getData()?.type || '') === 'task');
  taskNodes.forEach((taskNode: any) => {
    const data = taskNode.getData() || {};
    const label = data.label || 'User Task';
    const isApproval = !!data.isApprovalStep;
    const inEdges = graph.getIncomingEdges(taskNode) || [];
    const outEdges = graph.getOutgoingEdges(taskNode) || [];

    // User Task: In = 1
    if (inEdges.length === 0) {
      errors.push({
        nodeId: taskNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'task',
        code: 'TASK_IN_ZERO',
        message: `User Task [${label}] chưa nhận luồng từ bước trước (In = 1)`,
        severity: 'error'
      });
    }

    // User Task: Out = 1 (hoặc Out = 2 nếu Approval Step)
    if (isApproval) {
      const hasApprove = outEdges.some((e: any) => (e.getSourcePortId?.() || e.getSource()?.port) === 'out-approve');
      const hasReject = outEdges.some((e: any) => (e.getSourcePortId?.() || e.getSource()?.port) === 'out-reject');
      if (!hasApprove || !hasReject) {
        errors.push({
          nodeId: taskNode.id,
          nodeKey: data.nodeKey,
          nodeLabel: label,
          type: 'task',
          code: 'TASK_APPROVAL_OUT_MISSING',
          message: `Bước duyệt [${label}] là Approval Step (Out = 2): Bắt buộc nối cả 2 cổng Duyệt và Từ chối`,
          severity: 'error'
        });
      }
    } else {
      if (outEdges.length === 0) {
        errors.push({
          nodeId: taskNode.id,
          nodeKey: data.nodeKey,
          nodeLabel: label,
          type: 'task',
          code: 'TASK_OUT_ZERO',
          message: `User Task [${label}] chưa kết nối luồng ra bước tiếp theo (Out = 1)`,
          severity: 'error'
        });
      } else if (outEdges.length > 1) {
        errors.push({
          nodeId: taskNode.id,
          nodeKey: data.nodeKey,
          nodeLabel: label,
          type: 'task',
          code: 'TASK_OUT_EXCESS',
          message: `User Task [${label}] chỉ được có đúng 1 luồng ra (Out = 1, nếu muốn 2 nhánh duyệt/từ chối hãy bật Approval Step)`,
          severity: 'error'
        });
      }
    }
  });

  // 6. KIỂM TRA SPLIT (Parallel Gateway: In = 1 | Out >= 2)
  const splitNodes = nodes.filter((n: any) => (n.getData()?.type || '') === 'split');
  splitNodes.forEach((sNode: any) => {
    const data = sNode.getData() || {};
    const label = data.label || 'Split Gateway';
    const inEdges = graph.getIncomingEdges(sNode) || [];
    const outEdges = graph.getOutgoingEdges(sNode) || [];

    // Split: In = 1
    if (inEdges.length === 0) {
      errors.push({
        nodeId: sNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'split',
        code: 'SPLIT_IN_ZERO',
        message: `Split Parallel Gateway [${label}] chưa có luồng vào (In = 1)`,
        severity: 'error'
      });
    }

    // Split: Out >= 2
    if (outEdges.length < 2) {
      errors.push({
        nodeId: sNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'split',
        code: 'SPLIT_OUT_LESS_THAN_2',
        message: `Split Parallel Gateway [${label}] phải phân tách tối thiểu 2 luồng song song (Out >= 2, hiện có ${outEdges.length})`,
        severity: 'error'
      });
    }
  });

  // 7. KIỂM TRA MERGE (Parallel Gateway: In >= 2 | Out = 1)
  const mergeNodes = nodes.filter((n: any) => (n.getData()?.type || '') === 'merge');
  mergeNodes.forEach((mNode: any) => {
    const data = mNode.getData() || {};
    const label = data.label || 'Merge Gateway';
    const inEdges = graph.getIncomingEdges(mNode) || [];
    const outEdges = graph.getOutgoingEdges(mNode) || [];

    // Merge: In >= 2
    if (inEdges.length < 2) {
      errors.push({
        nodeId: mNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'merge',
        code: 'MERGE_IN_LESS_THAN_2',
        message: `Merge Parallel Gateway [${label}] phải gom tối thiểu 2 luồng song song trước khi đi tiếp (In >= 2, hiện có ${inEdges.length})`,
        severity: 'error'
      });
    }

    // Merge: Out = 1
    if (outEdges.length === 0) {
      errors.push({
        nodeId: mNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'merge',
        code: 'MERGE_OUT_ZERO',
        message: `Merge Parallel Gateway [${label}] chưa có luồng ra sau khi đồng bộ (Out = 1)`,
        severity: 'error'
      });
    } else if (outEdges.length > 1) {
      errors.push({
        nodeId: mNode.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: 'merge',
        code: 'MERGE_OUT_EXCESS',
        message: `Merge Parallel Gateway [${label}] chỉ được có đúng 1 luồng ra (Out = 1, hiện có ${outEdges.length})`,
        severity: 'error'
      });
    }
  });

  // 8. KIỂM TRA NODE CÔ LẬP (ISOLATED NODES)
  nodes.forEach((node: any) => {
    const inEdges = graph.getIncomingEdges(node) || [];
    const outEdges = graph.getOutgoingEdges(node) || [];
    const data = node.getData() || {};
    const label = data.label || data.typeTitle || 'Node';

    if (inEdges.length === 0 && outEdges.length === 0) {
      errors.push({
        nodeId: node.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type: data.type || 'task',
        code: 'NODE_ISOLATED',
        message: `Bước [${label}] đang đứng cô lập (chưa có dây nối nào)`,
        severity: 'error'
      });
    }
  });

  const isValid = errors.length === 0;
  const summary = isValid
    ? '✅ Sơ đồ quy trình hoàn toàn hợp lệ theo chuẩn BPMN 2.0!'
    : `❌ Phát hiện ${errors.length} lỗi vi phạm quy tắc cấu hình BPMN.`;

  return {
    isValid,
    errors,
    warnings,
    summary
  };
}
