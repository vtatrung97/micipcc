import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Graph, Scroller } from '@antv/x6';
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

export type NodeType = 'trigger' | 'task' | 'action' | 'condition' | 'split' | 'merge' | 'end' | 'notification' | 'sub_process';

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
}

export interface PaletteItem {
  type: NodeType;
  gatewayType?: 'exclusive' | 'parallel' | 'inclusive';
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

/**
 * ============================================================================
 * VIETTEL CUSTOMER SERVICE WORKFLOW STUDIO
 * Giao diện thiết kế quy trình chuẩn Viettel Customer Service:
 * Header: Quay lại, Tên quy trình, Phiên bản 4 [Nháp v], Hủy, Lưu nháp, Ban hành (Đỏ)
 * Subheader Tabs: Thông tin chung | Thiết kế quy trình
 * Sidebar Thư viện bước: Tìm bước, Nhóm Điều kiện & Các bước giao việc, tác vụ, thông báo, quy trình con, kết thúc.
 * Canvas: Start circle (▶), Step cards bo góc với chấm cổng đỏ, End circle (⏹)
 * ============================================================================
 */
@Component({
  selector: 'app-graph-editor',
  templateUrl: './graph-editor.component.html',
  styleUrls: ['./graph-editor.component.scss']
})
export class GraphEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  private graph!: any;
  public activeTab: 'flow' | 'info' | 'notify' = 'flow';
  public activeSubTab: 'info' | 'design' = 'design';
  public canvasMode: 'select' | 'pan' = 'select';
  public searchQuery: string = '';
  public isPaletteCollapsed: boolean = false;

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

  // PALETTE ITEMS CHUẨN THIẾT KẾ VIETTEL CUSTOMER SERVICE
  public paletteItems: PaletteItem[] = [
    // 1. NHÓM ĐIỀU KIỆN
    {
      type: 'condition',
      gatewayType: 'exclusive',
      category: 'condition',
      typeTitle: 'Chọn một nhánh',
      defaultName: 'Tên bước quy trình',
      icon: 'diamond-x',
      label: 'Chọn một nhánh',
      badge: 'Exclusive',
      bg: '#f8fafc',
      border: '#e2e8f0',
      color: '#475569',
      tooltipText: 'Rẽ 1 nhánh duy nhất theo điều kiện thoả mãn'
    },
    {
      type: 'split',
      gatewayType: 'parallel',
      category: 'condition',
      typeTitle: 'Chạy song song',
      defaultName: 'Chạy song song',
      icon: 'diamond-plus',
      label: 'Chạy song song',
      badge: 'Parallel',
      bg: '#f8fafc',
      border: '#e2e8f0',
      color: '#475569',
      tooltipText: 'Chia luồng chạy song song các nhánh'
    },
    {
      type: 'condition',
      gatewayType: 'inclusive',
      category: 'condition',
      typeTitle: 'Chọn nhiều nhánh',
      defaultName: 'Chọn nhiều nhánh',
      icon: 'diamond-circle',
      label: 'Chọn nhiều nhánh',
      badge: 'Inclusive',
      bg: '#f8fafc',
      border: '#e2e8f0',
      color: '#475569',
      tooltipText: 'Rẽ tất cả nhánh có điều kiện thoả mãn'
    },

    // 2. NHÓM CÁC BƯỚC THÔNG THƯỜNG
    {
      type: 'task',
      category: 'general',
      typeTitle: 'Giao việc',
      defaultName: 'Giao việc',
      icon: 'user',
      label: 'Giao việc',
      badge: 'Task',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      color: '#10b981',
      tooltipText: 'Giao việc cho nhân viên / chuyên viên'
    },
    {
      type: 'action',
      category: 'general',
      typeTitle: 'Tác vụ hệ thống',
      defaultName: 'Tác vụ hệ thống',
      icon: 'code',
      label: 'Tác vụ hệ thống',
      badge: 'System',
      bg: '#eff6ff',
      border: '#bfdbfe',
      color: '#3b82f6',
      tooltipText: 'Tác vụ tự động / Gọi API dịch vụ hệ thống',
      avatarInitial: 'T',
      avatarBg: '#3b82f6'
    },
    {
      type: 'notification',
      category: 'general',
      typeTitle: 'Gửi thông báo',
      defaultName: 'Gửi thông báo',
      icon: 'bell',
      label: 'Gửi thông báo',
      badge: 'Notify',
      bg: '#fdf2f8',
      border: '#fbcfe8',
      color: '#ec4899',
      tooltipText: 'Gửi SMS / Email / Webhook / Thông báo OTT',
      avatarInitial: 'T',
      avatarBg: '#3b82f6'
    },
    {
      type: 'sub_process',
      category: 'general',
      typeTitle: 'Quy trình con',
      defaultName: 'Quy trình con',
      icon: 'subflow',
      label: 'Quy trình con',
      badge: 'SubProcess',
      bg: '#fffbeb',
      border: '#fde68a',
      color: '#d97706',
      tooltipText: 'Gọi thực thi một quy trình con khác'
    },
    {
      type: 'end',
      category: 'general',
      typeTitle: 'Kết thúc',
      defaultName: 'Kết thúc',
      icon: 'stop',
      label: 'Kết thúc',
      badge: 'End',
      bg: '#fef2f2',
      border: '#fecaca',
      color: '#ef4444',
      tooltipText: 'Kết thúc quy trình'
    }
  ];

  public get conditionPaletteItems(): PaletteItem[] {
    const q = (this.searchQuery || '').trim().toLowerCase();
    return this.paletteItems.filter(p => p.category === 'condition' && (!q || p.typeTitle.toLowerCase().includes(q) || p.tooltipText.toLowerCase().includes(q)));
  }

  public get generalPaletteItems(): PaletteItem[] {
    const q = (this.searchQuery || '').trim().toLowerCase();
    return this.paletteItems.filter(p => p.category === 'general' && (!q || p.typeTitle.toLowerCase().includes(q) || p.tooltipText.toLowerCase().includes(q)));
  }

