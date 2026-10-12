import type { NodePropertyModel, ConditionBranch } from '../models/node-property.model';
import { NodeType, isGatewayType, normalizeNodeType } from '../models/node-type';
import {
  ConditionOperator,
  EndConfig,
  FlowDefinition,
  FlowDetailResponse,
  FlowEdge,
  FlowNode,
  FlowNodeConfig,
  GatewayConfig,
  JoinConfig,
  NotificationConfig,
  SaveFlowDraftPayload,
  StartConfig,
  SubProcessConfig,
  SystemTaskConfig,
  UserTaskConfig
} from '../models/flow-definition.model';

/**
 * Chuyển đổi qua lại giữa dữ liệu canvas X6 (node.data = NodePropertyModel, port id)
 * và FlowDefinition gửi / nhận với BE (FLOW_SCHEMA.md).
 */

export const DEFAULT_BRANCH_ID = 'br-default';
const SLA_UNITS = ['Giờ', 'Ngày', 'Tuần'];

// Nhãn kiểu so sánh cũ (trước đây lưu thẳng nhãn) → mã operator
const LEGACY_OPERATOR_MAP: Record<string, ConditionOperator> = {
  'Bằng (=)': 'EQ',
  'Khác (!=)': 'NEQ',
  'Lớn hơn (>)': 'GT',
  'Nhỏ hơn (<)': 'LT',
  'Chứa (contains)': 'CONTAINS'
};

export function normalizeOperator(op: string | undefined): ConditionOperator {
  if (!op) return 'EQ';
  if (LEGACY_OPERATOR_MAP[op]) return LEGACY_OPERATOR_MAP[op];
  return (['EQ', 'NEQ', 'GT', 'LT', 'CONTAINS'].includes(op) ? op : 'EQ') as ConditionOperator;
}

// ===== Port (X6) ⇄ sourceHandle (FlowEdge) =====

export function portIdToHandle(type: NodeType, portId: string | undefined, data: Partial<NodePropertyModel>): string {
  const port = portId || 'out';
  if (isGatewayType(type)) {
    const branch = (data.branches || []).find(b => b.id === port);
    return branch?.isDefault || port === DEFAULT_BRANCH_ID ? 'default' : port;
  }
  switch (type) {
    case 'SYSTEM_TASK':
      return port === 'out-failure' ? 'error' : 'success';
    case 'USER_TASK':
      if (port === 'out-approve') return 'approved';
      if (port === 'out-reject') return 'rejected';
      return 'next';
    default:
      return 'next';
  }
}

export function handleToPortId(type: NodeType, handle: string, data: Partial<NodePropertyModel>): string {
  if (isGatewayType(type)) {
    if (handle === 'default') {
      return (data.branches || []).find(b => b.isDefault)?.id || DEFAULT_BRANCH_ID;
    }
    return handle;
  }
  switch (type) {
    case 'SYSTEM_TASK':
      if (handle === 'error') return 'out-failure';
      return data.hasExceptionPort ? 'out-success' : 'out';
    case 'USER_TASK':
      if (handle === 'approved') return 'out-approve';
      if (handle === 'rejected') return 'out-reject';
      return 'out';
    default:
      return 'out';
  }
}

// ===== Canvas → FlowDefinition (Lưu nháp) =====

