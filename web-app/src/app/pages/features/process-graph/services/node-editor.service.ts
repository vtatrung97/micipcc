import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EDGE_COLOR } from '../config/edge-style.config';
import { ConditionBranch } from '../models/node-property.model';
import { isGatewayType, normalizeNodeType } from '../models/node-type';
import { getNodePortItems, TranslateFn } from '../config/ports.config';
import { NODE_CARD_WIDTH } from '../config/node-view.config';
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

    // Nhánh Mặc định luôn có và nằm cuối (dưới cùng)
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
    this.factory.refreshCardView(this.store.selectedNode);
    branches.forEach((br, idx) => {
      const displayText =
        br.isDefault
            ? this.t('CANVAS.DEFAULT_BRANCH')
            : br.name || br.defaultLabel || this.t('CANVAS.BRANCH_N', { index: idx + 1 });
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

    // Nhánh Mặc định luôn có và nằm cuối (dưới cùng)
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

    // Vẽ lại card theo danh sách nhánh mới (chiều cao + dòng nhánh), rồi đồng bộ cổng ra bên dưới
    this.factory.refreshCardView(this.store.selectedNode, { ...this.store.selectedNodeProps, branches });

    const expectedPortItems = getNodePortItems(
      this.store.selectedNodeProps.type,
      { branches },
      NODE_CARD_WIDTH,
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
    // Vẽ lại card: bật duyệt → thêm 2 dòng Đồng ý / Từ chối (mỗi dòng 1 cổng ra)
    this.factory.refreshCardView(this.store.selectedNode, { ...this.store.selectedNodeProps, isApprovalStep: isApproval });

    const expectedPortItems = getNodePortItems(
      'USER_TASK',
      { isApprovalStep: isApproval },
      NODE_CARD_WIDTH,
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
      node.attr('nameText/textWrap/text') ||
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
    };

    this.store.selectedCellInfo = `[${this.store.selectedNodeProps.label}] ${this.store.selectedNodeProps.typeTitle}`;
    this.bridgeService.selectNode(node, this.store.selectedNodeProps);

    // Viền đỏ cho node đang chọn
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
    // Tên dài tự cắt "…" theo bề rộng card (textWrap trong node-view.config)
    this.factory.refreshCardView(this.store.selectedNode, {
      ...(this.store.selectedNode.getData() || {}),
      ...this.store.selectedNodeProps,
      label,
    });

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


  /** Nút × trên card: xoá đúng node đó (chọn node rồi dùng chung luật xoá của deleteSelectedNode) */
  public deleteNode(node: any): void {
    if (!node || !this.store.graph?.hasCell(node.id)) return;
    const previous = this.store.selectedNode;
    const wasDrawerOpen = this.store.isDrawerOpen;
    if (previous !== node) this.selectNode(node);
    this.deleteSelectedNode();
    // Xoá node khác node đang mở drawer → giữ nguyên drawer của node đang mở
    if (previous && previous !== node && wasDrawerOpen && this.store.graph.hasCell(previous.id)) {
      this.selectNode(previous);
      this.store.isDrawerOpen = true;
      this.bridgeService.selectNode(previous, this.store.selectedNodeProps);
    }
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
    // Đóng drawer cấu hình đang mở cho node vừa xoá (dù xoá bằng nút ×, phím Delete hay nút trong drawer)
    this.bridgeService.clearSelection();
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
