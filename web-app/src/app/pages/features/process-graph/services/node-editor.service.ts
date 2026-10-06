import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EDGE_COLOR } from '../config/edge-style.config';
import { ConditionBranch } from '../models/node-property.model';
import { isGatewayType, normalizeNodeType } from '../models/node-type';
import { getNodePortItems, TranslateFn } from '../config/ports.config';
import { GraphEditorStore } from '../state/graph-editor.store';
import { NodeFactoryService } from './node-factory.service';
import { GraphHistoryService } from './graph-history.service';
import { GraphBridgeService } from './graph-bridge.service';

/** Chọn / bỏ chọn node, sửa thuộc tính từ drawer, nhánh điều kiện & cổng, xoá node, làm sạch canvas. */
@Injectable()
export class NodeEditorService {
  constructor(
    private translate: TranslateService,
    private store: GraphEditorStore,
    private factory: NodeFactoryService,
    private history: GraphHistoryService,
    public bridgeService: GraphBridgeService
  ) {}

  /** Dịch key trong PROCESS_GRAPH.* (xem i18n/vi.json, en.json) */
  private t(key: string, params?: Record<string, any>): string {
    return this.translate.instant('PROCESS_GRAPH.' + key, params);
  }

  /** Hàm dịch truyền vào các hàm thuần trong ports.config */
  private readonly tFn: TranslateFn = (key, params) => this.translate.instant(key, params);


  public resetPreviousEdgeHighlight(): void {
    if (this.store.selectedCell && this.store.selectedCell.isEdge?.()) {
      this.store.selectedCell.attr('line/stroke', EDGE_COLOR);
      this.store.selectedCell.attr('line/strokeWidth', 1.5);
      this.store.selectedCell.attr('line/targetMarker/fill', EDGE_COLOR);
      this.store.selectedCell.attr('line/targetMarker/stroke', EDGE_COLOR);
    }
    this.store.selectedCell = null;
  }


  public addBranch(): void {
    if (!this.store.selectedNodeProps.branches) {
      this.store.selectedNodeProps.branches = [];
    }

    const customBranches = this.store.selectedNodeProps.branches.filter(
      (b) => !b.isDefault,
    );
    const customCount = customBranches.length + 1;
    const branchName = this.t('CANVAS.BRANCH_N', { index: customCount });
    const newBranch: ConditionBranch = {
      id: `br-${customCount}_${Date.now() % 1000}`,
      name: branchName,
      defaultLabel: branchName,
      value: '',
      expression: '',
      variableSource:
        this.store.selectedNodeProps.conditionVariable || 'flow.variables',
      isDefault: false,
    };

    // Ensure default branch is always present and stays at the END (dưới cùng)
    const defIdx = this.store.selectedNodeProps.branches.findIndex(
      (b) => b.isDefault,
    );
    if (defIdx === -1) {
      this.store.selectedNodeProps.branches.push(newBranch);
      this.store.selectedNodeProps.branches.push({
        id: 'br-default',
        name: this.t('CANVAS.DEFAULT_BRANCH'),
        value: 'default',
        expression: 'default',
        variableSource:
          this.store.selectedNodeProps.conditionVariable || 'flow.variables',
        isDefault: true,
      });
    } else {
      // Chèn nhánh mới vào trước nhánh Mặc định để Mặc định luôn ở dưới cùng
      this.store.selectedNodeProps.branches.splice(defIdx, 0, newBranch);
    }
    this.updateConditionNodePorts();
  }


  public removeBranch(index: number): void {
    if (!this.store.selectedNodeProps.branches) return;
    const br = this.store.selectedNodeProps.branches[index];
    if (br?.isDefault) {
      alert(this.t('MESSAGES.DEFAULT_BRANCH_LOCKED'));
      return;
    }
    this.store.selectedNodeProps.branches.splice(index, 1);
    this.updateConditionNodePorts();
  }