function buildConfig(type: NodeType, d: Partial<NodePropertyModel>): FlowNodeConfig {
  switch (type) {
    case 'START':
      return {
        triggerType: d.triggerType || null,
        triggerRefId: d.triggerFormSchedule || null,
        variables: (d.startVariables || [])
          .filter(v => v.variable?.trim())
          .map(v => ({ name: v.variable.trim(), formField: v.formField || null, apiField: v.apiField || null, value: v.fixedValue ?? null, displayName: v.displayName || '' }))
      } as StartConfig;

    case 'GATEWAY_EXCLUSIVE':
    case 'GATEWAY_PARALLEL':
    case 'GATEWAY_INCLUSIVE':
      return {
        cases: (d.branches || [])
          .filter(b => !b.isDefault)
          .map(b => ({
            id: b.id,
            name: b.name || '',
            logicOperator: b.logicOperator || 'AND',
            conditions: (b.rules || []).map(r => ({ field: r.param, operator: normalizeOperator(r.operator), value: r.value ?? '' }))
          })),
        joinNodeId: d.joinNodeId || null
      } as GatewayConfig;

    case 'JOIN':
      return { gatewayNodeId: d.gatewayNodeId || null } as JoinConfig;

    case 'USER_TASK':
      return {
        assignType: d.assignType || 'MANUAL',
        assignStrategy: d.assignType === 'AUTO' ? d.assignStrategy || 'ROUND_ROBIN' : null,
        departmentId: d.department || null,
        groupId: d.team || null,
        agentId: d.agent || null,
        slaValue: d.slaSeconds ?? null,
        slaUnit: d.sla && SLA_UNITS.includes(d.sla) ? d.sla : null,
        slaWarning: !!d.slaWarning,
        formId: d.formTemplate || null,
        inputs: (d.formInputs || [])
          .filter(r => r.variable)
          .map(r => ({ variable: r.variable as string, formField: r.mapped ? r.formField || null : null })),
        outputs: (d.formOutputs || [])
          .filter(r => r.variable?.trim() && r.formField)
          .map(r => ({ formField: r.formField as string, variable: r.variable.trim(), displayName: r.displayName || '' }))
      } as UserTaskConfig;

    case 'SYSTEM_TASK':
      return {
        systemId: d.integratedSystem || null,
        apiId: d.selectedApi || null,
        timeout: d.timeoutSeconds ?? null,
        retry: d.retryCount ?? null,
        inputs: (d.apiInputs || [])
          .filter(r => r.apiParam)
          .map(r => ({ apiParam: r.apiParam as string, variable: r.variable || null })),
        outputs: (d.apiOutputs || [])
          .filter(r => r.apiField && r.variable?.trim())
          .map(r => ({ apiField: r.apiField as string, variable: r.variable.trim(), displayName: r.displayName || '' }))
      } as SystemTaskConfig;

    case 'NOTIFICATION': {
      const channels: NotificationConfig['channels'] = [];
      if (d.channelNotification) channels.push('NOTIFICATION');
      if (d.channelEmail) channels.push('EMAIL');
      return { recipientId: d.notificationRecipient || null, content: d.notificationContent || '', channels } as NotificationConfig;
    }

    case 'SUB_PROCESS':
      return {
        subProcessId: d.subProcessTemplateId || null,
        inputs: (d.subProcessInputs || [])
          .filter(r => r.subField)
          .map(r => ({ subField: r.subField as string, variable: r.variable || null })),
        outputs: (d.subProcessOutputs || [])
          .filter(r => r.subField && r.variable?.trim())
          .map(r => ({ subField: r.subField as string, variable: r.variable.trim(), displayName: r.displayName || '' }))
      } as SubProcessConfig;

    case 'END':
      return {
        endFormId: d.endFormTemplate || null,
        results: (d.endResults || [])
          .filter(r => r.variable)
          .map(r => ({ variable: r.variable as string, formField: r.formField || null }))
      } as EndConfig;
  }
}

export function graphToFlowDefinition(graph: any): FlowDefinition {
  const nodes: FlowNode[] = (graph.getNodes() || []).map((node: any) => {
    const d: Partial<NodePropertyModel> = node.getData() || {};
    const type = normalizeNodeType(d.type, d.gatewayType);
    const pos = node.getPosition();
    return {
      id: node.id,
      type,
      name: d.label || '',
      key: d.nodeKey || '',
      description: d.description || '',
      position: { x: Math.round(pos.x), y: Math.round(pos.y) },
      config: buildConfig(type, d)
    };
  });

  const edges: FlowEdge[] = (graph.getEdges() || [])
    .filter((edge: any) => edge.getSourceCellId() && edge.getTargetCellId())
    .map((edge: any) => {
      const sourceCell = edge.getSourceCell();
      const d: Partial<NodePropertyModel> = sourceCell?.getData() || {};
      const type = normalizeNodeType(d.type, d.gatewayType);
      return {
        id: edge.id,
        source: edge.getSourceCellId(),
        sourceHandle: portIdToHandle(type, edge.getSourcePortId(), d),
        target: edge.getTargetCellId()
      };
    });

  const scale = graph.scale?.() || { sx: 1 };
  const translate = graph.translate?.() || { tx: 0, ty: 0 };
  return {
    nodes,
    edges,
    viewport: { zoom: Number(scale.sx.toFixed(2)), x: Math.round(translate.tx), y: Math.round(translate.ty) }
  };
}

export function buildSaveDraftPayload(
  meta: { name: string; description?: string; versionName?: string; rowVersion?: number }
    & Partial<Omit<SaveFlowDraftPayload, 'name' | 'description' | 'versionName' | 'rowVersion' | 'flowJson'>>,
  def: FlowDefinition
): SaveFlowDraftPayload {
  return {
    name: meta.name,
    description: meta.description || '',
    code: meta.code,
    category: meta.category,
    triggerType: meta.triggerType,
    triggerConfig: meta.triggerConfig,
    slaValue: meta.slaValue,
    slaUnit: meta.slaUnit,
    versionName: meta.versionName,
    rowVersion: meta.rowVersion,
    flowJson: JSON.stringify(def)
  };
}

// ===== Response BE → dữ liệu node X6 (vẽ lại) =====

