import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Graph, Scroller, MiniMap } from '@antv/x6';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TemplateService, ProcessTemplateItem } from '@core/services/template.service';
import { GraphBridgeService } from './services/graph-bridge.service';
import {
  TemplateInfoModalComponent,
  NotifyConfigModalComponent,
  JsonPreviewModalComponent,
  ValidationModalComponent
} from './modals';

import {
  BPMN_PORT_GROUPS,
  BPMN_NODE_PORT_RULES,
  getNodePortItems,
  validateBpmnConnection,
  validateBpmnGraph,
  GraphValidationError,
  GraphValidationResult
} from './config/ports.config';

declare const X6: any;

export type NodeType = 'trigger' | 'task' | 'action' | 'condition' | 'split' | 'merge' | 'end';

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

export interface ConditionBranch {
  id: string;
  name: string;
  defaultLabel?: string;
  value?: string;
  expression: string;
  variableSource?: string;
  isDefault?: boolean;
}

export interface NodePropertyModel {
  id: string;
  nodeKey?: string;
  type: NodeType;
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
}

export interface PaletteItem {
  type: NodeType;
  typeTitle: string;
  defaultName: string;
  icon: string;
  label: string;
  badge: string;
  bg: string;
  border: string;
  color: string;
  tooltipText: string;
}

/**
 * ============================================================================
 * IPCC 2.0 FLOW SYSTEM - COMPACT CALL FLOW / WORKFLOW STUDIO
 * Giữ nguyên kích thước nhỏ gọn tinh tế (Node 168px x 48px, Palette 44px, Floating Toolbar)
 * với 7 loại Node chuẩn BPMN / IPCC:
 * ⚡ Trigger | 👤 Task | 🚀 Action (2 Ports) | ❓ Condition (Multi-branch) | ⑂ Split | ⑃ Merge | 🛑 End
 * ============================================================================
 */