  public onBranchChange(index?: number): void {
    if (!this.store.selectedNode || !isGatewayType(this.store.selectedNodeProps.type))
      return;
    this.syncConditionEdgeLabels();
    const data = this.store.selectedNode.getData() || {};
    this.store.selectedNode.setData({
      ...data,
      branches: this.store.selectedNodeProps.branches,
    });
    const branches = this.store.selectedNodeProps.branches || [];
    branches.forEach((br, idx) => {
      const displayText =
        br.isDefault
            ? this.t('CANVAS.DEFAULT_BRANCH')
            : br.name || br.defaultLabel || this.t('CANVAS.BRANCH_N', { index: idx + 1 });
      this.store.selectedNode.attr(
        `rowText_${idx}/text`,
        this.factory.truncateLabel(displayText, 18),
      );
      const portId =
        br.id || (br.isDefault ? 'out-default' : `out-branch-${idx}`);
      if (this.store.selectedNode.portProp) {
        this.store.selectedNode.portProp(portId, 'attrs/portTitle/text', displayText);
      }
    });
  }


  public syncConditionEdgeLabels(): void {
    if (!this.store.selectedNode || !this.store.graph) return;
    const outgoingEdges = this.store.graph.getOutgoingEdges(this.store.selectedNode) || [];
    outgoingEdges.forEach((edge: any) => {
      edge.setLabels([]);
    });
  }


  public updateConditionNodePorts(): void {
    if (!this.store.selectedNode || !isGatewayType(this.store.selectedNodeProps.type))
      return;
    let branches = this.store.selectedNodeProps.branches
      ? [...this.store.selectedNodeProps.branches]
      : [];

    // Ensure default branch is always present and stays at the END (dưới cùng)
    const defaultIdx = branches.findIndex((b) => b.isDefault);
    if (defaultIdx === -1) {
      branches.push({
        id: 'br-default',
        name: this.t('CANVAS.DEFAULT_BRANCH'),
        value: 'default',
        expression: 'default',
        variableSource:
          this.store.selectedNodeProps.conditionVariable || 'flow.variables',
        isDefault: true,
      });
    } else if (defaultIdx !== branches.length - 1) {
      const [defBr] = branches.splice(defaultIdx, 1);
      branches.push(defBr);
    }
    this.store.selectedNodeProps.branches = branches;

    const count = branches.length;
    // 64 cho Header + Tiêu đề phụ 'Định tuyến', 22px cho mỗi nhánh (Nhánh 1..N, Mặc định), 8px padding
    const targetHeight = 64 + count * 22 + 8;
    this.store.selectedNode.resize(168, targetHeight);

    const hasLabel = !!(
      this.store.selectedNodeProps.label && this.store.selectedNodeProps.label.trim()
    );
    this.store.selectedNode.attr('typeTitle/refY', hasLabel ? 16 : 22);
    this.store.selectedNode.attr('nameText/refY', 32);
    this.store.selectedNode.attr('iconBox/refY', 7);
    this.store.selectedNode.attr('iconImg/refY', 14);
    this.store.selectedNode.attr('divider/display', 'block');
    this.store.selectedNode.attr('sectionHeader/display', 'block');
    this.store.selectedNode.attr('sectionHeader/text', this.t('CANVAS.ROUTING'));
    this.store.selectedNode.attr('sectionHeader/refY', 58);
    this.store.selectedNode.attr('sectionHeader/refX', 14);

    // Update row texts starting at y = 78 (Nhánh 1, Nhánh 2... và Mặc định ở dưới cùng)
    for (let i = 0; i < 16; i++) {
      if (i < count) {
        const br = branches[i];
        const displayText =
          br.isDefault
            ? this.t('CANVAS.DEFAULT_BRANCH')
            : br.name || br.defaultLabel || this.t('CANVAS.BRANCH_N', { index: i + 1 });
        this.store.selectedNode.attr(`rowText_${i}/display`, 'block');
        this.store.selectedNode.attr(
          `rowText_${i}/text`,
          this.factory.truncateLabel(displayText, 18),
        );
        this.store.selectedNode.attr(`rowText_${i}/refY`, 78 + i * 22);
        this.store.selectedNode.attr(`rowText_${i}/refX`, 14);
        this.store.selectedNode.attr(`rowText_${i}/fill`, '#475569');
      } else {
        this.store.selectedNode.attr(`rowText_${i}/display`, 'none');
      }
    }

    const expectedPortItems = getNodePortItems(
      this.store.selectedNodeProps.type,
      { branches },
      168,
      this.tFn,
    );

    if (
      typeof this.store.selectedNode.getPorts === 'function' &&
      typeof this.store.selectedNode.addPort === 'function'
    ) {
      const currentPorts: any[] = this.store.selectedNode.getPorts() || [];
      const currentPortIds = new Set(currentPorts.map((p: any) => p.id));
      const expectedPortIds = new Set(expectedPortItems.map((p: any) => p.id));

      // 1. Remove ports not in expectedPortItems
      for (const p of currentPorts) {
        if (!expectedPortIds.has(p.id)) {
          this.store.selectedNode.removePort(p.id);
        }
      }

      // 2. Add new ports or update existing ones
      for (const item of expectedPortItems) {
        if (currentPortIds.has(item.id)) {
          if (item.args && this.store.selectedNode.portProp) {
            this.store.selectedNode.portProp(item.id, 'args', item.args);
          }
          if (item.attrs?.portTitle?.text && this.store.selectedNode.portProp) {
            this.store.selectedNode.portProp(
              item.id,
              'attrs/portTitle/text',
              item.attrs.portTitle.text,
            );
          }
        } else {
          this.store.selectedNode.addPort(item);
        }
      }
    } else {
      this.store.selectedNode.prop('ports/items', expectedPortItems, {
        rewrite: true,
      });
    }

    this.syncConditionEdgeLabels();

    const data = this.store.selectedNode.getData() || {};
    this.store.selectedNode.setData({ ...data, ...this.store.selectedNodeProps, branches });
    this.history.pushHistorySnapshot();
  }


