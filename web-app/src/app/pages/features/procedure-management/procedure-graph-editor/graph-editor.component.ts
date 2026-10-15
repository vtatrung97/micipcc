import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  TemplateService,
  ProcessTemplateItem,
} from '@core/services/ticket-call-flows/template.service';
import { NodeType, isGatewayType } from './models/node-type';
import {
  NODE_CARD_HEIGHT,
  NODE_CARD_WIDTH,
  NODE_ICON_BG,
  PALETTE_CONDITION_ICON_SRC,
} from './config/node-view.config';
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
import { ProcessVariableService } from './services/process-variable.service';
import { NodeIconService } from './services/node-icon.service';
import { AddStepOverlayComponent } from './add-step/add-step-overlay.component';
import { NodePlacementService } from './services/node-placement.service';
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

/**
 * Màn Canvas Builder: chỉ điều phối sự kiện từ template / drawer / router sang service.
 * State dùng chung nằm ở GraphEditorStore; cấu trúc chi tiết xem README.md.
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
    ProcessVariableService,
    NodeIconService,
    NodePlacementService,
  ],
})
export class GraphEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('addStep', { static: true }) addStep!: AddStepOverlayComponent;

  @ViewChild('container', { static: true })
  containerRef!: ElementRef<HTMLDivElement>;

  // State riêng của giao diện màn hình
  public activeTab: 'flow' | 'info' | 'notify' = 'flow';
  public activeSubTab: 'info' | 'design' = 'design';
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
    private icons: NodeIconService,
    private placement: NodePlacementService,
    private persistence: FlowPersistenceService,
    private dialogs: GraphDialogService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private message: NzMessageService,
  ) {}

  /** Dịch key trong PROCESS_GRAPH.* (xem i18n/vi.json, en.json) */
  private t(key: string, params?: Record<string, any>): string {
    return this.translate.instant('PROCESS_GRAPH.' + key, params);
  }

  // ----- State hiển thị trên template (đọc từ store) -----
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
  /** Mở từ nút Xem ở danh sách (mode=view): khoá mọi ô và mọi thao tác sửa */
  public get isReadonly(): boolean {
    return this.store.isReadonly;
  }
  /** Tên trên header: theo ô "Tên quy trình" đang nhập */
  public get headerTitle(): string {
    return this.store.processInfo.name.trim()
      || this.t(this.store.isCreateMode ? 'INFO.NEW_PROCESS' : 'HEADER.DEFAULT_NAME');
  }
  /** Số phiên bản trên header: 'V2.1' / '4' / 'V1.0-draft' → '2.1' / '4' / '1.0'; quy trình mới → '1' */
  public get headerVersion(): string {
    return (this.store.currentTemplate?.version || '').replace(/^v/i, '').replace(/-draft$/i, '') || '1';
  }
  /** Hủy / Lưu nháp / Ban hành: ẩn khi chỉ xem hoặc quy trình đang ban hành */
  public get showEditActions(): boolean {
    return !this.store.isReadonly && this.headerStatus !== 'Published';
  }
  /** Trạng thái phiên bản trên header; quy trình mới coi như Nháp */
  public get headerStatus(): 'Draft' | 'Published' | 'Inactive' {
    return this.store.isCreateMode ? 'Draft' : (this.store.currentTemplate?.status || 'Draft');
  }
  /** Lỗi tab Thông tin chung: chỉ hiện sau lần Lưu nháp / Ban hành đầu tiên, rồi cập nhật theo từng lần gõ */
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

  // Thư viện bước: thứ tự Giao việc · Tác vụ hệ thống · Điều kiện (3 loại) · Gửi thông báo · Quy trình con · Kết thúc
  public readonly paletteGatewayTypes: NodeType[] = ['GATEWAY_EXCLUSIVE', 'GATEWAY_PARALLEL', 'GATEWAY_INCLUSIVE'];
  public readonly paletteBottomTypes: NodeType[] = ['NOTIFICATION', 'SUB_PROCESS', 'END'];
  public readonly paletteConditionIcon = PALETTE_CONDITION_ICON_SRC;

  public paletteIconSrc(type: NodeType): string {
    return this.icons.getPaletteIconSrc(type);
  }

  public paletteIconBg(type: NodeType): string {
    return type === 'END' ? '#fff0f3' : NODE_ICON_BG[type];
  }

  // ----- Hành động trên template → service -----
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
  public zoomToFit(): void {
    this.canvas.zoomToFit();
  }
  /** Nút "Sắp xếp lại quy trình": xếp lại các bước theo luồng rồi căn vừa màn hình */
  public autoLayout(): void {
    if (this.layout.autoLayout()) this.canvas.zoomToFit();
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
    if (this.persistence.saveDraft()) this.markClean();
  }
  public saveProcessTemplate(): void {
    if (!this.commitProcessInfo()) return;
    if (this.persistence.saveProcessTemplate()) this.markClean();
  }
  public onValidateGraphClick(): void {
    this.dialogs.onValidateGraphClick();
  }

  // ----- Vòng đời & sự kiện -----

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
          } else if (action === 'sync') {
            // Danh sách nhánh đã được sửa ở drawer → đồng bộ card + cổng ra
            this.editor.updateConditionNodePorts();
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
        // Đặt trước khi dựng canvas: graph tắt kéo / nối / sửa khi chỉ xem
        this.store.isReadonly = !!templateCode && params['mode'] === 'view';
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
    this.addStep.attach();
    this.loadInitialFlow();
    // Nạp flow đổi trạng thái hoàn tác / số node ngay trong vòng kiểm tra đầu → cập nhật lại view
    this.cdr.detectChanges();
  }

  /** Nạp flow khi mở màn hình: bản nháp đã lưu → dữ liệu canvas cũ → flow mẫu */
  private loadInitialFlow(): void {
    const templateCode =
      this.route.snapshot.queryParams['id'] || this.store.currentTemplate?.code;
    const initType = this.route.snapshot.queryParams['initType'];
    if (templateCode && this.persistence.loadSavedDraft(templateCode)) {
      // Đã vẽ lại từ bản nháp (FLOW_SCHEMA)
    } else if (this.store.currentTemplate.flowDefinition) {
      // Quy trình mẫu: thiết kế lưu sẵn dạng FlowDefinition
      this.persistence.renderFlowDefinition(this.store.currentTemplate.flowDefinition);
    } else if (this.store.currentTemplate.graphData) {
      this.persistence.loadGraphData(this.store.currentTemplate.graphData);
    } else if (initType === 'blank') {
      this.samples.createBlankWorkflowSample();
    } else {
      this.samples.loadSampleFlow('default');
    }
    this.store.graph.getEdges()?.forEach((e: any) => e.setLabels([]));
    // Chỉ xem: ẩn nút × xoá bước trên card
    if (this.store.isReadonly) this.store.graph.getNodes()?.forEach((n: any) => n.attr('closeBtn/display', 'none'));
    // Mở canvas luôn ở 100% (chạy sau mọi lệnh căn vừa màn hình của flow mẫu)
    setTimeout(() => this.canvas.resetZoom());
    this.markClean();
  }

  /** Popup xác nhận Hủy (chỉ hiện khi đã có thay đổi so với lúc mở / lần lưu gần nhất) */
  public isCancelConfirmOpen: boolean = false;
  /** Popup xác nhận Dừng ban hành */
  public isStopConfirmOpen: boolean = false;

  /** Xác nhận Dừng ban hành: chuyển quy trình sang Dừng ban hành, header hiện lại Hủy / Lưu nháp / Ban hành */
  public stopPublishing(): void {
    this.isStopConfirmOpen = false;
    const code = this.store.currentTemplate?.code;
    if (!code) return;
    this.templateService.updateTemplate(code, { status: 'Inactive' });
    this.store.currentTemplate = this.templateService.getTemplateByCode(code) || { ...this.store.currentTemplate, status: 'Inactive' };
    this.message.success(this.t('HEADER.STOP_PUBLISH_SUCCESS', { code }));
  }
  private cleanSnapshot: string = '';

  /** Hủy: chưa thay đổi gì thì về danh sách luôn, có thay đổi thì hỏi xác nhận */
  public cancelEdit(): void {
    if (this.cleanSnapshot && this.takeSnapshot() !== this.cleanSnapshot) {
      this.isCancelConfirmOpen = true;
      return;
    }
    this.leaveEditor();
  }

  public leaveEditor(): void {
    this.isCancelConfirmOpen = false;
    this.router.navigate(['/procedure-management']);
  }

  /** Dấu vân tay của Thông tin chung + canvas (node, vị trí, cấu hình, edge) để so thay đổi */
  private takeSnapshot(): string {
    const graph = this.store.graph;
    const cells = graph
      ? graph.getCells().map((c: any) => c.isNode()
          ? [c.id, c.getPosition(), c.getData()]
          : [c.id, c.getSourceCellId(), c.getSourcePortId(), c.getTargetCellId(), c.getData()])
      : [];
    return JSON.stringify([this.store.processInfo, cells]);
  }

  /** Mốc "chưa thay đổi": sau khi nạp xong màn hình và sau mỗi lần lưu */
  private markClean(): void {
    setTimeout(() => (this.cleanSnapshot = this.takeSnapshot()));
  }

  /**
   * Chuyển bước trên stepper. Sang bước 2 (Thiết kế quy trình) phải hợp lệ toàn bộ trường bắt buộc
   * của bước 1 — chưa hợp lệ thì ở lại, bật hiển thị lỗi dưới từng trường và báo số lỗi trên status bar.
   */
  public setSubTab(tab: 'info' | 'design'): void {
    if (tab === 'design' && this.activeSubTab === 'info') {
      this.infoSubmitted = true;
      const count = Object.keys(this.collectInfoErrors()).length;
      if (count > 0) {
        this.store.selectedCellInfo = this.t('INFO.STATUS_INVALID', { count });
        // Đợi lỗi render rồi cuộn tới trường lỗi đầu tiên
        setTimeout(() => document.querySelector('app-process-info-form .has-error')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        return;
      }
    }
    this.activeSubTab = tab;
  }

  // ----- Tab "Thông tin chung" -----

  /** Validate form + (tạo mới) kiểm tra trùng mã */
  private collectInfoErrors(): ProcessInfoErrors {
    const errors = validateProcessInfo(this.store.processInfo);
    // Mã quy trình không trùng (không phân biệt hoa thường)
    const code = this.store.processInfo.code.trim().toLowerCase();
    if (!errors.code && this.store.isCreateMode && this.templateService.getTemplates().some((t) => (t.code || '').toLowerCase() === code)) {
      errors.code = 'CODE_EXISTS';
    }
    // Tên quy trình không trùng quy trình khác (khi sửa thì bỏ qua chính nó)
    const name = this.store.processInfo.name.trim().toLowerCase();
    const selfCode = this.store.isCreateMode ? '' : this.store.currentTemplate?.code;
    if (!errors.name && name && this.templateService.getTemplates().some((t) => t.code !== selfCode && (t.name || '').trim().toLowerCase() === name)) {
      errors.name = 'NAME_EXISTS';
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


  /** Bấm trên Thư viện bước: thêm ngay sau bước đang chọn và nối cạnh */
  public addStandardNode(type: NodeType): void {
    if (this.store.isReadonly) return;
    this.placement.placeNodeFromPalette(type);
  }

  public onPaletteDragStart(event: DragEvent, type: NodeType): void {
    if (this.store.isReadonly) {
      event.preventDefault();
      return;
    }
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
    if (!type || !this.store.graph || this.store.isReadonly) return;

    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    const p = this.store.graph.clientToLocal
      ? this.store.graph.clientToLocal({ x: event.clientX, y: event.clientY })
      : { x: event.clientX - rect.left, y: event.clientY - rect.top };

    this.placement.placeNode(type, p.x - NODE_CARD_WIDTH / 2, p.y - NODE_CARD_HEIGHT / 2);
  }

  public revertChanges(): void {
    if (
      confirm(this.t('MESSAGES.REVERT_CONFIRM'))
    ) {
      if (this.store.currentTemplate.graphData) {
        this.persistence.loadGraphData(this.store.currentTemplate.graphData);
      } else {
        this.samples.loadSampleFlow('default');
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
    // Chỉ xem: không xoá / hoàn tác bằng phím tắt
    if (this.store.isReadonly) return;
    const target = event.target as HTMLElement;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        // Đang mở popup (vd: xem quy trình con) → không xoá / hoàn tác trên canvas chính
        document.querySelector('.modal-wrap, .ant-modal-wrap'))
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
