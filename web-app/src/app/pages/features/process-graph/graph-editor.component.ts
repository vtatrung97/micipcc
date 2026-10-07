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
import {
  ProcessInfo,
  ProcessInfoErrors,
  createEmptyProcessInfo,
  processInfoFromTemplate,
  validateProcessInfo,
  toProcessInfoPayload,
} from './models/process-info.model';

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
  /** Đã bấm Lưu nháp / Ban hành ít nhất 1 lần → bắt đầu hiện lỗi tab Thông tin chung */
  private infoSubmitted = false;
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
  /** Dữ liệu tab "Thông tin chung" */
  public get processInfo(): ProcessInfo {
    return this.store.processInfo;
  }
  public get isCreateMode(): boolean {
    return this.store.isCreateMode;
  }
  /** Tên trên header: theo ô "Tên quy trình" đang nhập */
  public get headerTitle(): string {
    return this.store.processInfo.name.trim()
      || this.t(this.store.isCreateMode ? 'INFO.NEW_PROCESS' : 'HEADER.DEFAULT_NAME');
  }
  /** Lỗi tab Thông tin chung — chỉ hiện sau lần bấm Lưu nháp / Ban hành đầu tiên, sau đó cập nhật theo từng lần gõ */
  public get processInfoErrors(): ProcessInfoErrors {
    return this.infoSubmitted ? this.collectInfoErrors() : {};
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
    if (!this.commitProcessInfo()) return;
    this.persistence.saveDraft();
  }
  public saveProcessTemplate(): void {
    if (!this.commitProcessInfo()) return;
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
        // Vào từ "Tạo mới quy trình": chưa có bản ghi → form trống, mở sẵn tab Thông tin chung
        if (!templateCode && params['mode'] === 'create') {
          this.store.isCreateMode = true;
          this.store.currentTemplate = {
            code: '',
            name: '',
            version: '1',
            sla: '',
            slaStatus: 'normal',
            status: 'Draft',
            description: '',
          };
          this.store.processInfo = createEmptyProcessInfo();
          this.activeSubTab = 'info';
          return;
        }
        if (templateCode) {
          this.store.isCreateMode = false;
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
          this.store.processInfo = processInfoFromTemplate(this.store.currentTemplate);
          if (params['mode'] === 'create') this.activeSubTab = 'info';

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
  }

  // ---------------------------------------------------------------------------
  // Tab "Thông tin chung"
  // ---------------------------------------------------------------------------

  /** Validate form + (tạo mới) kiểm tra trùng mã */
  private collectInfoErrors(): ProcessInfoErrors {
    const errors = validateProcessInfo(this.store.processInfo);
    const code = this.store.processInfo.code.trim().toUpperCase();
    if (!errors.code && this.store.isCreateMode && this.templateService.getTemplateByCode(code)) {
      errors.code = 'CODE_EXISTS';
    }
    return errors;
  }

  /**
   * Trước khi Lưu nháp / Ban hành: kiểm tra tab Thông tin chung.
   * Lỗi → chuyển sang tab Thông tin chung và dừng. Hợp lệ → tạo mới / cập nhật bản ghi quy trình.
   */
  private commitProcessInfo(): boolean {
    this.infoSubmitted = true;
    const errors = this.collectInfoErrors();
    const count = Object.keys(errors).length;
    if (count > 0) {
      this.activeSubTab = 'info';
      this.store.selectedCellInfo = this.t('INFO.STATUS_INVALID', { count });
      return false;
    }

    const info = this.store.processInfo;
    const extra = toProcessInfoPayload(info);
    const updates: Partial<ProcessTemplateItem> = {
      name: info.name.trim(),
      description: info.description,
      category: info.category || undefined,
      triggerType: extra.triggerType,
      triggerConfig: extra.triggerConfig,
      slaValue: extra.slaValue,
      slaUnit: extra.slaUnit,
      sla: `${extra.slaValue} ${extra.slaUnit}`,
    };

    if (this.store.isCreateMode) {
      const created = this.templateService.createTemplate({
        ...this.store.currentTemplate,
        ...updates,
        code: extra.code.toUpperCase(),
        status: 'Draft',
      });
      // createTemplate() chỉ giữ các field cũ → ghi thêm loại kích hoạt / SLA tách số + đơn vị
      this.templateService.updateTemplate(created.code, updates);
      this.store.currentTemplate = { ...created, ...updates };
      this.store.isCreateMode = false;
      this.store.selectedCellInfo = this.t('INFO.STATUS_CREATED', { code: created.code });
      // Gắn ?id= để F5 / mở lại vẫn đúng bản ghi (không rời màn hình)
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { id: created.code, mode: null, initType: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    } else {
      this.templateService.updateTemplate(this.store.currentTemplate.code, updates);
      this.store.currentTemplate = { ...this.store.currentTemplate, ...updates };
    }
    return true;
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