  public currentTemplate: ProcessTemplateItem = {
    code: 'PRC_MULTI_DEPT_COMPLAINT',
    name: 'Xử lý khiếu nại đa phòng ban',
    category: 'Xử lý khiếu nại',
    owner_org_id: 'ORG_CSKH_MB',
    owner_org_name: 'Viettel Customer Service, Inc',
    version: '4',
    sla: '2h SLA',
    slaStatus: 'normal',
    status: 'Draft',
    description: 'Quy trình tiếp nhận, phối hợp và xử lý khiếu nại đa phòng ban',
    published_at: '05/10/2026 14:30',
    active_instances_count: 5
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
        type: 'dot',
        args: {
          color: '#cbd5e1',
          thickness: 1.2,
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
            padding: 20,
          },
        },
        attrs: {
          line: {
            stroke: '#94a3b8',
            strokeWidth: 1.5,
            targetMarker: {
              name: 'block',
              width: 6,
              height: 6,
              fill: '#94a3b8',
            },
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
    const templateCode = this.route.snapshot.queryParams['id'] || this.currentTemplate?.code;
    const initType = this.route.snapshot.queryParams['initType'];
    if (this.currentTemplate.graphData) {
      this.loadGraphData(this.currentTemplate.graphData);
    } else if (templateCode === 'PRC_BASIC_CSAT_FEEDBACK') {
      this.loadSampleBasicFlow();
    } else if (templateCode === 'PRC_BILLING_DISPUTE_REVERSAL') {
      this.loadSampleConditionApiFlow();
    } else if (templateCode === 'PRC_VIP_ENTERPRISE_INCIDENT') {
      this.loadSampleComplexEnterpriseFlow();
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
      trigger: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
      task: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
      action: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
      condition: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 12l10 10 10-10L12 2z"></path><line x1="9.5" y1="9.5" x2="14.5" y2="14.5"></line><line x1="14.5" y1="9.5" x2="9.5" y2="14.5"></line></svg>`,
      split: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 12l10 10 10-10L12 2z"></path><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`,
      merge: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v6a3 3 0 0 0 3 3h9"></path><path d="M6 21v-6a3 3 0 0 1 3-3"></path><polyline points="15 9 18 12 15 15"></polyline></svg>`,
      notification: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
      sub_process: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="18" r="3"></circle><path d="M9 6h3a6 6 0 0 1 6 6v3"></path><line x1="6" y1="9" x2="6" y2="15"></line></svg>`,
      end: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"></rect></svg>`
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
      notification: 'NTF',
      sub_process: 'SUB',
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

    // 1. TRIGGER BPMN EVENT: Circle 42px, subtle shadow, red inner circle with white play triangle, single out port on right
    if (type === 'trigger') {
      const portItems = getNodePortItems('trigger', customData, 42);
      const node = this.graph.addNode({
        shape: 'rect',
        x,
        y,
        width: 42,
        height: 42,
        markup: [
          { tagName: 'circle', selector: 'shadowCircle' },
          { tagName: 'circle', selector: 'body' },
          { tagName: 'circle', selector: 'innerCircle' },
          { tagName: 'polygon', selector: 'playTriangle' },
          { tagName: 'text', selector: 'nameText' }
        ],
        attrs: {
          shadowCircle: {
            cx: 21,
            cy: 21,
            r: 20,
            fill: '#ffffff',
            stroke: '#e2e8f0',
            strokeWidth: 1.5,
            cursor: 'pointer'
          },
          body: {
            cx: 21,
            cy: 21,
            r: 18,
            fill: '#ffffff',
            stroke: 'none',
            cursor: 'pointer'
          },
          innerCircle: {
            cx: 21,
            cy: 21,
            r: 12,
            fill: '#ef4444',
            stroke: 'none',
            cursor: 'pointer'
          },
          playTriangle: {
            points: '18,15 18,27 27,21',
            fill: '#ffffff',
            cursor: 'pointer'
          },
          nameText: {
            ref: 'shadowCircle',
            refX: 21,
            refY: '100%',
            refY2: 6,
            text: nodeLabel || '',
            fontSize: 11,
            fontWeight: 500,
            fill: '#475569',
            textAnchor: 'middle',
            textVerticalAnchor: 'top',
            cursor: 'pointer',
            display: nodeLabel ? 'block' : 'none'
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
        icon: '▶',
        description: customData?.description || '',
        triggerEvent: customData?.triggerEvent || 'Inbound Call (Tổng đài 1800xxxx)',
        ...customData
      };
      node.setData(initialData);
      return node;
    }

    // 2. END BPMN EVENT: Circle 42px, red ring with red stop square, single in port on left
    if (type === 'end') {
      const portItems = getNodePortItems('end', customData, 42);
      const node = this.graph.addNode({
        shape: 'rect',
        x,
        y,
        width: 42,
        height: 42,
        markup: [
          { tagName: 'circle', selector: 'shadowCircle' },
          { tagName: 'circle', selector: 'body' },
          { tagName: 'circle', selector: 'innerRing' },
          { tagName: 'rect', selector: 'centerSquare' },
          { tagName: 'text', selector: 'nameText' }
        ],
        attrs: {
          shadowCircle: {
            cx: 21,
            cy: 21,
            r: 20,
            fill: '#ffffff',
            stroke: '#e2e8f0',
            strokeWidth: 1.5,
            cursor: 'pointer'
          },
          body: {
            cx: 21,
            cy: 21,
            r: 18,
            fill: '#ffffff',
            stroke: 'none',
            cursor: 'pointer'
          },
          innerRing: {
            cx: 21,
            cy: 21,
            r: 12,
            fill: '#ffffff',
            stroke: '#ef4444',
            strokeWidth: 2,
            cursor: 'pointer'
          },
          centerSquare: {
            x: 16,
            y: 16,
            width: 10,
            height: 10,
            rx: 2,
            fill: '#ef4444',
            stroke: 'none',
            cursor: 'pointer'
          },
          nameText: {
            ref: 'shadowCircle',
            refX: 21,
            refY: '100%',
            refY2: 6,
            text: nodeLabel || '',
            fontSize: 11,
            fontWeight: 500,
            fill: '#475569',
            textAnchor: 'middle',
            textVerticalAnchor: 'top',
            cursor: 'pointer',
            display: nodeLabel ? 'block' : 'none'
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
        icon: '⏹',
        description: customData?.description || '',
        ...customData
      };
      node.setData(initialData);
      return node;
    }

    const isCondition = type === 'condition';
    const isApprovalTask = type === 'task' && !!customData?.isApprovalStep;
    const isActionException = type === 'action' && !!customData?.hasExceptionPort;

    let branches: ConditionBranch[] = isCondition
      ? (customData?.branches && customData.branches.length > 0 ? [...customData.branches] : [
        { id: 'br-1', name: 'Đủ thông tin', defaultLabel: 'Đủ thông tin', value: 'du_thong_tin', expression: '${flow.variables.du_thong_tin == true}', variableSource: 'flow.variables', isDefault: false },
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

    const cardWidth = 180;
    const nodeHeight = isCondition
      ? (44 + branches.length * 20 + 6)
      : (isApprovalTask || isActionException)
        ? 90
        : 48;

    // Dynamic SVG markup
    const markup: any[] = [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'rect', selector: 'iconBox' },
      { tagName: 'image', selector: 'iconImg' },
      { tagName: 'text', selector: 'nameText' },
      { tagName: 'circle', selector: 'warningBg' },
      { tagName: 'text', selector: 'warningText' },
      { tagName: 'text', selector: 'moreBtn' },
    ];

    // Pre-declare rowText_0 through rowText_15 for multi-row nodes
    for (let i = 0; i < 16; i++) {
      markup.push({ tagName: 'text', selector: `rowText_${i}` });
    }

    const attrs: any = {
      body: {
        refWidth: '100%',
        refHeight: '100%',
        rx: 10,
        ry: 10,
        fill: '#ffffff',
        stroke: '#e2e8f0',
        strokeWidth: 1.2,
        cursor: 'pointer',
      },
      iconBox: {
        ref: 'body',
        refX: 9,
        refY: isCondition ? 7 : 9,
        width: 30,
        height: 30,
        rx: 7,
        ry: 7,
        fill: isCondition ? '#f8fafc' : itemDef.bg,
        stroke: isCondition ? '#e2e8f0' : (itemDef.border || '#e2e8f0'),
        strokeWidth: 1,
      },
      iconImg: {
        ref: 'body',
        refX: 15,
        refY: isCondition ? 13 : 15,
        width: 18,
        height: 18,
        'xlink:href': this.getNodeSvgDataUri(type),
        href: this.getNodeSvgDataUri(type),
      },
      nameText: {
        ref: 'body',
        refX: 46,
        refY: isCondition ? 22 : 24,
        text: this.truncateLabel(nodeLabel || itemDef.typeTitle, isCondition ? 15 : 20),
        fontSize: isCondition ? 12 : 12.5,
        fontWeight: isCondition ? 600 : 500,
        fill: '#1e293b',
        textAnchor: 'start',
        textVerticalAnchor: 'middle',
      },
      warningBg: {
        ref: 'body',
        refX: cardWidth - 28,
        refY: 16,
        r: 6,
        fill: '#eab308',
        stroke: 'none',
        display: isCondition ? 'block' : 'none'
      },
      warningText: {
        ref: 'body',
        refX: cardWidth - 28,
        refY: 16,
        text: '!',
        fontSize: 9,
        fontWeight: 800,
        fill: '#ffffff',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        display: isCondition ? 'block' : 'none'
      },
      moreBtn: {
        ref: 'body',
        refX: cardWidth - 14,
        refY: isCondition ? 16 : 24,
        text: '⋮',
        fontSize: 16,
        fontWeight: 700,
        fill: '#94a3b8',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        cursor: 'pointer'
      }
    };

    for (let i = 0; i < 16; i++) {
      if (isCondition) {
        if (i < branches.length) {
          const br = branches[i];
          const displayText = br.name || br.defaultLabel || (br.isDefault ? 'Mặc định' : `Nhánh ${i + 1}`);
          attrs[`rowText_${i}`] = {
            ref: 'body',
            refX: cardWidth - 14,
            refY: 48 + i * 20,
            text: this.truncateLabel(displayText, 18),
            fontSize: 11,
            fontWeight: 400,
            fill: '#64748b',
            textAnchor: 'end',
            textVerticalAnchor: 'middle',
            display: 'block'
          };
        } else {
          attrs[`rowText_${i}`] = {
            ref: 'body', refX: 14, refY: 48 + i * 20,
            fontSize: 11, fontWeight: 400, fill: '#64748b',
            textAnchor: 'start', textVerticalAnchor: 'middle', display: 'none'
          };
        }
      } else if (isActionException) {
        if (i === 0) {
          attrs[`rowText_${i}`] = {
            ref: 'body', refX: cardWidth - 14, refY: 60, text: 'Thành công',
            fontSize: 11, fontWeight: 400, fill: '#64748b',
            textAnchor: 'end', textVerticalAnchor: 'middle', display: 'block'
          };
        } else if (i === 1) {
          attrs[`rowText_${i}`] = {
            ref: 'body', refX: cardWidth - 14, refY: 82, text: 'Thất bại',
            fontSize: 11, fontWeight: 400, fill: '#64748b',
            textAnchor: 'end', textVerticalAnchor: 'middle', display: 'block'
          };
        } else {
          attrs[`rowText_${i}`] = {
            ref: 'body', refX: 14, refY: 60 + i * 22,
            fontSize: 11, fontWeight: 400, fill: '#475569',
            textAnchor: 'start', textVerticalAnchor: 'middle', display: 'none'
          };
        }
      } else {
        attrs[`rowText_${i}`] = {
          ref: 'body', refX: 14, refY: 60 + i * 22,
          fontSize: 11, fontWeight: 400, fill: '#475569',
          textAnchor: 'start', textVerticalAnchor: 'middle', display: 'none'
        };
      }
    }

    const portItems = getNodePortItems(
      type,
      { ...customData, branches, isApprovalStep: isApprovalTask, hasExceptionPort: isActionException },
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
      gatewayType: data.gatewayType || (data.type === 'split' ? 'parallel' : (itemDef.gatewayType || 'exclusive')),
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
      integratedSystem: data.integratedSystem || '',
      selectedApi: data.selectedApi || '',
      timeoutSeconds: data.timeoutSeconds !== undefined ? data.timeoutSeconds : 0,
      apiOutput: data.apiOutput || '',

      // Condition fields
      branches: data.branches && data.branches.length > 0 ? JSON.parse(JSON.stringify(data.branches)) : ((data.type === 'condition' || data.type === 'split') ? [
        { id: 'br-1', name: 'Đủ thông tin', value: 'valid', expression: '.priority == "Cao"', rules: [{ param: '.priority', operator: 'Bằng (=)', value: 'Cao' }] },
        { id: 'br-default', name: 'Mặc định', value: 'default', expression: 'default', isDefault: true, rules: [] }
      ] : undefined),
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
      subProcessWaitComplete: data.subProcessWaitComplete !== undefined ? data.subProcessWaitComplete : true,
      subProcessInputMapping: data.subProcessInputMapping || ''
    };

    this.selectedCellInfo = `[${this.selectedNodeProps.label}] ${this.selectedNodeProps.typeTitle}`;
    this.bridgeService.selectNode(node, this.selectedNodeProps);

    // Highlight selected node with rose/red outline (as in Figma screenshot)
    if (this.graph) {
      this.graph.getNodes().forEach((n: any) => {
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
    if (this.graph) {
      this.graph.getNodes().forEach((n: any) => {
        n.attr('body/stroke', '#e4e4e7');
        n.attr('body/strokeWidth', 1);
      });
    }
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
  // WORKFLOW SAMPLE CHUẨN (KHỚP 100% THIẾT KẾ VIETTEL TRONG ẢNH CHỤP)
  // ▶ -> [◇ Tên bước quy trình] -> (Đủ thông tin -> </> Trả lời sơ bộ) & (Mặc định -> 👤 Bổ sung thông tin)
  //   -> ⤹ Tất cả nhánh đến -> 👤 Xác minh khiếu nại -> </> Cập nhật & đóng PAKN -> ⏹
  // ============================================================================
  private createCompactWorkflowSample(): void {
    if (!this.graph) return;
    this.graph.clearCells();

    // 1. [Start] (trigger)
    const trigger = this.createCompactCardNode('trigger', 40, 185, '');

    // 2. [Condition] Tên bước quy trình
    const condition = this.createCompactCardNode('condition', 150, 155, 'Tên bước quy trình', {
      nodeKey: 'CND_BRANCH_CHECK',
      description: 'Phân nhánh xử lý theo điều kiện đầy đủ thông tin hay mặc định',
      branches: [
        { id: 'br-info', name: 'Đủ thông tin', value: 'du_thong_tin', expression: '${flow.variables.du_thong_tin == true}', isDefault: false },
        { id: 'br-default', name: 'Mặc định', value: 'default', expression: 'default', isDefault: true }
      ]
    });

    // 3. [Action] Trả lời sơ bộ
    const traLoiSoBo = this.createCompactCardNode('action', 390, 115, 'Trả lời sơ bộ', {
      nodeKey: 'ACT_PRELIMINARY_REPLY',
      description: 'Hệ thống gửi tin nhắn/phản hồi sơ bộ cho khách hàng'
    });

    // 4. [Task] Bổ sung thông tin
    const boSungThongTin = this.createCompactCardNode('task', 390, 215, 'Bổ sung thông tin', {
      nodeKey: 'TSK_SUPPLEMENT_INFO',
      description: 'Yêu cầu khách hàng hoặc điện thoại viên bổ sung thêm thông tin khiếu nại'
    });

    // 5. [Merge] Tất cả nhánh đến
    const tatCaNhanhDen = this.createCompactCardNode('merge', 620, 165, 'Tất cả nhánh đến', {
      nodeKey: 'MRG_JOIN_BRANCHES',
      description: 'Gom và đồng bộ kết quả từ các nhánh xử lý'
    });

    // 6. [Task] Xác minh khiếu nại
    const xacMinhKhieuNai = this.createCompactCardNode('task', 840, 165, 'Xác minh khiếu nại', {
      nodeKey: 'TSK_VERIFY_COMPLAINT',
      description: 'Chuyên viên tiến hành xác minh thông tin khiếu nại của khách hàng'
    });

    // 7. [Action] Cập nhật & đóng PAKN
    const capNhatDong = this.createCompactCardNode('action', 1060, 165, 'Cập nhật & đóng PAKN', {
      nodeKey: 'ACT_UPDATE_CLOSE_PAKN',
      description: 'Cập nhật trạng thái xử lý và đóng phản ánh khiếu nại trên hệ thống'
    });

    // 8. [End]
    const end = this.createCompactCardNode('end', 1290, 168, '');

    // Edge 1: trigger -> condition
    this.graph.addEdge({
      source: { cell: trigger, port: 'out' },
      target: { cell: condition, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } }
    });

    // Edge 2: condition (br-info) -> Trả lời sơ bộ
    this.graph.addEdge({
      source: { cell: condition, port: 'br-info' },
      target: { cell: traLoiSoBo, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } }
    });

    // Edge 3: condition (br-default) -> Bổ sung thông tin
    this.graph.addEdge({
      source: { cell: condition, port: 'br-default' },
      target: { cell: boSungThongTin, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } }
    });

    // Edge 4: Trả lời sơ bộ -> Tất cả nhánh đến
    this.graph.addEdge({
      source: { cell: traLoiSoBo, port: 'out' },
      target: { cell: tatCaNhanhDen, port: 'in-merge-0' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } }
    });

    // Edge 5: Bổ sung thông tin -> Tất cả nhánh đến
    this.graph.addEdge({
      source: { cell: boSungThongTin, port: 'out' },
      target: { cell: tatCaNhanhDen, port: 'in-merge-1' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } }
    });

    // Edge 6: Tất cả nhánh đến -> Xác minh khiếu nại
    this.graph.addEdge({
      source: { cell: tatCaNhanhDen, port: 'out' },
      target: { cell: xacMinhKhieuNai, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } }
    });

    // Edge 7: Xác minh khiếu nại -> Cập nhật & đóng PAKN
    this.graph.addEdge({
      source: { cell: xacMinhKhieuNai, port: 'out' },
      target: { cell: capNhatDong, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } }
    });

    // Edge 8: Cập nhật & đóng PAKN -> End
    this.graph.addEdge({
      source: { cell: capNhatDong, port: 'out' },
      target: { cell: end, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } }
    });

    this.clearSelection();
    this.updateCounts();
    this.pushHistorySnapshot();
  }

  public cancelEdit(): void {
    this.router.navigate(['/process/templates-list']);
  }

  public setSubTab(tab: 'info' | 'design'): void {
    this.activeSubTab = tab;
    if (tab === 'info') {
      this.openTemplateInfoModal();
    }
  }

  public togglePaletteCollapse(): void {
    this.isPaletteCollapsed = !this.isPaletteCollapsed;
  }

  public setCanvasMode(mode: 'select' | 'pan'): void {
    this.canvasMode = mode;
    if (!this.graph) return;
    if (mode === 'pan') {
      this.graph.enablePanning();
    } else {
      this.graph.disablePanning();
    }
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
  // CÁC MẪU QUY TRÌNH CHUẨN DOANH NGHIỆP TỪ JSON BACKEND SPECIFICATION
  // ============================================================================

  /**
   * MẪU 1: LUỒNG CƠ BẢN (LINEAR BASIC FLOW)
   * Tiếp nhận & Phản hồi Ý kiến CSAT (Trigger -> Task -> Notification -> End)
   */
  public loadSampleBasicFlow(): void {
    if (!this.graph) return;
    this.graph.clearCells();

    this.currentTemplate = {
      code: 'PRC_BASIC_CSAT_FEEDBACK',
      name: 'Quy trình tiếp nhận và ghi nhận ý kiến đóng góp khách hàng (CSAT)',
      category: 'Khảo sát CSAT',
      version: 'V1.0',
      owner_org_id: 'ORG_CSKH_MB',
      owner_org_name: 'TT CSKH Miền Bắc',
      sla: '1h SLA',
      slaStatus: 'normal',
      status: 'Published',
      description: 'Tiếp nhận ý kiến phản hồi từ cổng thông tin, tổng đài viên ghi nhận và tự động gửi SMS cảm ơn'
    };

    // 1. Trigger
    const trigger = this.createCompactCardNode('trigger', 60, 185, 'Bắt đầu tiếp nhận', {
      nodeKey: 'TRG_CSAT_01',
      triggerType: 'Webhook',
      triggerEvent: 'Portal CSAT Feedback Submitted',
      triggerFormSchedule: 'Tức thời (Real-time)',
      description: 'Nhận payload JSON từ Web portal hoặc My Viettel app'
    });

    // 2. Task
    const task = this.createCompactCardNode('task', 230, 165, 'Giao việc phân loại', {
      nodeKey: 'TSK_CSAT_REVIEW',
      department: 'TT CSKH Miền Bắc',
      team: 'Nhóm Chăm sóc khách hàng',
      agent: 'Điện thoại viên (FO/BO)',
      assignee: 'Điện thoại viên (FO/BO)',
      sla: '30 phút',
      slaWarning: true,
      formTemplate: 'FORM_CSAT_FEEDBACK_V1',
      formOutput: 'output_csat_classification',
      description: 'Kiểm tra nội dung góp ý, gắn tag phân loại chủ đề'
    });

    // 3. Notification
    const notif = this.createCompactCardNode('notification', 500, 165, 'Gửi SMS cảm ơn', {
      nodeKey: 'NTF_CSAT_THANKYOU',
      notificationChannel: 'SMS',
      channelNotification: true,
      notificationRecipient: '${flow.variables.customer_phone}',
      notificationTitle: 'Viettel CSKH - Cảm ơn quý khách',
      notificationContent: 'Viettel chân thành cảm ơn ý kiến đóng góp của Quý khách. Chúc Quý khách một ngày tốt lành!',
      description: 'Gửi tin nhắn Brandname VIETTEL đến số thuê bao phản ánh'
    });

    // 4. End
    const end = this.createCompactCardNode('end', 770, 185, 'Kết thúc', {
      nodeKey: 'END_CSAT_01',
      description: 'Đóng luồng và lưu vết lịch sử instance'
    });

    // Edges
    this.graph.addEdge({
      source: { cell: trigger, port: 'out' },
      target: { cell: task, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } }
    });
    this.graph.addEdge({
      source: { cell: task, port: 'out' },
      target: { cell: notif, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } }
    });
    this.graph.addEdge({
      source: { cell: notif, port: 'out' },
      target: { cell: end, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } }
    });

    this.clearSelection();
    this.graph.centerContent();
    this.updateCounts();
    this.pushHistorySnapshot();
    this.selectedCellInfo = '✨ Đã tải [Mẫu 1: Luồng cơ bản CSAT]!';
  }

  /**
   * MẪU 2: LUỒNG TRUNG BÌNH (EXCLUSIVE GATEWAY + ACTION API)
   * Xử lý Khiếu nại Cước & Tự động Hoàn cước viễn thông
   */
  public loadSampleConditionApiFlow(): void {
    if (!this.graph) return;
    this.graph.clearCells();

    this.currentTemplate = {
      code: 'PRC_BILLING_DISPUTE_REVERSAL',
      name: 'Quy trình xử lý khiếu nại cước & Tự động hoàn cước viễn thông',
      category: 'Xử lý khiếu nại',
      version: 'V2.0',
      owner_org_id: 'ORG_BILLING',
      owner_org_name: 'Trung tâm Đối soát & Tính cước',
      sla: '2h SLA',
      slaStatus: 'normal',
      status: 'Published',
      description: 'Tiếp nhận khiếu nại cước: Dưới 200k tự động hoàn cước qua API Core; Trên 200k chuyển Trưởng ca phê duyệt'
    };

    // 1. Trigger
    const trigger = this.createCompactCardNode('trigger', 40, 205, 'Tiếp nhận khiếu nại', {
      nodeKey: 'TRG_BILLING_01',
      triggerType: 'Inbound Call',
      triggerEvent: 'Customer Call via Hotline 18008098'
    });

    // 2. Task Tra cứu
    const taskCheck = this.createCompactCardNode('task', 160, 185, 'Tra cứu chi tiết cước', {
      nodeKey: 'TSK_CHECK_CDR',
      department: 'Trung tâm Đối soát & Tính cước',
      team: 'Tổ Xử lý khiếu nại cước',
      agent: 'Điện thoại viên (FO/BO)',
      sla: '45 phút',
      formTemplate: 'FORM_CDR_VERIFY_V2',
      formOutput: 'output_verified_amount'
    });

    // 3. Condition (Chọn một nhánh)
    const condition = this.createCompactCardNode('condition', 400, 160, 'Kiểm tra hạn mức cước', {
      nodeKey: 'CND_AMOUNT_CHECK',
      gatewayType: 'exclusive',
      conditionVariable: 'flow.variables.dispute_amount',
      branches: [
        { id: 'br-auto', name: 'Cước <= 200k (Tự động)', value: 'LE_200K', expression: 'flow.variables.dispute_amount <= 200000', isDefault: false },
        { id: 'br-manual', name: 'Mặc định (> 200k)', value: 'GT_200K', expression: 'default', isDefault: true }
      ]
    });

    // 4. Action Hoàn cước API
    const actRefund = this.createCompactCardNode('action', 670, 95, 'Tác vụ hoàn cước API', {
      nodeKey: 'ACT_CORE_REFUND',
      actionSource: 'custom',
      integratedSystem: 'BILLING_CORE_BSS',
      selectedApi: 'POST /api/v2/invoices/reverse-charge',
      actionMethod: 'POST',
      actionEndpoint: 'https://billing-core.viettel.vn/api/v2/invoices/reverse-charge',
      timeoutSeconds: 5,
      retryCount: 3,
      hasExceptionPort: true
    });

    // 5. Task Trưởng ca duyệt (Approval)
    const taskApprove = this.createCompactCardNode('task', 670, 240, 'Trưởng ca duyệt hoàn cước', {
      nodeKey: 'TSK_LEADER_APPROVE',
      department: 'TT CSKH Miền Bắc',
      team: 'Ban Giám đốc / Trưởng ca',
      agent: 'Trưởng ca trực',
      isApprovalStep: true,
      sla: '1h SLA'
    });

    // 6. Notification SMS
    const notif = this.createCompactCardNode('notification', 930, 95, 'SMS thông báo kết quả', {
      nodeKey: 'NTF_REFUND_SUCCESS',
      notificationChannel: 'SMS',
      notificationRecipient: '${flow.variables.customer_phone}',
      notificationTitle: 'Viettel - Kết quả đối soát cước'
    });

    // 7. End thành công
    const endSuccess = this.createCompactCardNode('end', 1190, 115, 'Hoàn tất thành công', {
      nodeKey: 'END_BILLING_SUCCESS'
    });

    // 8. End lỗi
    const endError = this.createCompactCardNode('end', 930, 260, 'Kết thúc lỗi ngoại lệ', {
      nodeKey: 'END_BILLING_ERROR'
    });

    // Edges
    this.graph.addEdge({
      source: { cell: trigger, port: 'out' },
      target: { cell: taskCheck, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } }
    });
    this.graph.addEdge({
      source: { cell: taskCheck, port: 'out' },
      target: { cell: condition, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } }
    });
    this.graph.addEdge({
      source: { cell: condition, port: 'br-auto' },
      target: { cell: actRefund, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } }
    });
    this.graph.addEdge({
      source: { cell: condition, port: 'br-manual' },
      target: { cell: taskApprove, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } }
    });
    this.graph.addEdge({
      source: { cell: taskApprove, port: 'out-approve' },
      target: { cell: actRefund, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } }
    });
    this.graph.addEdge({
      source: { cell: taskApprove, port: 'out-reject' },
      target: { cell: endError, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } }
    });
    this.graph.addEdge({
      source: { cell: actRefund, port: 'out-success' },
      target: { cell: notif, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } }
    });
    this.graph.addEdge({
      source: { cell: actRefund, port: 'out-fail' },
      target: { cell: endError, port: 'in' },
      attrs: { line: { stroke: '#ef4444', strokeWidth: 1.5, strokeDasharray: 4, targetMarker: { name: 'block', width: 6, height: 6, fill: '#ef4444' } } }
    });
    this.graph.addEdge({
      source: { cell: notif, port: 'out' },
      target: { cell: endSuccess, port: 'in' },
      attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } }
    });

    this.clearSelection();
    this.graph.centerContent();
    this.updateCounts();
    this.pushHistorySnapshot();
    this.selectedCellInfo = '✨ Đã tải [Mẫu 2: Luồng điều kiện & API cước]!';
  }

  /**
   * MẪU 3: LUỒNG PHỨC TẠP ENTERPRISE (PARALLEL SPLIT/JOIN, SUBPROCESS, MULTI-CHANNEL)
   * Điều hành xử lý sự cố hạ tầng & Kênh truyền số liệu VIP
   */
  public loadSampleComplexEnterpriseFlow(): void {
    if (!this.graph) return;
    this.graph.clearCells();

    this.currentTemplate = {
      code: 'PRC_VIP_ENTERPRISE_INCIDENT',
      name: 'Quy trình điều hành xử lý sự cố hạ tầng & Kênh truyền số liệu KHDN VIP',
      category: 'Cảnh báo chỉ số',
      version: 'V4.0',
      owner_org_id: 'ORG_KT_BROADBAND',
      owner_org_name: 'Phòng Kỹ thuật Broadband',
      sla: '2h SLA',
      slaStatus: 'warning',
      status: 'Published',
      description: 'Xử lý sự cố kênh truyền VIP: Chạy song song luồng kỹ thuật đo kiểm (SubProcess) và CSKH KAM đa kênh SMS/Email, hội tụ đóng ticket tự động'
    };

    // 1. Trigger
    const trigger = this.createCompactCardNode('trigger', 40, 195, 'Cảnh báo NMS Kênh truyền', {
      nodeKey: 'TRG_NMS_ALARM',
      triggerType: 'Hệ thống giám sát NMS'
    });

    // 2. Task
    const taskTriage = this.createCompactCardNode('task', 150, 175, 'Điều phối & Phân loại cấp 1', {
      nodeKey: 'TSK_INCIDENT_TRIAGE',
      department: 'Phòng Kỹ thuật Broadband',
      team: 'Tổ Điều hành mạng NOC',
      sla: '15 phút'
    });

    // 3. Parallel Split
    const split = this.createCompactCardNode('split', 370, 150, 'Chạy song song 2 luồng', {
      nodeKey: 'SPL_PARALLEL_DISPATCH',
      gatewayType: 'parallel',
      branches: [
        { id: 'br-tech', name: 'Nhánh Kỹ thuật hạ tầng', expression: 'true', isDefault: false },
        { id: 'br-kam', name: 'Nhánh Chăm sóc KH VIP', expression: 'true', isDefault: true }
      ]
    });

    // 4. SubProcess
    const subProcess = this.createCompactCardNode('sub_process', 610, 95, 'Quy trình con: Kỹ thuật trạm', {
      nodeKey: 'SUB_NETWORK_DIAGNOSIS',
      subProcessTemplateId: 'PRC_BTS_SITE_MAINTENANCE',
      subProcessVersion: 'V2.3',
      subProcessWaitComplete: true
    });

    // 5. Task KAM
    const taskKam = this.createCompactCardNode('task', 610, 245, 'Quản lý KH VIP liên hệ', {
      nodeKey: 'TSK_KAM_SUPPORT',
      department: 'Phòng Kinh doanh & Telesales',
      team: 'Bộ phận Quản lý Khách hàng Lớn (KAM)',
      sla: '20 phút'
    });

    // 6. Notification VIP
    const notifVip = this.createCompactCardNode('notification', 840, 245, 'Gửi SMS & Email cam kết SLA', {
      nodeKey: 'NTF_VIP_SLA_COMMIT',
      notificationChannel: 'SMS, Email',
      channelNotification: true,
      channelEmail: true
    });

    // 7. Join Parallel (Sử dụng merge)
    const joinNode = this.createCompactCardNode('merge', 1080, 175, 'Hội tụ đồng bộ 2 luồng', {
      nodeKey: 'JON_PARALLEL_SYNC'
    });

    // 8. Action CRM
    const actCrm = this.createCompactCardNode('action', 1280, 175, 'Đóng ticket trên CRM BSS', {
      nodeKey: 'ACT_CLOSE_TICKET_CRM',
      integratedSystem: 'VIETTEL_CRM_ENTERPRISE',
      actionMethod: 'PUT'
    });

    // 9. Notification Handover
    const notifReport = this.createCompactCardNode('notification', 1500, 175, 'Email biên bản nghiệm thu', {
      nodeKey: 'NTF_HANDOVER_REPORT',
      notificationChannel: 'Email',
      channelEmail: true
    });

    // 10. End
    const end = this.createCompactCardNode('end', 1730, 195, 'Hoàn tất sự cố VIP', {
      nodeKey: 'END_VIP_INCIDENT'
    });

    // Edges
    this.graph.addEdge({ source: { cell: trigger, port: 'out' }, target: { cell: taskTriage, port: 'in' }, attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } } });
    this.graph.addEdge({ source: { cell: taskTriage, port: 'out' }, target: { cell: split, port: 'in' }, attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } } });
    this.graph.addEdge({ source: { cell: split, port: 'br-tech' }, target: { cell: subProcess, port: 'in' }, attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } } });
    this.graph.addEdge({ source: { cell: split, port: 'br-kam' }, target: { cell: taskKam, port: 'in' }, attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } } });
    this.graph.addEdge({ source: { cell: taskKam, port: 'out' }, target: { cell: notifVip, port: 'in' }, attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } } });
    this.graph.addEdge({ source: { cell: subProcess, port: 'out' }, target: { cell: joinNode, port: 'in-merge-0' }, attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } } });
    this.graph.addEdge({ source: { cell: notifVip, port: 'out' }, target: { cell: joinNode, port: 'in-merge-1' }, attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } } });
    this.graph.addEdge({ source: { cell: joinNode, port: 'out' }, target: { cell: actCrm, port: 'in' }, attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } } });
    this.graph.addEdge({ source: { cell: actCrm, port: 'out' }, target: { cell: notifReport, port: 'in' }, attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } } });
    this.graph.addEdge({ source: { cell: notifReport, port: 'out' }, target: { cell: end, port: 'in' }, attrs: { line: { stroke: '#94a3b8', strokeWidth: 1.5, targetMarker: { name: 'block', width: 6, height: 6, fill: '#94a3b8' } } } });

    this.clearSelection();
    this.graph.centerContent();
    this.updateCounts();
    this.pushHistorySnapshot();
    this.selectedCellInfo = '✨ Đã tải [Mẫu 3: Luồng phức tạp Song song/VIP]!';
  }

  public loadSampleFlow(type: 'basic' | 'medium' | 'complex' | 'default'): void {
    if (type === 'basic') this.loadSampleBasicFlow();
    else if (type === 'medium') this.loadSampleConditionApiFlow();
    else if (type === 'complex') this.loadSampleComplexEnterpriseFlow();
    else this.createCompactWorkflowSample();
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
    this.selectedCellInfo = `💾 Đã xuất bản quy trình [${this.currentTemplate.code}]!`;
    alert(`Đã lưu và xuất bản thành công quy trình [${this.currentTemplate.code}: ${this.currentTemplate.name}]!`);
  }

  public saveDraft(): void {
    if (!this.graph) return;
    const graphData = this.graph.toJSON();
    this.templateService.saveGraphData(this.currentTemplate.code, graphData);
    this.selectedCellInfo = `💾 Đã lưu nháp quy trình [${this.currentTemplate.code}]!`;
    alert(`Đã lưu nháp thành công quy trình [${this.currentTemplate.name}]!`);
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

  /**
   * Tạo toàn bộ file Map quy trình chuẩn Backend Specification (cả Metadata, ExecutionGraph, và GraphData)
   */
  public generateFullBackendPayload(): any {
    if (!this.graph) return { message: 'Graph chưa được khởi tạo' };

    const rawGraphJson = this.graph.toJSON();
    const nodes = this.graph.getNodes() || [];
    const edges = this.graph.getEdges() || [];

    // 1. Metadata template
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const templateMeta = {
      code: this.currentTemplate?.code || 'PRC_CUSTOM_FLOW',
      name: this.currentTemplate?.name || 'Quy trình xử lý nghiệp vụ',
      category: this.currentTemplate?.category || 'Xử lý khiếu nại',
      version: this.currentTemplate?.version || 'V1.0',
      owner_org_id: this.currentTemplate?.owner_org_id || 'ORG_CSKH_MB',
      owner_org_name: this.currentTemplate?.owner_org_name || 'TT CSKH Miền Bắc',
      sla: this.currentTemplate?.sla || '2h SLA',
      slaStatus: this.currentTemplate?.slaStatus || 'normal',
      status: this.currentTemplate?.status || 'Draft',
      description: this.currentTemplate?.description || '',
      published_at: this.currentTemplate?.published_at || formattedDate,
      updatedAt: formattedDate
    };

    // 2. Nodes map for execution graph
    const entryNodes: string[] = [];
    const exitNodes: string[] = [];
    const executionNodes: any[] = [];

    nodes.forEach((node: any) => {
      const data = node.getData() || {};
      const type = data.type || 'task';
      const nodeKey = data.nodeKey || this.generateNodeKey(type, data.label);
      const label = data.label || node.attr('nameText/text') || node.attr('label/text') || type;

      if (type === 'trigger') {
        entryNodes.push(nodeKey);
      } else if (type === 'end') {
        exitNodes.push(nodeKey);
      }

      // Trích xuất cấu hình chi tiết của từng bước (Clean config for BE)
      const config: any = {
        description: data.description || ''
      };

      if (type === 'trigger') {
        config.triggerType = data.triggerType || 'Webhook';
        config.triggerEvent = data.triggerEvent || 'Event Received';
        config.triggerFormSchedule = data.triggerFormSchedule || 'Tức thời (Real-time)';
        config.sla = data.sla || '5 phút';
      } else if (type === 'task') {
        config.department = data.department || '';
        config.team = data.team || '';
        config.agent = data.agent || '';
        config.assignee = data.assignee || 'Điện thoại viên (FO/BO)';
        config.sla = data.sla || '30 phút';
        config.slaWarning = !!data.slaWarning;
        config.isApprovalStep = !!data.isApprovalStep;
        config.formTemplate = data.formTemplate || '';
        config.formOutput = data.formOutput || '';
      } else if (type === 'condition' || type === 'split') {
        config.gatewayType = data.gatewayType || (type === 'split' ? 'parallel' : 'exclusive');
        config.conditionVariable = data.conditionVariable || '';
        config.logicOperator = data.logicOperator || 'AND';
        config.branches = data.branches || [];
        config.defaultFlowOutput = data.defaultFlowOutput || '';
        config.errorFlowOutput = data.errorFlowOutput || '';
      } else if (type === 'action') {
        config.actionSource = data.actionSource || 'custom';
        config.integratedSystem = data.integratedSystem || '';
        config.selectedApi = data.selectedApi || '';
        config.actionMethod = data.actionMethod || 'POST';
        config.actionEndpoint = data.actionEndpoint || '';
        config.timeoutSeconds = data.timeoutSeconds || 5;
        config.retryCount = data.retryCount || 3;
        config.retryInterval = data.retryInterval || '2s';
        config.circuitBreakerTimeoutMs = data.circuitBreakerTimeoutMs || 5000;
        config.requestBodyMapping = data.requestBodyMapping || '';
        config.responseMapping = data.responseMapping || '';
        config.apiOutput = data.apiOutput || '';
      } else if (type === 'notification') {
        config.notificationChannel = data.notificationChannel || 'SMS';
        config.channelNotification = !!data.channelNotification;
        config.channelEmail = !!data.channelEmail;
        config.notificationRecipient = data.notificationRecipient || '';
        config.notificationTitle = data.notificationTitle || '';
        config.notificationContent = data.notificationContent || '';
      } else if (type === 'sub_process') {
        config.subProcessTemplateId = data.subProcessTemplateId || '';
        config.subProcessVersion = data.subProcessVersion || 'LATEST';
        config.subProcessWaitComplete = data.subProcessWaitComplete !== false;
        config.subProcessInputMapping = data.subProcessInputMapping || '';
      } else if (type === 'end') {
        config.endFormTemplate = data.endFormTemplate || '';
      }

      executionNodes.push({
        id: node.id,
        nodeKey,
        type,
        gatewayType: data.gatewayType,
        label,
        category: (type === 'condition' || type === 'split' || type === 'merge') ? 'condition' : 'general',
        config
      });
    });

    // 3. Transitions map for execution graph
    const executionTransitions: any[] = [];
    edges.forEach((edge: any, index: number) => {
      const sourceCell = edge.getSourceCell();
      const targetCell = edge.getTargetCell();
      const sourcePort = edge.getSourcePortId?.() || edge.getSource()?.port;
      const targetPort = edge.getTargetPortId?.() || edge.getTarget()?.port;

      const sourceData = sourceCell?.getData() || {};
      const targetData = targetCell?.getData() || {};

      const fromNodeKey = sourceData.nodeKey || sourceCell?.id || 'UNKNOWN';
      const toNodeKey = targetData.nodeKey || targetCell?.id || 'UNKNOWN';

      let transType = 'sequence';
      let branchId: string | undefined = undefined;
      let conditionExpression: string | undefined = undefined;

      if (sourceData.type === 'condition') {
        transType = 'condition_branch';
        branchId = sourcePort;
        const matchedBranch = (sourceData.branches || []).find((b: any) => b.id === sourcePort || (b.isDefault && sourcePort === 'br-default'));
        if (matchedBranch) {
          conditionExpression = matchedBranch.expression || matchedBranch.value;
        }
      } else if (sourceData.type === 'split') {
        transType = 'parallel_branch';
        branchId = sourcePort;
      } else if (targetData.type === 'merge') {
        transType = 'parallel_join';
      } else if (sourcePort === 'out-fail' || sourcePort === 'error') {
        transType = 'error_flow';
      }

      executionTransitions.push({
        id: edge.id || `trans_${index + 1}`,
        fromNode: fromNodeKey,
        toNode: toNodeKey,
        fromPort: sourcePort,
        toPort: targetPort,
        type: transType,
        branchId,
        conditionExpression
      });
    });

    return {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "_comment": "IPCC 2.0 VIETTEL CUSTOMER SERVICE - FULL WORKFLOW BACKEND PAYLOAD",
      "template": templateMeta,
      "executionGraph": {
        "engineVersion": "BPMN_2.0_JSON",
        "totalNodes": executionNodes.length,
        "totalTransitions": executionTransitions.length,
        "entryNodeId": entryNodes[0] || '',
        "entryNodeIds": entryNodes,
        "exitNodeIds": exitNodes,
        "nodes": executionNodes,
        "transitions": executionTransitions
      },
      "graphData": rawGraphJson
    };
  }

  public openJsonPreviewModal(payload?: any): void {
    try {
      const fullMap = payload || this.generateFullBackendPayload();
      this.lastSavedJson = JSON.stringify(fullMap, null, 2);
    } catch (err: any) {
      this.lastSavedJson = JSON.stringify({ error: err?.message || 'Không thể serialize graph' }, null, 2);
    }

    this.modalService.create({
      nzTitle: '🐞 Debug: Toàn bộ File Map Quy trình (Backend Payload Specification)',
      nzContent: JsonPreviewModalComponent,
      nzComponentParams: { jsonPayload: this.lastSavedJson },
      nzWidth: 840,
      nzFooter: null
    });
  }

  public toggleJsonPreview(payload?: any): void {
    this.openJsonPreviewModal(payload);
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
