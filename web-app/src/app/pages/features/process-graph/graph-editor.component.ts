import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {
  TemplateService,
  ProcessTemplateItem,
} from '@core/services/template.service';
import { NodeType, isGatewayType } from './models/node-type';
import { PaletteItem } from './models/node-property.model';
import { PALETTE_ITEMS } from './config/palette.config';
import { GraphEditorStore } from './state/graph-editor.store';
import { GraphBridgeService } from './services/graph-bridge.service';
import { GraphCanvasService } from './services/graph-canvas.service';
import { NodeFactoryService } from './services/node-factory.service';
import { NodeEditorService } from './services/node-editor.service';
import { GatewayJoinService } from './services/gateway-join.service';
import { GraphHistoryService } from './services/graph-history.service';
import { GraphLayoutService } from './services/graph-layout.service';
import { SampleFlowService } from './services/sample-flow.service';
import { FlowPersistenceService } from './services/flow-persistence.service';
import { GraphDialogService } from './services/graph-dialog.service';

// Giữ đường import cũ cho drawer / component con: `import { NodePropertyModel } from '../graph-editor.component'`
export * from './models/node-property.model';
export type { NodeType } from './models/node-type';

/**
 * Màn Canvas Builder. Component chỉ điều phối: nhận sự kiện từ template / drawer / router
 * và gọi service theo nghiệp vụ. State dùng chung nằm ở GraphEditorStore.
 * Cấu trúc chi tiết xem README.md cùng thư mục.
 */