@Component({
  selector: 'app-graph-editor',
  templateUrl: './graph-editor.component.html',
  styleUrls: ['./graph-editor.component.scss']
})
export class GraphEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('minimapContainer', { static: true }) minimapContainerRef!: ElementRef<HTMLDivElement>;

  private graph!: any;
  private miniMapPlugin: any = null;
  public showMinimap: boolean = true;
  public activeTab: 'flow' | 'info' | 'notify' = 'flow';
  public selectedCellInfo: string = 'Sẵn sàng';
  public nodeCount: number = 0;
  public edgeCount: number = 0;
  public currentZoom: number = 100;
  public hasLocalData: boolean = false;
  public showJsonPreview: boolean = false;
  public lastSavedJson: string | null = null;

  // Slide-over Properties Drawer State (FR-05, US-01)
  public isDrawerOpen: boolean = false;
  public selectedNode: any = null;
  public selectedCell: any = null;
  public selectedNodeProps: NodePropertyModel = {
    id: '',
    nodeKey: '',
    type: 'task',
    typeTitle: 'User Task',
    label: '',
    icon: '👤',
    description: ''
  };

  // Validation State
  public validationResult: GraphValidationResult | null = null;

  // 1. PALETTE ICON RAIL: 7 LOẠI NODE CHUẨN CỦA IPCC 2.0 (ANT DESIGN MONOCHROME)
  public paletteItems: PaletteItem[] = [
    {
      type: 'trigger',
      typeTitle: 'Trigger',
      defaultName: '',
      icon: '⚡',
      label: 'Trigger',
      badge: 'Trigger',
      bg: '#fffbe6',
      border: '#ffe58f',
      color: '#d97706',
      tooltipText: 'Trigger (Khởi tạo luồng)'
    },
    {
      type: 'task',
      typeTitle: 'User Task',
      defaultName: '',
      icon: '👤',
      label: 'User Task',
      badge: 'Task',
      bg: '#f0f5ff',
      border: '#adc6ff',
      color: '#1677ff',
      tooltipText: 'User Task (Tác vụ người dùng)'
    },
    {
      type: 'action',
      typeTitle: 'Action',
      defaultName: '',
      icon: '🚀',
      label: 'Action',
      badge: 'Action',
      bg: '#f9f0ff',
      border: '#d3adf7',
      color: '#722ed1',
      tooltipText: 'Action (Gọi API / Tự động hoá ngầm)'
    },
    {
      type: 'condition',
      typeTitle: 'Condition',
      defaultName: '',
      icon: '❓',
      label: 'Condition',
      badge: 'Condition',
      bg: '#fffbe6',
      border: '#ffe58f',
      color: '#d48806',
      tooltipText: 'Condition (Exclusive Gateway - Rẽ nhánh logic)'
    },
    {
      type: 'split',
      typeTitle: 'Split',
      defaultName: '',
      icon: '⑂',
      label: 'Split',
      badge: 'Split',
      bg: '#f0f5ff',
      border: '#adc6ff',
      color: '#0958d9',
      tooltipText: 'Split (Phân nhánh song song)'
    },
    {
      type: 'merge',
      typeTitle: 'Merge',
      defaultName: '',
      icon: '⑃',
      label: 'Merge',
      badge: 'Merge',
      bg: '#f0f5ff',
      border: '#adc6ff',
      color: '#0958d9',
      tooltipText: 'Merge (Gom nhánh song song)'
    },
    {
      type: 'end',
      typeTitle: 'End',
      defaultName: '',
      icon: '🛑',
      label: 'End',
      badge: 'End',
      bg: '#fff1f0',
      border: '#ffa39e',
      color: '#cf1322',
      tooltipText: 'End (Kết thúc tiến trình)'
    }
  ];

  public currentTemplate: ProcessTemplateItem = {
    code: 'PRC_COMPLAINT_BILLING',
    name: 'Xử lý phản ánh cước di động trả sau',
    category: 'Xử lý khiếu nại',
    owner_org_id: 'ORG_CSKH_MB',
    owner_org_name: 'TT CSKH Miền Bắc',
    version: 'V2.1',
    sla: '2h SLA',
    slaStatus: 'normal',
    status: 'Published',
    description: 'Quy trình tiếp nhận, tra cứu cước CDR, đối soát khuyến mãi và gửi SMS kết quả cho khách hàng',
    published_at: '28/09/2026 14:30',
    active_instances_count: 14
  };
  private routeSub = new Subscription();

  // History Undo/Redo Manager (>= 25 steps theo FR-02)
  private historyStack: any[] = [];
  private redoStack: any[] = [];
  private isUndoRedoAction: boolean = false;
  private readonly MAX_STACK_SIZE = 25;
  public canUndo: boolean = false;
  public canRedo: boolean = false;
  private readonly STORAGE_KEY = 'x6_workflow_graph_data';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private templateService: TemplateService,
    private modalService: NzModalService,
    public bridgeService: GraphBridgeService
  ) { }

  ngOnInit(): void {
    // 1. Lắng nghe cập nhật từ NodeConfigDrawer qua Bridge Service
    this.routeSub.add(
      this.bridgeService.nodeUpdated$.subscribe(event => {
        if (!this.selectedNode || this.selectedNode.id !== event.nodeId) return;
        this.selectedNodeProps = { ...event.props };
        if (event.field === 'label') {
          this.onNodeLabelChange();
        } else {
          this.onNodePropChange();
        }
      })
    );

    this.routeSub.add(
      this.bridgeService.approvalToggled$.subscribe(({ nodeId, isApproval }) => {
        if (!this.selectedNode || this.selectedNode.id !== nodeId) return;
        this.selectedNodeProps.isApprovalStep = isApproval;
        this.onUserTaskApprovalToggle();
      })
    );

    this.routeSub.add(
      this.bridgeService.branchUpdated$.subscribe(({ nodeId, action, index, props }) => {
        if (!this.selectedNode || this.selectedNode.id !== nodeId) return;
        this.selectedNodeProps = { ...props };
        if (action === 'add') {
          this.addBranch();
        } else if (action === 'remove' && index !== undefined) {
          this.removeBranch(index);
        } else if (action === 'change') {
          this.onBranchChange(index);
        }
      })
    );

    this.routeSub.add(
      this.bridgeService.nodeDeleted$.subscribe(nodeId => {
        if (this.selectedNode && this.selectedNode.id === nodeId) {
          this.deleteSelectedNode();
        }
      })
    );

    this.routeSub.add(
      this.bridgeService.modalRequest$.subscribe(req => {
        if (req.type === 'info') this.openTemplateInfoModal();
        else if (req.type === 'notify') this.openNotifyConfigModal();
        else if (req.type === 'json') this.openJsonPreviewModal(req.payload);
        else if (req.type === 'validation') this.openValidationModal(req.payload);
      })
    );

    this.routeSub.add(
      this.bridgeService.isDrawerOpen$.subscribe(open => {
        this.isDrawerOpen = open;
      })
    );

    this.routeSub.add(
      this.route.queryParams.subscribe(params => {
        const templateCode = params['id'];
        if (templateCode) {
          const found = this.templateService.getTemplateByCode(templateCode);
          if (found) {
            this.currentTemplate = found;
          } else {
            this.currentTemplate = {
              code: templateCode,
              name: params['name'] || 'Quy trình xử lý nghiệp vụ',
              version: 'v1.0',
              sla: '4h SLA',
              slaStatus: 'normal',
              status: 'Draft',
              description: 'Quy trình khởi tạo từ danh sách Template'
            };
          }

          if (this.graph && this.currentTemplate.graphData) {
            this.loadGraphData(this.currentTemplate.graphData);
          }
        }
      })
    );
  }

  ngAfterViewInit(): void {
    this.initGraph();
  }

  private initGraph(): void {
    const container = this.containerRef.nativeElement;
    const GraphClass = typeof Graph !== 'undefined' ? Graph : (typeof X6 !== 'undefined' ? (X6.Graph || X6) : (window as any).X6?.Graph);

    this.graph = new GraphClass({
      container,
      autoResize: true,
      grid: {
        size: 15,
        visible: true,
        type: 'mesh',
        args: {
          color: '#f0f3f6',
          thickness: 1,
        },
      },
      background: {
        color: '#f8fafc',
      },
      scroller: {
        enabled: true,
        pannable: true,
      },
      connecting: {
        snap: true,
        allowBlank: false,
        allowMulti: false,
        allowLoop: false,
        highlight: true,
        connector: {
          name: 'smooth',
        },
        router: {
          name: 'manhattan',
          args: {
            padding: 16,
          },
        },
        attrs: {
          line: {
            stroke: '#94a3b8',
            strokeWidth: 1.5,
            targetMarker: null,
          },
        },
        validateConnection: (params: any) => {
          return validateBpmnConnection({ ...params, graph: this.graph });
        },
      },
      panning: {
        enabled: true,
        modifiers: 'space',
      },
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: 'ctrl',
        minScale: 0.4,
        maxScale: 2.2,
      },
    });

    if (typeof Scroller !== 'undefined' && !this.graph.getPlugin?.('scroller')) {
      try {
        this.graph.use(
          new Scroller({
            enabled: true,
            pannable: true,
          })
        );
      } catch (e) {
        console.warn('Scroller notice:', e);
      }
    }

    if (this.minimapContainerRef?.nativeElement) {
      try {
        this.miniMapPlugin = new MiniMap({
          container: this.minimapContainerRef.nativeElement,
          width: 216,
          height: 130,
          padding: 8,
          scalable: false,
        });
        this.graph.use(this.miniMapPlugin);
      } catch (e) {
        console.warn('MiniMap notice:', e);
      }
    }

    // Node Hover Highlight (Ant Design monochrome style)
    this.graph.on('node:mouseenter', ({ node }: { node: any }) => {
      if (this.selectedNode !== node) {
        node.attr('body/stroke', '#1677ff');
      }
    });

    this.graph.on('node:mouseleave', ({ node }: { node: any }) => {
      if (this.selectedNode !== node) {
        node.attr('body/stroke', '#e2e8f0');
      }
    });

    // Edge Hover Highlight
    this.graph.on('edge:mouseenter', ({ edge }: { edge: any }) => {
      edge.attr('line/stroke', '#1677ff');
      edge.attr('line/strokeWidth', 2);
    });

    this.graph.on('edge:mouseleave', ({ edge }: { edge: any }) => {
      if (this.selectedCell !== edge) {
        edge.attr('line/stroke', '#94a3b8');
        edge.attr('line/strokeWidth', 1.5);
      }
    });

    this.graph.on('edge:click', ({ edge }: { edge: any }) => {
      this.resetPreviousEdgeHighlight();
      this.selectedCell = edge;
      edge.attr('line/stroke', '#1677ff');
      edge.attr('line/strokeWidth', 2);
      this.selectedNode = null;
      this.isDrawerOpen = false;
      this.bridgeService.clearSelection();
      this.selectedCellInfo = `[Đường liên kết] ID: ${edge.id.substring(0, 8)}...`;
    });

    // 4. KHI CLICK VÀO NODE -> MỞ DRAWER BÊN PHẢI QUA BRIDGE SERVICE (FR-05)
    this.graph.on('node:click', ({ node }: { node: any }) => {
      this.resetPreviousEdgeHighlight();
      this.selectNode(node);
      this.isDrawerOpen = true;
      this.bridgeService.selectNode(node, this.selectedNodeProps);
    });

    this.graph.on('blank:click', () => {
      this.resetPreviousEdgeHighlight();
      this.clearSelection();
      this.bridgeService.clearSelection();
    });

    // Tự động thiết lập style dây nối #94a3b8 khi nối dây (đồng bộ nét liền chuẩn, không sinh line riêng hay nhãn text)
    this.graph.on('edge:connected', ({ edge }: { edge: any }) => {
      edge.attr('line/stroke', '#94a3b8');
      edge.attr('line/strokeWidth', 1.5);
      edge.attr('line/strokeDasharray', null);
      edge.setLabels([]);
    });

    this.graph.on('cell:added', () => {
      this.updateCounts();
      this.pushHistorySnapshot();
    });

    this.graph.on('cell:removed', () => {
      this.updateCounts();
      this.pushHistorySnapshot();
    });

    this.graph.on('scale', ({ sx }: { sx: number }) => {
      this.currentZoom = Math.round(sx * 100);
    });

    // Load initial workflow
    const initType = this.route.snapshot.queryParams['initType'];
    if (this.currentTemplate.graphData) {
      this.loadGraphData(this.currentTemplate.graphData);
    } else if (initType === 'blank') {
      this.createBlankWorkflowSample();
    } else {
      this.createCompactWorkflowSample();
    }
    this.graph.getEdges()?.forEach((e: any) => e.setLabels([]));
  }

  private resetPreviousEdgeHighlight(): void {
    if (this.selectedCell && this.selectedCell.isEdge?.()) {
      this.selectedCell.attr('line/stroke', '#94a3b8');
      this.selectedCell.attr('line/strokeWidth', 1.5);
    }
    this.selectedCell = null;
  }

  public truncateLabel(text: string, maxLen: number = 16): string {
    if (!text) return '';
    const trimmed = text.trim();
    return trimmed.length > maxLen ? trimmed.slice(0, maxLen - 1) + '…' : trimmed;
  }

  public getNodeTypeBg(type: NodeType): string {
    const item = this.paletteItems.find(p => p.type === type);
    return item?.bg || '#f0f5ff';
  }

  public getNodeTypeBorder(type: NodeType): string {
    const item = this.paletteItems.find(p => p.type === type);
    return item?.border || '#cbd5e1';
  }

  public getNodeTypeColor(type: NodeType): string {
    const item = this.paletteItems.find(p => p.type === type);
    return item?.color || '#1677ff';
  }

  public getNodeSvgDataUri(type: NodeType): string {
    const strokeWidth = '1.8';
    const svgMap: Record<NodeType, string> = {
      trigger: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
      task: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
      action: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#722ed1" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path></svg>`,
      condition: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#d48806" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
      split: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0958d9" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>`,
      merge: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0958d9" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M6 9a9 9 0 0 0 9 9"></path><line x1="18" y1="9" x2="18" y2="21"></line></svg>`,
      end: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#cf1322" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><rect x="9" y="9" width="6" height="6" fill="#cf1322"></rect></svg>`
    };
    const raw = svgMap[type] || svgMap.task;
    return `data:image/svg+xml;utf8,${encodeURIComponent(raw.trim())}`;
  }

  public generateNodeKey(type: NodeType, label: string): string {
    const prefixMap: Record<NodeType, string> = {
      trigger: 'TRG',
      task: 'TSK',
      action: 'ACT',
      condition: 'CND',
      split: 'SPL',
      merge: 'MRG',
      end: 'END'
    };
    const prefix = prefixMap[type] || 'STEP';
    const cleanLabel = (label || '')
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 15);
    return cleanLabel ? `${prefix}_${cleanLabel}` : `${prefix}_${Math.floor(1000 + Math.random() * 9000)}`;
  }



  public addBranch(): void {
    if (!this.selectedNodeProps.branches) {
      this.selectedNodeProps.branches = [];
    }

    const customBranches = this.selectedNodeProps.branches.filter(b => !b.isDefault);
    const customCount = customBranches.length + 1;
    const branchName = `Nhánh ${customCount}`;
    const newBranch: ConditionBranch = {
      id: `br-${customCount}_${Date.now() % 1000}`,
      name: branchName,
      defaultLabel: branchName,
      value: '',
      expression: '',
      variableSource: this.selectedNodeProps.conditionVariable || 'flow.variables',
      isDefault: false
    };

    // Ensure default branch is always present and stays at the END (dưới cùng)
    const defIdx = this.selectedNodeProps.branches.findIndex(b => b.isDefault);
    if (defIdx === -1) {
      this.selectedNodeProps.branches.push(newBranch);
      this.selectedNodeProps.branches.push({
        id: 'br-default',
        name: 'Mặc định',
        defaultLabel: 'Mặc định',
        value: 'default',
        expression: 'default',
        variableSource: this.selectedNodeProps.conditionVariable || 'flow.variables',
        isDefault: true
      });
    } else {
      // Chèn nhánh mới vào trước nhánh Mặc định để Mặc định luôn ở dưới cùng
      this.selectedNodeProps.branches.splice(defIdx, 0, newBranch);
    }
    this.updateConditionNodePorts();
  }

  public removeBranch(index: number): void {
    if (!this.selectedNodeProps.branches) return;
    const br = this.selectedNodeProps.branches[index];
    if (br?.isDefault) {
      alert('Nhánh Mặc định là cố định của node Condition, không thể xoá.');
      return;
    }
    this.selectedNodeProps.branches.splice(index, 1);
    this.updateConditionNodePorts();
  }

  public onBranchChange(index?: number): void {
    if (!this.selectedNode || this.selectedNodeProps.type !== 'condition') return;
    this.syncConditionEdgeLabels();
    const data = this.selectedNode.getData() || {};
    this.selectedNode.setData({ ...data, branches: this.selectedNodeProps.branches });
    const branches = this.selectedNodeProps.branches || [];
    branches.forEach((br, idx) => {
      const displayText = br.name || br.defaultLabel || (br.isDefault ? 'Mặc định' : `Nhánh ${idx + 1}`);
      this.selectedNode.attr(`rowText_${idx}/text`, this.truncateLabel(displayText, 18));
      const portId = br.id || (br.isDefault ? 'out-default' : `out-branch-${idx}`);
      if (this.selectedNode.portProp) {
        this.selectedNode.portProp(portId, 'attrs/portTitle/text', displayText);
      }
    });
  }

  public syncConditionEdgeLabels(): void {
    if (!this.selectedNode || !this.graph) return;
    const outgoingEdges = this.graph.getOutgoingEdges(this.selectedNode) || [];
    outgoingEdges.forEach((edge: any) => {
      edge.setLabels([]);
    });
  }

  public updateConditionNodePorts(): void {
    if (!this.selectedNode || this.selectedNodeProps.type !== 'condition') return;
    let branches = this.selectedNodeProps.branches ? [...this.selectedNodeProps.branches] : [];

    // Ensure default branch is always present and stays at the END (dưới cùng)
    const defaultIdx = branches.findIndex(b => b.isDefault);
    if (defaultIdx === -1) {
      branches.push({
        id: 'br-default',
        name: 'Mặc định',
        defaultLabel: 'Mặc định',
        value: 'default',
        expression: 'default',
        variableSource: this.selectedNodeProps.conditionVariable || 'flow.variables',
        isDefault: true
      });
    } else if (defaultIdx !== branches.length - 1) {
      const [defBr] = branches.splice(defaultIdx, 1);
      branches.push(defBr);
    }
    this.selectedNodeProps.branches = branches;

    const count = branches.length;
    // 64 cho Header + Tiêu đề phụ 'Định tuyến', 22px cho mỗi nhánh (Nhánh 1..N, Mặc định), 8px padding
    const targetHeight = 64 + count * 22 + 8;
    this.selectedNode.resize(168, targetHeight);

    const hasLabel = !!(this.selectedNodeProps.label && this.selectedNodeProps.label.trim());
    this.selectedNode.attr('typeTitle/refY', hasLabel ? 16 : 22);
    this.selectedNode.attr('nameText/refY', 32);
    this.selectedNode.attr('iconBox/refY', 7);
    this.selectedNode.attr('iconImg/refY', 14);
    this.selectedNode.attr('divider/display', 'block');
    this.selectedNode.attr('sectionHeader/display', 'block');
    this.selectedNode.attr('sectionHeader/text', 'Định tuyến');
    this.selectedNode.attr('sectionHeader/refY', 58);
    this.selectedNode.attr('sectionHeader/refX', 14);

    // Update row texts starting at y = 78 (Nhánh 1, Nhánh 2... và Mặc định ở dưới cùng)
    for (let i = 0; i < 16; i++) {
      if (i < count) {
        const br = branches[i];
        const displayText = br.name || br.defaultLabel || (br.isDefault ? 'Mặc định' : `Nhánh ${i + 1}`);
        this.selectedNode.attr(`rowText_${i}/display`, 'block');
        this.selectedNode.attr(`rowText_${i}/text`, this.truncateLabel(displayText, 18));
        this.selectedNode.attr(`rowText_${i}/refY`, 78 + i * 22);
        this.selectedNode.attr(`rowText_${i}/refX`, 14);
        this.selectedNode.attr(`rowText_${i}/fill`, '#475569');
      } else {
        this.selectedNode.attr(`rowText_${i}/display`, 'none');
      }
    }

    const expectedPortItems = getNodePortItems('condition', { branches }, 168);

    if (typeof this.selectedNode.getPorts === 'function' && typeof this.selectedNode.addPort === 'function') {
      const currentPorts: any[] = this.selectedNode.getPorts() || [];
      const currentPortIds = new Set(currentPorts.map((p: any) => p.id));
      const expectedPortIds = new Set(expectedPortItems.map((p: any) => p.id));

      // 1. Remove ports not in expectedPortItems
      for (const p of currentPorts) {
        if (!expectedPortIds.has(p.id)) {
          this.selectedNode.removePort(p.id);
        }
      }

      // 2. Add new ports or update existing ones
      for (const item of expectedPortItems) {
        if (currentPortIds.has(item.id)) {
          if (item.args && this.selectedNode.portProp) {
            this.selectedNode.portProp(item.id, 'args', item.args);
          }
          if (item.attrs?.portTitle?.text && this.selectedNode.portProp) {
            this.selectedNode.portProp(item.id, 'attrs/portTitle/text', item.attrs.portTitle.text);
          }
        } else {
          this.selectedNode.addPort(item);
        }
      }
    } else {
      this.selectedNode.prop('ports/items', expectedPortItems, { rewrite: true });
    }

    this.syncConditionEdgeLabels();

    const data = this.selectedNode.getData() || {};
    this.selectedNode.setData({ ...data, ...this.selectedNodeProps, branches });
    this.pushHistorySnapshot();
  }

  public onUserTaskApprovalToggle(): void {
    if (!this.selectedNode || this.selectedNodeProps.type !== 'task') return;
    const isApproval = !!this.selectedNodeProps.isApprovalStep;
    const targetHeight = isApproval ? 96 : 48;
    this.selectedNode.resize(168, targetHeight);

    const hasLabel = !!(this.selectedNodeProps.label && this.selectedNodeProps.label.trim());
    const centerY = isApproval ? 22 : Math.round(targetHeight / 2);
    const iconBoxY = isApproval ? 7 : Math.round((targetHeight - 32) / 2);

    this.selectedNode.attr('typeTitle/refY', hasLabel ? 16 : centerY);
    this.selectedNode.attr('nameText/refY', 32);
    this.selectedNode.attr('iconBox/refY', iconBoxY);
    this.selectedNode.attr('iconImg/refY', iconBoxY + 7);

    // Toggle multi-row visuals like Node Action: 'Đồng ý' & 'Từ chối'
    this.selectedNode.attr('divider/display', isApproval ? 'block' : 'none');
    this.selectedNode.attr('rowText_0/ref', 'body');
    this.selectedNode.attr('rowText_0/refX', 14);
    this.selectedNode.attr('rowText_0/refY', 60);
    this.selectedNode.attr('rowText_0/text', 'Đồng ý');
    this.selectedNode.attr('rowText_0/fontSize', 11);
    this.selectedNode.attr('rowText_0/fontWeight', 500);
    this.selectedNode.attr('rowText_0/fill', '#475569');
    this.selectedNode.attr('rowText_0/textAnchor', 'start');
    this.selectedNode.attr('rowText_0/textVerticalAnchor', 'middle');
    this.selectedNode.attr('rowText_0/display', isApproval ? 'block' : 'none');

    this.selectedNode.attr('rowText_1/ref', 'body');
    this.selectedNode.attr('rowText_1/refX', 14);
    this.selectedNode.attr('rowText_1/refY', 82);
    this.selectedNode.attr('rowText_1/text', 'Từ chối');
    this.selectedNode.attr('rowText_1/fontSize', 11);
    this.selectedNode.attr('rowText_1/fontWeight', 500);
    this.selectedNode.attr('rowText_1/fill', '#475569');
    this.selectedNode.attr('rowText_1/textAnchor', 'start');
    this.selectedNode.attr('rowText_1/textVerticalAnchor', 'middle');
    this.selectedNode.attr('rowText_1/display', isApproval ? 'block' : 'none');

    const expectedPortItems = getNodePortItems('task', { isApprovalStep: isApproval }, 168);

    if (typeof this.selectedNode.getPorts === 'function' && typeof this.selectedNode.addPort === 'function') {
      const currentPorts: any[] = this.selectedNode.getPorts() || [];
      const currentPortIds = new Set(currentPorts.map((p: any) => p.id));
      const expectedPortIds = new Set(expectedPortItems.map((p: any) => p.id));

      // 1. Re-route edges if needed
      if (this.graph) {
        const outgoing = this.graph.getOutgoingEdges(this.selectedNode) || [];
        for (const edge of outgoing) {
          const port = edge.getSourcePortId?.() || edge.getSource()?.port;
          if (isApproval && port === 'out') {
            edge.setSource({ cell: this.selectedNode, port: 'out-approve' });
          } else if (!isApproval && (port === 'out-approve' || port === 'out-reject')) {
            edge.setSource({ cell: this.selectedNode, port: 'out' });
          }
        }
      }

      // 2. Remove ports not in expectedPortItems
      for (const p of currentPorts) {
        if (!expectedPortIds.has(p.id)) {
          this.selectedNode.removePort(p.id);
        }
      }

      // 3. Add new ports or update existing ones
      for (const item of expectedPortItems) {
        if (currentPortIds.has(item.id)) {
          if (item.args && this.selectedNode.portProp) {
            this.selectedNode.portProp(item.id, 'args', item.args);
          }
        } else {
          this.selectedNode.addPort(item);
        }
      }
    } else {
      this.selectedNode.prop('ports/items', expectedPortItems, { rewrite: true });
    }

    const data = this.selectedNode.getData() || {};
    this.selectedNode.setData({ ...data, ...this.selectedNodeProps, isApprovalStep: isApproval });
    this.pushHistorySnapshot();
  }

  // ============================================================================
  // 2. MINI COMPACT CARD NODE FACTORY (CHUẨN GIAO DIỆN 168px x 48px - 2 DÒNG PHÂN CẤP)
  // ============================================================================
  public createCompactCardNode(
    type: NodeType,
    x: number,
    y: number,
    label?: string,
    customData?: any
  ): any {
    if (!this.graph) return null;

    const itemDef = this.paletteItems.find(p => p.type === type) || this.paletteItems[1];
    const nodeLabel = label !== undefined ? label : (customData?.label !== undefined ? customData.label : '');

    // 1. TRIGGER BPMN EVENT: Circle 48px, single border #e2e8f0, center lightning bolt icon, single out port on right
    if (type === 'trigger') {
      const portItems = getNodePortItems('trigger', customData, 48);
      const node = this.graph.addNode({
        shape: 'rect',
        x,
        y,
        width: 48,
        height: 48,
        markup: [
          { tagName: 'circle', selector: 'body' },
          { tagName: 'text', selector: 'iconText' },
          { tagName: 'text', selector: 'nameText' }
        ],
        attrs: {
          body: {
            cx: 24,
            cy: 24,
            r: 23,
            fill: '#ffffff',
            stroke: '#e2e8f0',
            strokeWidth: 1.5,
            cursor: 'pointer'
          },
          iconText: {
            ref: 'body',
            refX: 24,
            refY: 24,
            text: '⚡',
            fontSize: 20,
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
            cursor: 'pointer'
          },
          nameText: {
            ref: 'body',
            refX: 24,
            refY: '100%',
            refY2: 8,
            text: nodeLabel || '',
            fontSize: 11,
            fontWeight: 500,
            fill: '#475569',
            textAnchor: 'middle',
            textVerticalAnchor: 'top',
            cursor: 'pointer'
          }
        },
        ports: {
          groups: BPMN_PORT_GROUPS,
          items: portItems
        }
      });
      const initialData: NodePropertyModel = {
        id: node.id,
        nodeKey: customData?.nodeKey || this.generateNodeKey(type, nodeLabel),
        type,
        typeTitle: itemDef.typeTitle,
        label: nodeLabel,
        icon: '⚡',
        description: customData?.description || '',
        triggerEvent: customData?.triggerEvent || 'Inbound Call (Tổng đài 1800xxxx)',
        ...customData
      };
      node.setData(initialData);
      return node;
    }

    // 2. END BPMN EVENT: Circle 48px, border #e2e8f0, center red terminate square, single in port on left
    if (type === 'end') {
      const portItems = getNodePortItems('end', customData, 48);
      const node = this.graph.addNode({
        shape: 'rect',
        x,
        y,
        width: 48,
        height: 48,
        markup: [
          { tagName: 'circle', selector: 'body' },
          { tagName: 'rect', selector: 'centerSquare' },
          { tagName: 'text', selector: 'nameText' }
        ],
        attrs: {
          body: {
            cx: 24,
            cy: 24,
            r: 23,
            fill: '#ffffff',
            stroke: '#e2e8f0',
            strokeWidth: 1.5,
            cursor: 'pointer'
          },
          centerSquare: {
            x: 17,
            y: 17,
            width: 14,
            height: 14,
            rx: 3,
            fill: '#ff4d4f',
            stroke: 'none',
            cursor: 'pointer'
          },
          nameText: {
            ref: 'body',
            refX: 24,
            refY: '100%',
            refY2: 8,
            text: nodeLabel || '',
            fontSize: 11,
            fontWeight: 500,
            fill: '#475569',
            textAnchor: 'middle',
            textVerticalAnchor: 'top',
            cursor: 'pointer'
          }
        },
        ports: {
          groups: BPMN_PORT_GROUPS,
          items: portItems
        }
      });
      const initialData: NodePropertyModel = {
        id: node.id,
        nodeKey: customData?.nodeKey || this.generateNodeKey(type, nodeLabel),
        type,
        typeTitle: itemDef.typeTitle,
        label: nodeLabel,
        icon: '🛑',
        description: customData?.description || '',
        ...customData
      };
      node.setData(initialData);
      return node;
    }

    const isAction = type === 'action';
    const isCondition = type === 'condition';
    const isSplit = type === 'split';
    const isMerge = type === 'merge';
    const isApprovalTask = type === 'task' && !!customData?.isApprovalStep;
    const isMultiRow = isAction || isApprovalTask || isCondition;

    let branches: ConditionBranch[] = isCondition
      ? (customData?.branches && customData.branches.length > 0 ? [...customData.branches] : [
        { id: 'br-default', name: 'Mặc định', defaultLabel: 'Mặc định', value: 'default', expression: 'default', variableSource: 'flow.variables', isDefault: true }
      ])
      : [];

    if (isCondition) {
      const defaultIdx = branches.findIndex(b => b.isDefault);
      if (defaultIdx === -1) {
        branches.push({ id: 'br-default', name: 'Mặc định', defaultLabel: 'Mặc định', value: 'default', expression: 'default', variableSource: 'flow.variables', isDefault: true });
      } else if (defaultIdx !== branches.length - 1) {
        const [defBr] = branches.splice(defaultIdx, 1);
        branches.push(defBr);
      }
    }

    const cardWidth = 168;
    const nodeHeight = (isAction || isApprovalTask)
      ? 96
      : isCondition
        ? (64 + branches.length * 22 + 8)
        : (isSplit || isMerge)
          ? 54
          : 48;

    const hasLabel = !!(nodeLabel && nodeLabel.trim());
    const centerY = isMultiRow ? 22 : Math.round(nodeHeight / 2);
    const iconBoxY = isMultiRow ? 7 : Math.round((nodeHeight - 32) / 2);

    // Dynamic SVG markup
    const markup: any[] = [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'rect', selector: 'iconBox' },
      { tagName: 'image', selector: 'iconImg' },
      { tagName: 'text', selector: 'typeTitle' },
      { tagName: 'text', selector: 'nameText' },
      { tagName: 'line', selector: 'divider' },
      { tagName: 'text', selector: 'sectionHeader' },
    ];

    // Pre-declare rowText_0 through rowText_15 for multi-row nodes
    for (let i = 0; i < 16; i++) {
      markup.push({ tagName: 'text', selector: `rowText_${i}` });
    }

    const attrs: any = {
      body: {
        refWidth: '100%',
        refHeight: '100%',
        rx: 8,
        ry: 8,
        fill: '#ffffff',
        stroke: '#e2e8f0',
        strokeWidth: 1.5,
        cursor: 'pointer',
      },
      iconBox: {
        ref: 'body',
        refX: 8,
        refY: iconBoxY,
        width: 32,
        height: 32,
        rx: 6,
        ry: 6,
        fill: isAction ? '#f9f0ff' : itemDef.bg,
        stroke: itemDef.border || '#e2e8f0',
        strokeWidth: 1,
      },
      iconImg: {
        ref: 'body',
        refX: 15,
        refY: iconBoxY + 7,
        width: 18,
        height: 18,
        'xlink:href': this.getNodeSvgDataUri(type),
        href: this.getNodeSvgDataUri(type),
      },
      typeTitle: {
        ref: 'body',
        refX: 48,
        refY: hasLabel ? 16 : centerY,
        text: itemDef.typeTitle,
        fontSize: hasLabel ? 11 : 12,
        fontWeight: 600,
        fill: '#1e293b',
        textAnchor: 'start',
        textVerticalAnchor: 'middle',
      },
      nameText: {
        ref: 'body',
        refX: 48,
        refY: 32,
        text: this.truncateLabel(nodeLabel, 16),
        fontSize: 11,
        fontWeight: 400,
        fill: '#64748b',
        textAnchor: 'start',
        textVerticalAnchor: 'middle',
      },
      divider: {
        x1: 8,
        y1: 44,
        x2: cardWidth - 8,
        y2: 44,
        stroke: '#f1f5f9',
        strokeWidth: 1,
        display: isMultiRow ? 'block' : 'none'
      },
      sectionHeader: {
        ref: 'body',
        refX: 14,
        refY: 58,
        text: 'Định tuyến',
        fontSize: 10,
        fontWeight: 600,
        fill: '#94a3b8',
        textAnchor: 'start',
        textVerticalAnchor: 'middle',
        display: isCondition ? 'block' : 'none'
      }
    };

    for (let i = 0; i < 16; i++) {
      if (isAction) {
        if (i === 0) {
          attrs[`rowText_${i}`] = {
            ref: 'body', refX: 14, refY: 60, text: 'Thành công',
            fontSize: 11, fontWeight: 500, fill: '#475569',
            textAnchor: 'start', textVerticalAnchor: 'middle', display: 'block'
          };
        } else if (i === 1) {
          attrs[`rowText_${i}`] = {
            ref: 'body', refX: 14, refY: 82, text: 'Thất bại',
            fontSize: 11, fontWeight: 500, fill: '#475569',
            textAnchor: 'start', textVerticalAnchor: 'middle', display: 'block'
          };
        } else {
          attrs[`rowText_${i}`] = {
            ref: 'body', refX: 14, refY: 60 + i * 22,
            fontSize: 11, fontWeight: 500, fill: '#475569',
            textAnchor: 'start', textVerticalAnchor: 'middle', display: 'none'
          };
        }
      } else if (isApprovalTask) {
        if (i === 0) {
          attrs[`rowText_${i}`] = {
            ref: 'body', refX: 14, refY: 60, text: 'Đồng ý',
            fontSize: 11, fontWeight: 500, fill: '#475569',
            textAnchor: 'start', textVerticalAnchor: 'middle', display: 'block'
          };
        } else if (i === 1) {
          attrs[`rowText_${i}`] = {
            ref: 'body', refX: 14, refY: 82, text: 'Từ chối',
            fontSize: 11, fontWeight: 500, fill: '#475569',
            textAnchor: 'start', textVerticalAnchor: 'middle', display: 'block'
          };
        } else {
          attrs[`rowText_${i}`] = {
            ref: 'body', refX: 14, refY: 60 + i * 22,
            fontSize: 11, fontWeight: 500, fill: '#475569',
            textAnchor: 'start', textVerticalAnchor: 'middle', display: 'none'
          };
        }
      } else if (isCondition) {
        if (i < branches.length) {
          const br = branches[i];
          const displayText = br.name || br.defaultLabel || (br.isDefault ? 'Mặc định' : `Nhánh ${i + 1}`);
          attrs[`rowText_${i}`] = {
            ref: 'body', refX: 14, refY: 78 + i * 22,
            text: this.truncateLabel(displayText, 18),
            fontSize: 11, fontWeight: 500, fill: '#475569',
            textAnchor: 'start', textVerticalAnchor: 'middle', display: 'block'
          };
        } else {
          attrs[`rowText_${i}`] = {
            ref: 'body', refX: 14, refY: 78 + i * 22,
            fontSize: 11, fontWeight: 500, fill: '#475569',
            textAnchor: 'start', textVerticalAnchor: 'middle', display: 'none'
          };
        }
      } else {
        attrs[`rowText_${i}`] = {
          ref: 'body', refX: 14, refY: 60 + i * 22,
          fontSize: 11, fontWeight: 500, fill: '#475569',
          textAnchor: 'start', textVerticalAnchor: 'middle', display: 'none'
        };
      }
    }

    const portItems = getNodePortItems(
      type,
      { ...customData, branches, isApprovalStep: isApprovalTask },
      cardWidth
    );

    const node = this.graph.addNode({
      shape: 'rect',
      x,
      y,
      width: cardWidth,
      height: nodeHeight,
      markup,
      attrs,
      ports: {
        groups: BPMN_PORT_GROUPS,
        items: portItems,
      },
    });

    const initialData: NodePropertyModel = {
      id: node.id,
      nodeKey: customData?.nodeKey || this.generateNodeKey(type, nodeLabel),
      type,
      typeTitle: itemDef.typeTitle,
      label: nodeLabel,
      icon: itemDef.icon,
      description: customData?.description || '',
      isApprovalStep: isApprovalTask,

      // Action fields (US-34, BR-INT-01..05, REQ-11)
      actionSource: customData?.actionSource || 'library',
      actionLibraryId: customData?.actionLibraryId || (type === 'action' ? 'act-ipcc-api' : undefined),
      actionMethod: customData?.actionMethod || 'POST',
      actionEndpoint: customData?.actionEndpoint || (type === 'action' ? 'https://ipcc.vnpt.vn/api/v2/call/dispatch' : ''),
      requestBodyMapping: customData?.requestBodyMapping || (type === 'action' ? '{\n  "callId": "${flow.variables.call_id}",\n  "queue": "HOTLINE_1800"\n}' : ''),
      responseMapping: customData?.responseMapping || (type === 'action' ? 'flow.variables.ticket_id = response.data.ticketId;' : ''),
      slaSeconds: customData?.slaSeconds !== undefined ? customData?.slaSeconds : 3,
      retryCount: customData?.retryCount !== undefined ? customData?.retryCount : 3,
      retryInterval: customData?.retryInterval || '5s',
      circuitBreakerTimeoutMs: customData?.circuitBreakerTimeoutMs !== undefined ? customData?.circuitBreakerTimeoutMs : 3000,

      // Condition fields (Exclusive Gateway - Multi-branch)
      branches: customData?.branches || (type === 'condition' ? [
        { id: 'br-default', name: 'Mặc định', defaultLabel: 'Mặc định', value: 'default', expression: 'default', variableSource: 'flow.variables', isDefault: true },
      ] : undefined),
      servicePivotSource: customData?.servicePivotSource || 'flow.variables',
      conditionVariable: customData?.conditionVariable || 'flow.variables.cuoc',
      conditionRule: customData?.conditionRule || 'cuoc_phat_sinh > 500000',

      // General task/trigger fields
      timeout: customData?.timeout || '30 phút',
      sla: customData?.sla || '2h SLA',
      assignee: customData?.assignee || 'Điện thoại viên (FO/BO)',
      triggerEvent: customData?.triggerEvent || 'Inbound Call (Tổng đài 1800xxxx)',
      ...customData
    };
    node.setData(initialData);
    return node;
  }

  // Thêm Node từ Palette
  public addStandardNode(type: NodeType): void {
    if (!this.graph) return;
    const x = 160 + Math.floor(Math.random() * 200);
    const y = 140 + Math.floor(Math.random() * 150);
    const node = this.createCompactCardNode(type, x, y);
    if (node) {
      this.selectNode(node);
      this.isDrawerOpen = true;
      this.bridgeService.selectNode(node, this.selectedNodeProps);
      this.selectedCellInfo = `✨ Đã thêm [${type.toUpperCase()}]`;
    }
  }

  public onPaletteDragStart(event: DragEvent, type: NodeType): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/x6-node-type', type);
      event.dataTransfer.setData('text/plain', type);
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  public onCanvasDrop(event: DragEvent): void {
    event.preventDefault();
    const type = event.dataTransfer?.getData('application/x6-node-type') as NodeType;
    if (!type || !this.graph) return;

    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    const p = this.graph.clientToLocal ? this.graph.clientToLocal({ x: event.clientX, y: event.clientY }) : { x: event.clientX - rect.left, y: event.clientY - rect.top };

    const node = this.createCompactCardNode(type, p.x - 84, p.y - 24);
    if (node) {
      this.selectNode(node);
      this.isDrawerOpen = true;
      this.bridgeService.selectNode(node, this.selectedNodeProps);
      this.updateCounts();
      this.pushHistorySnapshot();
    }
  }

  // ============================================================================
  // 4. DRAWER PROPS TWO-WAY SYNC
  // ============================================================================
  public selectNode(node: any): void {
    this.selectedNode = node;
    const data = node.getData() || {};
    const itemDef = this.paletteItems.find(p => p.type === (data.type || 'task')) || this.paletteItems[1];
    const textAttr = node.attr('nameText/text') || node.attr('titleText/text') || node.attr('label/text') || '';

    this.selectedNodeProps = {
      id: node.id,
      nodeKey: data.nodeKey || this.generateNodeKey(data.type || 'task', data.label || textAttr),
      type: data.type || 'task',
      typeTitle: data.typeTitle || itemDef.typeTitle,
      label: data.label !== undefined ? data.label : (textAttr || ''),
      icon: data.icon || itemDef.icon,
      description: data.description || '',
      isApprovalStep: !!data.isApprovalStep,

      // Action fields
      actionSource: data.actionSource || 'library',
      actionLibraryId: data.actionLibraryId || (data.type === 'action' ? 'act-ipcc-api' : undefined),
      actionMethod: data.actionMethod || 'POST',
      actionEndpoint: data.actionEndpoint || (data.type === 'action' ? 'https://ipcc.vnpt.vn/api/v2/call/dispatch' : ''),
      requestBodyMapping: data.requestBodyMapping || (data.type === 'action' ? '{\n  "callId": "${flow.variables.call_id}",\n  "queue": "HOTLINE_1800"\n}' : ''),
      responseMapping: data.responseMapping || (data.type === 'action' ? 'flow.variables.ticket_id = response.data.ticketId;' : ''),
      slaSeconds: data.slaSeconds !== undefined ? data.slaSeconds : 3,
      retryCount: data.retryCount !== undefined ? data.retryCount : 3,
      retryInterval: data.retryInterval || '5s',
      circuitBreakerTimeoutMs: data.circuitBreakerTimeoutMs !== undefined ? data.circuitBreakerTimeoutMs : 3000,

      // Condition fields
      branches: data.branches && data.branches.length > 0 ? JSON.parse(JSON.stringify(data.branches)) : (data.type === 'condition' ? [
        { id: 'br-default', name: 'Định tuyến', value: 'default', expression: 'default', variableSource: 'flow.variables', isDefault: true },
        { id: 'br-1', name: 'Hợp lệ', value: '> 500000', expression: '${flow.variables.cuoc > 500000}', variableSource: 'flow.variables', isDefault: false },
        { id: 'br-2', name: 'Từ chối', value: '<= 500000', expression: '${flow.variables.cuoc <= 500000}', variableSource: 'flow.variables', isDefault: false }
      ] : undefined),
      servicePivotSource: data.servicePivotSource || 'flow.variables',
      conditionVariable: data.conditionVariable || 'flow.variables.cuoc',
      conditionRule: data.conditionRule || 'cuoc_phat_sinh > 500000',

      // General task/trigger fields
      timeout: data.timeout || '30 phút',
      sla: data.sla || '2h SLA',
      assignee: data.assignee || 'Điện thoại viên (FO/BO)',
      triggerEvent: data.triggerEvent || 'Inbound Call (Tổng đài 1800xxxx)'
    };

    this.selectedCellInfo = `[${this.selectedNodeProps.label}] ${this.selectedNodeProps.typeTitle}`;
    this.bridgeService.selectNode(node, this.selectedNodeProps);
  }

  public clearSelection(): void {
    this.selectedNode = null;
    this.isDrawerOpen = false;
    this.bridgeService.clearSelection();
    this.selectedCellInfo = 'Sẵn sàng';
  }

  public closeDrawer(): void {
    this.isDrawerOpen = false;
    this.bridgeService.closeDrawer();
  }

  public onNodeLabelChange(): void {
    if (!this.selectedNode) return;
    const label = this.selectedNodeProps.label || '';
    const hasLabel = !!label.trim();
    const type = this.selectedNodeProps.type;

    if (type === 'trigger' || type === 'end') {
      this.selectedNode.attr('nameText/text', label ? this.truncateLabel(label, 20) : '');
    } else {
      const truncated = this.truncateLabel(label, 16);
      const isMultiRow = type === 'action' || type === 'condition' || (type === 'task' && !!this.selectedNodeProps.isApprovalStep);
      const size = this.selectedNode.size();
      const nodeHeight = size?.height || 48;
      const centerY = isMultiRow ? 22 : Math.round(nodeHeight / 2);

      this.selectedNode.attr('nameText/text', truncated);
      this.selectedNode.attr('typeTitle/refY', hasLabel ? 15 : centerY);
      this.selectedNode.attr('typeTitle/fontSize', hasLabel ? 11 : 12);
    }

    const data = this.selectedNode.getData() || {};
    this.selectedNode.setData({ ...data, label: this.selectedNodeProps.label });
    this.selectedCellInfo = hasLabel ? `[${this.selectedNodeProps.label}] ${this.selectedNodeProps.typeTitle}` : `[${this.selectedNodeProps.typeTitle}]`;
  }

  public onNodePropChange(): void {
    if (!this.selectedNode) return;
    const data = this.selectedNode.getData() || {};
    this.selectedNode.setData({ ...data, ...this.selectedNodeProps });
  }

  public deleteSelectedNode(): void {
    if (!this.selectedNode) return;
    const name = this.selectedNodeProps.label;
    this.selectedNode.remove();
    this.selectedNode = null;
    this.isDrawerOpen = false;
    this.selectedCellInfo = `🗑️ Đã xóa bước [${name}]`;
    this.updateCounts();
  }

  public deleteOrClear(): void {
    if (this.selectedNode) {
      this.deleteSelectedNode();
    } else if (this.selectedCell && this.selectedCell.isEdge?.()) {
      this.selectedCell.remove();
      this.selectedCell = null;
      this.selectedCellInfo = '🗑️ Đã xóa đường liên kết';
      this.updateCounts();
    } else {
      this.clearCanvas();
    }
  }

  public revertChanges(): void {
    if (confirm('Khôi phục lại sơ đồ quy trình ban đầu? Mọi chỉnh sửa chưa lưu sẽ bị hủy.')) {
      if (this.currentTemplate.graphData) {
        this.loadGraphData(this.currentTemplate.graphData);
      } else {
        this.createCompactWorkflowSample();
      }
      this.selectedCellInfo = 'Đã khôi phục lại trạng thái ban đầu.';
    }
  }

  // ============================================================================
  // WORKFLOW SAMPLE CHUẨN (CÁC NODE VỚI THIẾT KẾ CARD 2 DÒNG TINH TẾ)
  // ============================================================================
  private createCompactWorkflowSample(): void {
    if (!this.graph) return;
    this.graph.clearCells();

    // 1. [⚡ Trigger] Tiếp nhận cước
    const trigger = this.createCompactCardNode('trigger', 60, 160, 'Tiếp nhận cước', {
      triggerEvent: 'Tiếp nhận cuộc gọi phản ánh cước',
      assignee: 'Hệ thống tự động (System)',
      nodeKey: 'TRG_INBOUND_CALL'
    });

    // 2. [👤 User Task] BO Duyệt hồ sơ
    const boTask = this.createCompactCardNode('task', 270, 160, 'BO Duyệt hồ sơ', {
      assignee: 'Điện thoại viên (FO/BO)',
      sla: '2h SLA',
      description: 'Tiếp nhận và xác minh hồ sơ phản ánh cước',
      nodeKey: 'TSK_BO_REVIEW'
    });

    // 3. [❓ Condition] Cước > 500k? (Exclusive Gateway - Multi-branch)
    const condition = this.createCompactCardNode('condition', 460, 130, 'Cước > 500k?', {
      nodeKey: 'CND_CHECK_AMOUNT',
      description: 'Kiểm tra xem số tiền cước phát sinh khiếu nại có vượt ngưỡng 500.000 VNĐ',
      servicePivotSource: 'flow.variables',
      conditionVariable: 'flow.variables.cuoc',
      branches: [
        { id: 'br-default', name: 'Định tuyến', value: 'default', expression: 'default', variableSource: 'flow.variables', isDefault: true },
        { id: 'br-1', name: 'Hợp lệ', value: '> 500k', expression: '${flow.variables.cuoc > 500000}', variableSource: 'flow.variables', isDefault: false },
        { id: 'br-2', name: 'Từ chối', value: '<= 500k', expression: '${flow.variables.cuoc <= 500000}', variableSource: 'flow.variables', isDefault: false }
      ]
    });

    // 4. [🚀 Action] Gọi API IPCC 2.0 (BẮT BUỘC 2 CỔNG RA: Thành công & Ngoại lệ)
    const action = this.createCompactCardNode('action', 700, 120, 'Gọi API IPCC 2.0', {
      nodeKey: 'ACT_DISPATCH_IPCC',
      actionSource: 'library',
      actionLibraryId: 'act-ipcc-api',
      actionMethod: 'POST',
      actionEndpoint: 'https://ipcc.vnpt.vn/api/v2/call/dispatch',
      requestBodyMapping: '{\n  "callId": "${flow.variables.call_id}",\n  "queue": "HOTLINE_1800"\n}',
      responseMapping: 'flow.variables.ticket_id = response.data.ticketId;',
      slaSeconds: 3,
      retryCount: 3,
      retryInterval: '5s',
      circuitBreakerTimeoutMs: 3000,
      description: 'Điều phối luồng và ghi nhận ticket sang IPCC 2.0 Core'
    });

    // 5. [🛑 End] Hoàn tất xử lý (Cổng Thành công 200)
    const end = this.createCompactCardNode('end', 960, 100, 'Hoàn tất xử lý', {
      description: 'Quy trình hoàn tất thành công',
      nodeKey: 'END_SUCCESS'
    });

    // 6. [🛑 End] Kết thúc ngoại lệ (Cổng Ngoại lệ / Lỗi - US-22, BR-INT-05)
    const errorEnd = this.createCompactCardNode('end', 960, 210, 'Kết thúc sự cố', {
      description: 'Kết thúc tiến trình tại nhánh ngoại lệ',
      nodeKey: 'END_EXCEPTION'
    });

    // 7. [🛑 End] Từ chối hồ sơ (Nhánh 2 của Condition)
    const rejectEnd = this.createCompactCardNode('end', 700, 270, 'Từ chối cước', {
      description: 'Hồ sơ khiếu nại cước không thoả mãn điều kiện tiếp nhận',
      nodeKey: 'END_REJECT'
    });

    // Connect edges
    this.graph.addEdge({
      source: { cell: trigger, port: 'out' },
      target: { cell: boTask, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: null } }
    });

    this.graph.addEdge({
      source: { cell: boTask, port: 'out' },
      target: { cell: condition, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: null } }
    });

    // Condition -> Action (Nhánh 1: Hợp lệ)
    this.graph.addEdge({
      source: { cell: condition, port: 'br-1' },
      target: { cell: action, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: null } }
    });

    // Condition -> Reject (Nhánh 2: Từ chối)
    this.graph.addEdge({
      source: { cell: condition, port: 'br-2' },
      target: { cell: rejectEnd, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: null } }
    });

    // Action (Cổng Out 1: Thành công 200) -> End Event
    this.graph.addEdge({
      source: { cell: action, port: 'out-success' },
      target: { cell: end, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: null } }
    });

    // Action (Cổng Out 2: Thất bại / Ngoại lệ) -> Exception End
    this.graph.addEdge({
      source: { cell: action, port: 'out-failure' },
      target: { cell: errorEnd, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: null } }
    });

    this.clearSelection();
    this.updateCounts();
    this.pushHistorySnapshot();
  }

  private createBlankWorkflowSample(): void {
    if (!this.graph) return;
    this.graph.clearCells();
    const trigger = this.createCompactCardNode('trigger', 80, 160, 'Tiếp nhận cước');
    this.selectNode(trigger);
    this.updateCounts();
    this.pushHistorySnapshot();
  }

  // ============================================================================
  // 3. FLOATING TOOLBAR CONTROLS
  // ============================================================================
  private pushHistorySnapshot(): void {
    if (this.isUndoRedoAction || !this.graph) return;
    const snapshot = this.graph.toJSON();
    if (this.historyStack.length >= this.MAX_STACK_SIZE) {
      this.historyStack.shift();
    }
    this.historyStack.push(snapshot);
    this.redoStack = [];
    this.updateCanUndoRedo();
  }

  public undo(): void {
    if (!this.canUndo || !this.graph) return;
    const currentSnapshot = this.graph.toJSON();
    this.redoStack.push(currentSnapshot);

    const prevSnapshot = this.historyStack.pop();
    if (prevSnapshot) {
      this.isUndoRedoAction = true;
      this.graph.fromJSON(prevSnapshot);
      this.isUndoRedoAction = false;
      this.updateCounts();
    }
    this.updateCanUndoRedo();
    this.selectedCellInfo = '↶ Đã hoàn tác (Undo)';
  }

  public redo(): void {
    if (!this.canRedo || !this.graph) return;
    const nextSnapshot = this.redoStack.pop();
    if (nextSnapshot) {
      const currentSnapshot = this.graph.toJSON();
      this.historyStack.push(currentSnapshot);

      this.isUndoRedoAction = true;
      this.graph.fromJSON(nextSnapshot);
      this.isUndoRedoAction = false;
      this.updateCounts();
    }
    this.updateCanUndoRedo();
    this.selectedCellInfo = '↷ Đã làm lại (Redo)';
  }

  private updateCanUndoRedo(): void {
    this.canUndo = this.historyStack.length > 0;
    this.canRedo = this.redoStack.length > 0;
  }

  public autoLayout(): void {
    if (!this.graph) return;
    const nodes = this.graph.getNodes();
    const edges = this.graph.getEdges();
    if (nodes.length === 0) return;

    const inDegree: Record<string, number> = {};
    const levels: Record<string, number> = {};

    nodes.forEach((n: any) => {
      inDegree[n.id] = 0;
      levels[n.id] = 0;
    });

    edges.forEach((e: any) => {
      const targetId = typeof e.target === 'object' ? (e.target as any).cell : e.target;
      if (targetId && inDegree[targetId] !== undefined) {
        inDegree[targetId]++;
      }
    });

    const queue = nodes.filter((n: any) => inDegree[n.id] === 0).map((n: any) => n.id);
    if (queue.length === 0 && nodes.length > 0) {
      queue.push(nodes[0].id);
    }

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentLevel = levels[currentId];

      edges.forEach((e: any) => {
        const sourceId = typeof e.source === 'object' ? (e.source as any).cell : e.source;
        const targetId = typeof e.target === 'object' ? (e.target as any).cell : e.target;
        if (sourceId === currentId && targetId) {
          levels[targetId] = Math.max(levels[targetId], currentLevel + 1);
          queue.push(targetId);
        }
      });
    }

    const levelGroups: Record<number, any[]> = {};
    nodes.forEach((n: any) => {
      const lvl = levels[n.id] || 0;
      if (!levelGroups[lvl]) levelGroups[lvl] = [];
      levelGroups[lvl].push(n);
    });

    const startX = 80;
    const startY = 160;
    const levelGapX = 210;
    const nodeGapY = 100;

    Object.keys(levelGroups).forEach(lvlStr => {
      const lvl = parseInt(lvlStr, 10);
      const group = levelGroups[lvl];
      const x = startX + lvl * levelGapX;

      group.forEach((node: any, idx: number) => {
        const y = startY + idx * nodeGapY;
        node.setPosition(x, y);
      });
    });

    this.graph.centerContent();
    this.selectedCellInfo = '✨ Đã tự động căn chỉnh sơ đồ (Auto Layout)!';
  }

  public zoomIn(): void {
    if (!this.graph) return;
    this.graph.zoom(0.1);
  }

  public zoomOut(): void {
    if (!this.graph) return;
    this.graph.zoom(-0.1);
  }

  public resetZoom(): void {
    if (!this.graph) return;
    this.graph.zoomTo(1);
    this.graph.centerContent();
  }

  public clearCanvas(): void {
    if (confirm('Bạn có chắc chắn muốn làm sạch toàn bộ bản vẽ?')) {
      this.graph.clearCells();
      this.selectedNode = null;
      this.selectedCell = null;
      this.isDrawerOpen = false;
      this.updateCounts();
      this.pushHistorySnapshot();
      this.selectedCellInfo = '🧹 Đã làm sạch bản vẽ!';
    }
  }

  private updateCounts(): void {
    if (!this.graph) return;
    this.nodeCount = this.graph.getNodes().length;
    this.edgeCount = this.graph.getEdges().length;
    this.hasLocalData = !!localStorage.getItem(this.STORAGE_KEY);
  }

  // ============================================================================
  // 5. GRAPH VALIDATION (BPMN 2.0 STANDARD COMPLIANCE) & DYNAMIC MODALS
  // ============================================================================
  public validateGraph(): GraphValidationResult {
    const result = validateBpmnGraph(this.graph);
    this.validationResult = result;
    return result;
  }

  public openValidationModal(result?: GraphValidationResult): void {
    const validationRes = result || this.validateGraph();
    const modal = this.modalService.create({
      nzTitle: '🛡️ Kiểm tra tính hợp lệ đồ thị (BPMN 2.0 Graph Validation)',
      nzContent: ValidationModalComponent,
      nzComponentParams: { validationResult: validationRes },
      nzWidth: 740,
      nzFooter: null
    });

    const comp = modal.getContentComponent();
    if (comp) {
      comp.revalidate.subscribe(() => {
        const updated = this.validateGraph();
        comp.validationResult = updated;
      });
      comp.focusNode.subscribe((nodeId: string) => {
        this.focusInvalidNode(nodeId);
      });
    }
  }

  public onValidateGraphClick(): void {
    this.openValidationModal();
  }

  public focusInvalidNode(nodeId?: string): void {
    if (!nodeId || !this.graph) return;
    const node = this.graph.getCellById(nodeId);
    if (node && node.isNode?.()) {
      this.selectNode(node);
      this.graph.centerCell(node);
      this.isDrawerOpen = true;
      this.bridgeService.selectNode(node, this.selectedNodeProps);
    }
  }

  public saveProcessTemplate(): void {
    if (!this.graph) return;
    const result = this.validateGraph();
    if (!result.isValid) {
      this.openValidationModal(result);
      this.selectedCellInfo = `⚠️ Chưa thể lưu: Có ${result.errors.length} lỗi vi phạm quy tắc BPMN`;
      return;
    }

    const graphData = this.graph.toJSON();
    this.templateService.saveGraphData(this.currentTemplate.code, graphData);
    this.selectedCellInfo = `💾 Đã lưu quy trình [${this.currentTemplate.code}]!`;
    alert(`Đã lưu thành công quy trình [${this.currentTemplate.code}: ${this.currentTemplate.name}]!`);
  }

  public loadGraphData(customJson?: any): void {
    if (!this.graph) return;
    try {
      if (customJson) {
        this.graph.fromJSON(customJson);
        this.graph.getEdges()?.forEach((e: any) => e.setLabels([]));
        this.graph.centerContent();
        this.updateCounts();
      }
    } catch (err) {
      console.warn('Lỗi load graph data:', err);
    }
  }

  // Dynamic Modals via NzModalService
  public openTemplateInfoModal(): void {
    this.modalService.create({
      nzTitle: '📋 Thông tin chung quy trình',
      nzContent: TemplateInfoModalComponent,
      nzComponentParams: { template: this.currentTemplate },
      nzWidth: 500,
      nzFooter: [
        {
          label: 'Đóng',
          type: 'primary',
          onClick: (inst) => inst?.closeModal()
        }
      ]
    });
  }

  public openNotifyConfigModal(): void {
    this.modalService.create({
      nzTitle: '🔔 Cấu hình thông báo quy trình',
      nzContent: NotifyConfigModalComponent,
      nzWidth: 480,
      nzFooter: [
        {
          label: 'Hủy',
          onClick: (inst) => inst?.closeModal()
        },
        {
          label: 'Lưu cấu hình',
          type: 'primary',
          onClick: (inst) => {
            inst?.closeModal();
          }
        }
      ]
    });
  }

  public openJsonPreviewModal(payload?: any): void {
    try {
      if (this.graph) {
        this.lastSavedJson = JSON.stringify(this.graph.toJSON(), null, 2);
      } else {
        this.lastSavedJson = JSON.stringify({ message: 'Graph chưa được khởi tạo' }, null, 2);
      }
    } catch (err: any) {
      this.lastSavedJson = JSON.stringify({ error: err?.message || 'Không thể serialize graph' }, null, 2);
    }

    this.modalService.create({
      nzTitle: '🐞 Debug: Graph JSON Payload (AntV X6)',
      nzContent: JsonPreviewModalComponent,
      nzComponentParams: { jsonPayload: payload || this.lastSavedJson },
      nzWidth: 720,
      nzFooter: null
    });
  }

  public toggleJsonPreview(payload?: any): void {
    this.openJsonPreviewModal(payload);
  }

  public toggleMinimap(): void {
    this.showMinimap = !this.showMinimap;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }

    // Nhấn phím Delete hoặc Backspace để xóa Node / Edge đang chọn
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (this.selectedNode || this.selectedCell) {
        event.preventDefault();
        this.deleteOrClear();
      }
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      if (event.shiftKey) {
        this.redo();
      } else {
        this.undo();
      }
      event.preventDefault();
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
      this.redo();
      event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
    if (this.graph) {
      this.graph.dispose();
    }
  }
}