  public onUserTaskApprovalToggle(): void {
    if (!this.store.selectedNode || this.store.selectedNodeProps.type !== 'USER_TASK')
      return;
    const isApproval = !!this.store.selectedNodeProps.isApprovalStep;
    const targetHeight = isApproval ? 96 : 48;
    this.store.selectedNode.resize(168, targetHeight);

    const hasLabel = !!(
      this.store.selectedNodeProps.label && this.store.selectedNodeProps.label.trim()
    );
    const centerY = isApproval ? 22 : Math.round(targetHeight / 2);
    const iconBoxY = isApproval ? 7 : Math.round((targetHeight - 32) / 2);

    this.store.selectedNode.attr('typeTitle/refY', hasLabel ? 16 : centerY);
    this.store.selectedNode.attr('nameText/refY', 32);
    this.store.selectedNode.attr('iconBox/refY', iconBoxY);
    this.store.selectedNode.attr('iconImg/refY', iconBoxY + 7);

    // Toggle multi-row visuals like Node Action: 'Đồng ý' & 'Từ chối'
    this.store.selectedNode.attr('divider/display', isApproval ? 'block' : 'none');
    this.store.selectedNode.attr('rowText_0/ref', 'body');
    this.store.selectedNode.attr('rowText_0/refX', 14);
    this.store.selectedNode.attr('rowText_0/refY', 60);
    this.store.selectedNode.attr('rowText_0/text', this.t('CANVAS.APPROVE'));
    this.store.selectedNode.attr('rowText_0/fontSize', 11);
    this.store.selectedNode.attr('rowText_0/fontWeight', 500);
    this.store.selectedNode.attr('rowText_0/fill', '#475569');
    this.store.selectedNode.attr('rowText_0/textAnchor', 'start');
    this.store.selectedNode.attr('rowText_0/textVerticalAnchor', 'middle');
    this.store.selectedNode.attr('rowText_0/display', isApproval ? 'block' : 'none');

    this.store.selectedNode.attr('rowText_1/ref', 'body');
    this.store.selectedNode.attr('rowText_1/refX', 14);
    this.store.selectedNode.attr('rowText_1/refY', 82);
    this.store.selectedNode.attr('rowText_1/text', this.t('CANVAS.REJECT'));
    this.store.selectedNode.attr('rowText_1/fontSize', 11);
    this.store.selectedNode.attr('rowText_1/fontWeight', 500);
    this.store.selectedNode.attr('rowText_1/fill', '#475569');
    this.store.selectedNode.attr('rowText_1/textAnchor', 'start');
    this.store.selectedNode.attr('rowText_1/textVerticalAnchor', 'middle');
    this.store.selectedNode.attr('rowText_1/display', isApproval ? 'block' : 'none');

    const expectedPortItems = getNodePortItems(
      'USER_TASK',
      { isApprovalStep: isApproval },
      168,
      this.tFn,
    );

    if (
      typeof this.store.selectedNode.getPorts === 'function' &&
      typeof this.store.selectedNode.addPort === 'function'
    ) {
      const currentPorts: any[] = this.store.selectedNode.getPorts() || [];
      const currentPortIds = new Set(currentPorts.map((p: any) => p.id));
      const expectedPortIds = new Set(expectedPortItems.map((p: any) => p.id));

      // 1. Re-route edges if needed
      if (this.store.graph) {
        const outgoing = this.store.graph.getOutgoingEdges(this.store.selectedNode) || [];
        for (const edge of outgoing) {
          const port = edge.getSourcePortId?.() || edge.getSource()?.port;
          if (isApproval && port === 'out') {
            edge.setSource({ cell: this.store.selectedNode, port: 'out-approve' });
          } else if (
            !isApproval &&
            (port === 'out-approve' || port === 'out-reject')
          ) {
            edge.setSource({ cell: this.store.selectedNode, port: 'out' });
          }
        }
      }

      // 2. Remove ports not in expectedPortItems
      for (const p of currentPorts) {
        if (!expectedPortIds.has(p.id)) {
          this.store.selectedNode.removePort(p.id);
        }
      }

      // 3. Add new ports or update existing ones
      for (const item of expectedPortItems) {
        if (currentPortIds.has(item.id)) {
          if (item.args && this.store.selectedNode.portProp) {
            this.store.selectedNode.portProp(item.id, 'args', item.args);
          }
        } else {
          this.store.selectedNode.addPort(item);
        }
      }
    } else {
      this.store.selectedNode.prop('ports/items', expectedPortItems, {
        rewrite: true,
      });
    }

    const data = this.store.selectedNode.getData() || {};
    this.store.selectedNode.setData({
      ...data,
      ...this.store.selectedNodeProps,
      isApprovalStep: isApproval,
    });
    this.history.pushHistorySnapshot();
  }