@Component({
  selector: 'app-graph-editor',
  templateUrl: './graph-editor.component.html',
  styleUrls: ['./graph-editor.component.scss'],
  // Mỗi lần mở màn hình có 1 bộ state + service riêng
  providers: [
    GraphEditorStore,
    GraphCanvasService,
    NodeFactoryService,
    NodeEditorService,
    GatewayJoinService,
    GraphHistoryService,
    GraphLayoutService,
    SampleFlowService,
    FlowPersistenceService,
    GraphDialogService,
  ],
})
export class GraphEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true })
  containerRef!: ElementRef<HTMLDivElement>;

  // State riêng của giao diện màn hình
  public activeTab: 'flow' | 'info' | 'notify' = 'flow';
  public activeSubTab: 'info' | 'design' = 'design';
  public searchQuery: string = '';
  public isPaletteCollapsed: boolean = false;
  private routeSub = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private templateService: TemplateService,
    public bridgeService: GraphBridgeService,
    private store: GraphEditorStore,
    private canvas: GraphCanvasService,
    private factory: NodeFactoryService,
    private editor: NodeEditorService,
    private gatewayJoin: GatewayJoinService,
    private history: GraphHistoryService,
    private layout: GraphLayoutService,
    private samples: SampleFlowService,
    private persistence: FlowPersistenceService,
    private dialogs: GraphDialogService,
    private translate: TranslateService,
  ) {}

  /** Dịch key trong PROCESS_GRAPH.* (xem i18n/vi.json, en.json) */
  private t(key: string, params?: Record<string, any>): string {
    return this.translate.instant('PROCESS_GRAPH.' + key, params);
  }

  // ---------------------------------------------------------------------------
  // State hiển thị trên template (đọc từ store)
  // ---------------------------------------------------------------------------
  public get currentTemplate(): ProcessTemplateItem {
    return this.store.currentTemplate;
  }
  public get canUndo(): boolean {
    return this.store.canUndo;
  }
  public get canRedo(): boolean {
    return this.store.canRedo;
  }
  public get currentZoom(): number {
    return this.store.currentZoom;
  }

  /** Thư viện bước – nhóm Điều kiện (lọc theo ô tìm kiếm) */
  public get conditionPaletteItems(): PaletteItem[] {
    return this.filterPalette('condition');
  }

  /** Thư viện bước – các bước thường (lọc theo ô tìm kiếm) */
  public get generalPaletteItems(): PaletteItem[] {
    return this.filterPalette('general');
  }

  private filterPalette(category: 'condition' | 'general'): PaletteItem[] {
    const q = (this.searchQuery || '').trim().toLowerCase();
    // Tìm theo tên / tooltip đã dịch (ngôn ngữ hiện tại)
    return PALETTE_ITEMS.filter((p) => {
      if (p.category !== category) return false;
      if (!q) return true;
      const title = this.t(`PALETTE.ITEMS.${p.type}.TITLE`).toLowerCase();
      const tooltip = this.t(`PALETTE.ITEMS.${p.type}.TOOLTIP`).toLowerCase();
      return title.includes(q) || tooltip.includes(q);
    });
  }

  // ---------------------------------------------------------------------------
  // Hành động trên template → service
  // ---------------------------------------------------------------------------
  public undo(): void {
    this.history.undo();
  }
  public redo(): void {
    this.history.redo();
  }
  public zoomIn(): void {
    this.canvas.zoomIn();
  }
  public zoomOut(): void {
    this.canvas.zoomOut();
  }
  public resetZoom(): void {
    this.canvas.resetZoom();
  }
  public autoLayout(): void {
    this.layout.autoLayout();
  }
  public clearCanvas(): void {
    this.editor.clearCanvas();
  }
  public deleteOrClear(): void {
    this.editor.deleteOrClear();
  }
  public loadSampleFlow(
    type: 'basic' | 'medium' | 'complex' | 'default',
  ): void {
    this.samples.loadSampleFlow(type);
  }
  public saveDraft(): void {
    this.persistence.saveDraft();
  }
  public saveProcessTemplate(): void {
    this.persistence.saveProcessTemplate();
  }
  public onValidateGraphClick(): void {
    this.dialogs.onValidateGraphClick();
  }

  // ---------------------------------------------------------------------------
  // Vòng đời & sự kiện
  // ---------------------------------------------------------------------------

  ngOnInit(): void {
    // 1. Lắng nghe cập nhật từ NodeConfigDrawer qua Bridge Service
    this.routeSub.add(
      this.bridgeService.nodeUpdated$.subscribe((event) => {
        if (
          !this.store.selectedNode ||
          this.store.selectedNode.id !== event.nodeId
        )
          return;
        this.store.selectedNodeProps = { ...event.props };
        if (event.field === 'label') {
          this.editor.onNodeLabelChange();
        } else {
          this.editor.onNodePropChange();
        }
      }),
    );

    this.routeSub.add(
      this.bridgeService.approvalToggled$.subscribe(
        ({ nodeId, isApproval }) => {
          if (!this.store.selectedNode || this.store.selectedNode.id !== nodeId)
            return;
          this.store.selectedNodeProps.isApprovalStep = isApproval;
          this.editor.onUserTaskApprovalToggle();
        },
      ),
    );

    this.routeSub.add(
      this.bridgeService.branchUpdated$.subscribe(
        ({ nodeId, action, index, props }) => {
          if (!this.store.selectedNode || this.store.selectedNode.id !== nodeId)
            return;
          this.store.selectedNodeProps = { ...props };
          if (action === 'add') {
            this.editor.addBranch();
          } else if (action === 'remove' && index !== undefined) {
            this.editor.removeBranch(index);
          } else if (action === 'change') {
            this.editor.onBranchChange(index);
          }
        },
      ),
    );

    this.routeSub.add(
      this.bridgeService.nodeDeleted$.subscribe((nodeId) => {
        if (this.store.selectedNode && this.store.selectedNode.id === nodeId) {
          this.editor.deleteSelectedNode();
        }
      }),
    );

    this.routeSub.add(
      this.bridgeService.modalRequest$.subscribe((req) => {
        if (req.type === 'info') this.dialogs.openTemplateInfoModal();
        else if (req.type === 'notify') this.dialogs.openNotifyConfigModal();
        else if (req.type === 'json')
          this.dialogs.openJsonPreviewModal(req.payload);
        else if (req.type === 'validation')
          this.dialogs.openValidationModal(req.payload);
      }),
    );

    this.routeSub.add(
      this.bridgeService.isDrawerOpen$.subscribe((open) => {
        this.store.isDrawerOpen = open;
      }),
    );

    this.routeSub.add(
      this.route.queryParams.subscribe((params) => {
        const templateCode = params['id'];
        if (templateCode) {
          const found = this.templateService.getTemplateByCode(templateCode);
          if (found) {
            this.store.currentTemplate = found;
          } else {
            this.store.currentTemplate = {
              code: templateCode,
              name: params['name'] || 'Quy trình xử lý nghiệp vụ',
              version: 'v1.0',
              sla: '4h SLA',
              slaStatus: 'normal',
              status: 'Draft',
              description: 'Quy trình khởi tạo từ danh sách Template',
            };
          }

          if (this.store.graph && this.store.currentTemplate.graphData) {
            this.persistence.loadGraphData(
              this.store.currentTemplate.graphData,
            );
          }
        }
      }),
    );
  }

  ngAfterViewInit(): void {
    this.canvas.initGraph(this.containerRef.nativeElement);
    this.loadInitialFlow();
  }

  /** Nạp flow khi mở màn hình: bản nháp đã lưu → dữ liệu canvas cũ → flow mẫu */
  private loadInitialFlow(): void {
    const templateCode =
      this.route.snapshot.queryParams['id'] || this.store.currentTemplate?.code;
    const initType = this.route.snapshot.queryParams['initType'];
    if (templateCode && this.persistence.loadSavedDraft(templateCode)) {
      // Đã vẽ lại từ bản nháp (FLOW_SCHEMA)
    } else if (this.store.currentTemplate.graphData) {
      this.persistence.loadGraphData(this.store.currentTemplate.graphData);
    } else if (templateCode === 'PRC_BASIC_CSAT_FEEDBACK') {
      this.samples.loadSampleBasicFlow();
    } else if (templateCode === 'PRC_BILLING_DISPUTE_REVERSAL') {
      this.samples.loadSampleConditionApiFlow();
    } else if (templateCode === 'PRC_VIP_ENTERPRISE_INCIDENT') {
      this.samples.loadSampleComplexEnterpriseFlow();
    } else if (initType === 'blank') {
      this.samples.createBlankWorkflowSample();
    } else {
      this.samples.createCompactWorkflowSample();
    }
    this.store.graph.getEdges()?.forEach((e: any) => e.setLabels([]));
  }

  public cancelEdit(): void {
    this.router.navigate(['/process/templates-list']);
  }

  public setSubTab(tab: 'info' | 'design'): void {
    this.activeSubTab = tab;
    if (tab === 'info') {
      this.dialogs.openTemplateInfoModal();
    }
  }

  public togglePaletteCollapse(): void {
    this.isPaletteCollapsed = !this.isPaletteCollapsed;
  }

  // Thêm Node từ Palette
  public addStandardNode(type: NodeType): void {
    if (!this.store.graph) return;
    const x = 160 + Math.floor(Math.random() * 200);
    const y = 140 + Math.floor(Math.random() * 150);
    const node = this.factory.createCompactCardNode(type, x, y);
    if (node && isGatewayType(type)) {
      this.gatewayJoin.createJoinForGateway(node);
    }
    if (node) {
      this.editor.selectNode(node);
      this.store.isDrawerOpen = true;
      this.bridgeService.selectNode(node, this.store.selectedNodeProps);
      this.store.selectedCellInfo = this.t('STATUS.NODE_ADDED', { type: this.t(`NODE_TYPES.${type}`) });
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
    const type = event.dataTransfer?.getData(
      'application/x6-node-type',
    ) as NodeType;
    if (!type || !this.store.graph) return;

    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    const p = this.store.graph.clientToLocal
      ? this.store.graph.clientToLocal({ x: event.clientX, y: event.clientY })
      : { x: event.clientX - rect.left, y: event.clientY - rect.top };

    const node = this.factory.createCompactCardNode(type, p.x - 84, p.y - 24);
    if (node && isGatewayType(type)) {
      this.gatewayJoin.createJoinForGateway(node);
    }
    if (node) {
      this.editor.selectNode(node);
      this.store.isDrawerOpen = true;
      this.bridgeService.selectNode(node, this.store.selectedNodeProps);
      this.store.updateCounts();
      this.history.pushHistorySnapshot();
    }
  }

  public revertChanges(): void {
    if (
      confirm(this.t('MESSAGES.REVERT_CONFIRM'))
    ) {
      if (this.store.currentTemplate.graphData) {
        this.persistence.loadGraphData(this.store.currentTemplate.graphData);
      } else {
        this.samples.createCompactWorkflowSample();
      }
      this.store.selectedCellInfo = this.t('STATUS.REVERTED');
    }
  }

  /** Nút Debug JSON: xem payload Lưu nháp của canvas hiện tại */
  public toggleJsonPreview(): void {
    const { payload, definition } = this.persistence.buildSaveDraftPayload();
    this.dialogs.openJsonPreviewModal({ ...payload, flowJson: definition });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable)
    ) {
      return;
    }

    // Nhấn phím Delete hoặc Backspace để xóa Node / Edge đang chọn
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (this.store.selectedNode || this.store.selectedCell) {
        event.preventDefault();
        this.editor.deleteOrClear();
      }
    } else if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === 'z'
    ) {
      if (event.shiftKey) {
        this.history.redo();
      } else {
        this.history.undo();
      }
      event.preventDefault();
    } else if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === 'y'
    ) {
      this.history.redo();
      event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
    if (this.store.graph) {
      this.store.graph.dispose();
    }
  }
}