export function parseFlowJson(res: FlowDetailResponse): FlowDefinition {
  const raw: any = typeof res.flowJson === 'string' ? JSON.parse(res.flowJson) : res.flowJson;
  return { nodes: raw?.nodes || [], edges: raw?.edges || [], viewport: raw?.viewport };
}

/**
 * FlowNode → customData truyền vào createCompactCardNode() để dựng lại card.
 * `edges` dùng để suy ra node nào cần cổng phụ (Tác vụ hệ thống có luồng lỗi, Giao việc phê duyệt).
 */
export function flowNodeToNodeData(fn: FlowNode, edges: FlowEdge[]): Partial<NodePropertyModel> {
  const base: Partial<NodePropertyModel> = {
    id: fn.id,
    type: fn.type,
    label: fn.name || '',
    nodeKey: fn.key,
    description: fn.description || ''
  };
  const handles = edges.filter(e => e.source === fn.id).map(e => e.sourceHandle);
  const c: any = fn.config || {};

  switch (fn.type) {
    case 'START':
      return {
        ...base,
        triggerType: c.triggerType || '',
        triggerFormSchedule: c.triggerRefId || '',
        startVariables: (c.variables || []).map((v: any) => ({ variable: v.name || '', formField: v.formField ?? null, apiField: v.apiField ?? null, fixedValue: v.value ?? '', displayName: v.displayName || '' }))
      };

    case 'GATEWAY_EXCLUSIVE':
    case 'GATEWAY_PARALLEL':
    case 'GATEWAY_INCLUSIVE': {
      const branches: ConditionBranch[] = (c.cases || []).map((cs: any) => ({
        id: cs.id,
        name: cs.name,
        expression: '',
        isDefault: false,
        logicOperator: cs.logicOperator || 'AND',
        rules: (cs.conditions || []).map((cd: any) => ({ param: cd.field, operator: normalizeOperator(cd.operator), value: cd.value ?? '' }))
      }));
      branches.push({ id: DEFAULT_BRANCH_ID, name: 'Mặc định', expression: 'default', isDefault: true, rules: [] });
      return { ...base, branches, joinNodeId: c.joinNodeId || undefined };
    }

    case 'JOIN':
      return { ...base, gatewayNodeId: c.gatewayNodeId || undefined };

    case 'USER_TASK':
      return {
        ...base,
        assignType: c.assignType === 'AUTO' ? 'AUTO' : 'MANUAL',
        assignStrategy: c.assignStrategy || 'ROUND_ROBIN',
        formInputs: (c.inputs || []).map((r: any) => ({ variable: r.variable || null, mapped: !!r.formField, formField: r.formField ?? null })),
        formOutputs: (c.outputs || []).map((r: any) => ({ variable: r.variable || '', formField: r.formField ?? null, displayName: r.displayName || '' })),
        department: c.departmentId || '',
        team: c.groupId || '',
        agent: c.agentId || '',
        slaSeconds: c.slaValue ?? undefined,
        sla: c.slaUnit || '',
        slaWarning: !!c.slaWarning,
        formTemplate: c.formId || '',
        isApprovalStep: handles.includes('approved') || handles.includes('rejected')
      };

    case 'SYSTEM_TASK':
      return {
        ...base,
        integratedSystem: c.systemId || '',
        selectedApi: c.apiId || '',
        timeoutSeconds: c.timeout ?? undefined,
        retryCount: c.retry ?? undefined,
        apiInputs: (c.inputs || []).map((r: any) => ({ apiParam: r.apiParam || null, variable: r.variable ?? null })),
        apiOutputs: (c.outputs || []).map((r: any) => ({ apiField: r.apiField || null, variable: r.variable || '', displayName: r.displayName || '' })),
        hasExceptionPort: handles.includes('error')
      };

    case 'NOTIFICATION':
      return {
        ...base,
        notificationRecipient: c.recipientId || '',
        notificationContent: c.content || '',
        channelNotification: (c.channels || []).includes('NOTIFICATION'),
        channelEmail: (c.channels || []).includes('EMAIL')
      };

    case 'SUB_PROCESS':
      return {
        ...base,
        subProcessTemplateId: c.subProcessId || '',
        subProcessInputs: (c.inputs || []).map((r: any) => ({ subField: r.subField || null, variable: r.variable ?? null })),
        subProcessOutputs: (c.outputs || []).map((r: any) => ({ subField: r.subField || null, variable: r.variable || '', displayName: r.displayName || '' }))
      };

    case 'END':
      return {
        ...base,
        endFormTemplate: c.endFormId || '',
        endResults: (c.results || []).map((r: any) => ({ variable: r.variable || null, formField: r.formField ?? null }))
      };

    default:
      return base;
  }
}