  // 4. DRAWER PROPS TWO-WAY SYNC
  public selectNode(node: any): void {
    this.store.selectedNode = node;
    const data = node.getData() || {};
    const nodeType = normalizeNodeType(data.type, data.gatewayType);
    const itemDef = this.factory.getPaletteDef(nodeType);
    const textAttr =
      node.attr('nameText/text') ||
      node.attr('titleText/text') ||
      node.attr('label/text') ||
      '';

    this.store.selectedNodeProps = {
      ...data,
      id: node.id,
      nodeKey:
        data.nodeKey || this.factory.generateNodeKey(nodeType, data.label || textAttr),
      type: nodeType,
      typeTitle: data.typeTitle || itemDef.typeTitle,
      label: data.label !== undefined ? data.label : textAttr || '',
      icon: data.icon || itemDef.icon,
      description: data.description || '',
      isApprovalStep: !!data.isApprovalStep,

      // Action fields
      actionSource: data.actionSource || 'library',
      actionLibraryId:
        data.actionLibraryId ||
        (nodeType === 'SYSTEM_TASK' ? 'act-ipcc-api' : undefined),
      actionMethod: data.actionMethod || 'POST',
      actionEndpoint:
        data.actionEndpoint ||
        (nodeType === 'SYSTEM_TASK'
          ? 'https://ipcc.vnpt.vn/api/v2/call/dispatch'
          : ''),
      requestBodyMapping:
        data.requestBodyMapping ||
        (nodeType === 'SYSTEM_TASK'
          ? '{\n  "callId": "${flow.variables.call_id}",\n  "queue": "HOTLINE_1800"\n}'
          : ''),
      responseMapping:
        data.responseMapping ||
        (nodeType === 'SYSTEM_TASK'
          ? 'flow.variables.ticket_id = response.data.ticketId;'
          : ''),
      slaSeconds: data.slaSeconds !== undefined ? data.slaSeconds : 3,
      retryCount: data.retryCount !== undefined ? data.retryCount : 3,
      retryInterval: data.retryInterval || '5s',
      circuitBreakerTimeoutMs:
        data.circuitBreakerTimeoutMs !== undefined
          ? data.circuitBreakerTimeoutMs
          : 3000,
      integratedSystem: data.integratedSystem || '',
      selectedApi: data.selectedApi || '',
      timeoutSeconds:
        data.timeoutSeconds !== undefined ? data.timeoutSeconds : 0,
      apiOutput: data.apiOutput || '',

      // Condition fields
      branches:
        data.branches && data.branches.length > 0
          ? JSON.parse(JSON.stringify(data.branches))
          : isGatewayType(nodeType)
            ? [
                {
                  id: 'br-1',
                  name: this.t('CANVAS.DEFAULT_CASE_NAME'),
                  value: 'valid',
                  expression: '.priority == "Cao"',
                  rules: [{ param: '.priority', operator: 'EQ', value: 'Cao' }],
                },
                {
                  id: 'br-default',
                  name: this.t('CANVAS.DEFAULT_BRANCH'),
                  value: 'default',
                  expression: 'default',
                  isDefault: true,
                  rules: [],
                },
              ]
            : undefined,
      defaultFlowOutput: data.defaultFlowOutput || '',
      errorFlowOutput: data.errorFlowOutput || '',
      servicePivotSource: data.servicePivotSource || 'flow.variables',
      conditionVariable: data.conditionVariable || 'flow.variables.cuoc',
      conditionRule: data.conditionRule || 'cuoc_phat_sinh > 500000',

      // General task/trigger fields
      timeout: data.timeout || '30 phút',
      sla: data.sla || '2h SLA',
      assignee: data.assignee || 'Điện thoại viên (FO/BO)',
      triggerEvent: data.triggerEvent || 'Inbound Call (Tổng đài 1800xxxx)',

      // Notification fields
      notificationChannel: data.notificationChannel || 'SMS',
      notificationRecipient: data.notificationRecipient || 'CUSTOMER',
      notificationTitle: data.notificationTitle || '',
      notificationContent: data.notificationContent || '',

      // Sub-process fields
      subProcessTemplateId: data.subProcessTemplateId || '',
      subProcessVersion: data.subProcessVersion || 'LATEST',
      subProcessWaitComplete:
        data.subProcessWaitComplete !== undefined
          ? data.subProcessWaitComplete
          : true,
      subProcessInputMapping: data.subProcessInputMapping || '',
      actionInputMappings: (data.actionInputMappings || []).map((r: any) => ({
        ...r,
      })),
      subProcessInputMappings: (data.subProcessInputMappings || []).map(
        (r: any) => ({ ...r }),
      ),
      subProcessOutputMappings: (data.subProcessOutputMappings || []).map(
        (r: any) => ({ ...r }),
      ),
    };

    this.store.selectedCellInfo = `[${this.store.selectedNodeProps.label}] ${this.store.selectedNodeProps.typeTitle}`;
    this.bridgeService.selectNode(node, this.store.selectedNodeProps);

    // Highlight selected node with rose/red outline (as in Figma screenshot)
    if (this.store.graph) {
      this.store.graph.getNodes().forEach((n: any) => {
        if (n.id === node.id) {
          n.attr('body/stroke', '#f43f5e');
          n.attr('body/strokeWidth', 2);
        } else {
          n.attr('body/stroke', '#e4e4e7');
          n.attr('body/strokeWidth', 1);
        }
      });
    }
  }


  public clearSelection(): void {
    if (this.store.graph) {
      this.store.graph.getNodes().forEach((n: any) => {
        n.attr('body/stroke', '#e4e4e7');
        n.attr('body/strokeWidth', 1);
      });
    }
    this.store.selectedNode = null;
    this.store.isDrawerOpen = false;
    this.bridgeService.clearSelection();
    this.store.selectedCellInfo = this.t('STATUS.READY');
  }


  public closeDrawer(): void {
    this.store.isDrawerOpen = false;
    this.bridgeService.closeDrawer();
  }


  public onNodeLabelChange(): void {
    if (!this.store.selectedNode) return;
    const label = this.store.selectedNodeProps.label || '';
    const hasLabel = !!label.trim();
    const type = this.store.selectedNodeProps.type;

    if (type === 'START' || type === 'END') {
      this.store.selectedNode.attr(
        'nameText/text',
        label ? this.factory.truncateLabel(label, 20) : '',
      );
    } else {
      const truncated = this.factory.truncateLabel(label, 16);
      const isMultiRow =
        type === 'SYSTEM_TASK' ||
        isGatewayType(type) ||
        (type === 'USER_TASK' && !!this.store.selectedNodeProps.isApprovalStep);
      const size = this.store.selectedNode.size();
      const nodeHeight = size?.height || 48;
      const centerY = isMultiRow ? 22 : Math.round(nodeHeight / 2);

      this.store.selectedNode.attr('nameText/text', truncated);
      this.store.selectedNode.attr('typeTitle/refY', hasLabel ? 15 : centerY);
      this.store.selectedNode.attr('typeTitle/fontSize', hasLabel ? 11 : 12);
    }

    const data = this.store.selectedNode.getData() || {};
    this.store.selectedNode.setData({ ...data, label: this.store.selectedNodeProps.label });
    this.store.selectedCellInfo = hasLabel
      ? `[${this.store.selectedNodeProps.label}] ${this.store.selectedNodeProps.typeTitle}`
      : `[${this.store.selectedNodeProps.typeTitle}]`;
  }


  public onNodePropChange(): void {
    if (!this.store.selectedNode) return;
    const data = this.store.selectedNode.getData() || {};
    this.store.selectedNode.setData({ ...data, ...this.store.selectedNodeProps });
  }


  public deleteSelectedNode(): void {
    if (!this.store.selectedNode) return;
    const name = this.store.selectedNodeProps.label;
    const data = this.store.selectedNode.getData() || {};
    if (
      data.type === 'JOIN' &&
      data.gatewayNodeId &&
      this.store.graph.getCellById(data.gatewayNodeId)
    ) {
      alert(this.t('MESSAGES.JOIN_DELETE_BLOCKED'));
      return;
    }
    if (isGatewayType(data.type) && data.joinNodeId) {
      this.store.graph.getCellById(data.joinNodeId)?.remove();
    }
    this.store.selectedNode.remove();
    this.store.selectedNode = null;
    this.store.isDrawerOpen = false;
    this.store.selectedCellInfo = this.t('STATUS.NODE_DELETED', { name });
    this.store.updateCounts();
  }


  public deleteOrClear(): void {
    if (this.store.selectedNode) {
      this.deleteSelectedNode();
    } else if (this.store.selectedCell && this.store.selectedCell.isEdge?.()) {
      this.store.selectedCell.remove();
      this.store.selectedCell = null;
      this.store.selectedCellInfo = this.t('STATUS.EDGE_DELETED');
      this.store.updateCounts();
    } else {
      this.clearCanvas();
    }
  }


  public clearCanvas(): void {
    if (confirm(this.t('MESSAGES.CLEAR_CONFIRM'))) {
      this.store.graph.clearCells();
      this.store.selectedNode = null;
      this.store.selectedCell = null;
      this.store.isDrawerOpen = false;
      this.store.updateCounts();
      this.history.pushHistorySnapshot();
      this.store.selectedCellInfo = this.t('STATUS.CANVAS_CLEARED');
    }
  }
}
