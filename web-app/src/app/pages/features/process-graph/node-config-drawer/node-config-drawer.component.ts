import { Component, DoCheck, Input, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { GraphBridgeService } from '../services/graph-bridge.service';
import { NodePropertyModel } from '../models/node-property.model';
import { NodeType, isGatewayType } from '../models/node-type';
import { withFixedBranches } from '../models/gateway-branch';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import { NodeFactoryService } from '../services/node-factory.service';
import { NODE_ICON_BG } from '../config/node-view.config';
import { NodeIconService } from '../services/node-icon.service';
import { GraphEditorStore } from '../state/graph-editor.store';
import { ProcessVariableService } from '../services/process-variable.service';
import { NodeFieldErrors, hasNodeErrors, otherNodeKeys, validateNodeProps } from '../models/node-validation';

/** Trạng thái node lúc mở drawer — dùng để hoàn tác khi bấm Hủy */
interface NodeSnapshot {
  nodeId: string;
  node: any;
  edges: any[];
  /** Node Gộp nhánh đi kèm (đổi loại điều kiện sẽ đổi tên của nó) */
  join: { id: string; data: any; attrs: any } | null;
}

const GATEWAY_TYPES: NodeType[] = ['GATEWAY_EXCLUSIVE', 'GATEWAY_PARALLEL', 'GATEWAY_INCLUSIVE'];
const GATEWAY_KIND: Record<string, 'exclusive' | 'parallel' | 'inclusive'> = {
  GATEWAY_EXCLUSIVE: 'exclusive',
  GATEWAY_PARALLEL: 'parallel',
  GATEWAY_INCLUSIVE: 'inclusive',
};

@Component({
  selector: 'app-node-config-drawer',
  templateUrl: './node-config-drawer.component.html',
  styleUrls: ['./node-config-drawer.component.scss']
})
export class NodeConfigDrawerComponent implements OnInit, DoCheck, OnDestroy {
  /** Chỉ xem (popup xem quy trình): khoá ô nhập, ẩn Hủy / Lưu, không đổi icon */
  @Input() readonly: boolean = false;

  public isVisible: boolean = false;
  public selectedNode: any = null;
  public nodeProps: NodePropertyModel | null = null;


  /** Lựa chọn loại điều kiện trên header drawer */
  public gatewayTypeOptions: SelectOption[] = [];

  /** Đã bấm Lưu mà còn thiếu trường bắt buộc → bắt đầu hiện lỗi */
  public isSubmitted: boolean = false;

  private snapshot: NodeSnapshot | null = null;
  private sub = new Subscription();

  constructor(
    public bridgeService: GraphBridgeService,
    private translate: TranslateService,
    private icons: NodeIconService,
    private store: GraphEditorStore,
    private factory: NodeFactoryService,
    private variables: ProcessVariableService,
  ) {
    this.gatewayTypeOptions = GATEWAY_TYPES.map((type) => ({ value: type, label: this.t(`NODE_TYPES.${type}`) }));
  }

  /** Dịch key trong PROCESS_GRAPH.* (xem i18n/vi.json, en.json) */
  private t(key: string, params?: Record<string, any>): string {
    return this.translate.instant('PROCESS_GRAPH.' + key, params);
  }

  ngOnInit(): void {
    this.sub.add(
      this.bridgeService.isDrawerOpen$.subscribe(open => {
        this.isVisible = open;
      })
    );

    this.sub.add(
      this.bridgeService.selectedNode$.subscribe(node => {
        this.selectedNode = node;
        // Mở drawer cho node khác → chụp lại trạng thái để Hủy
        if (node && node.id !== this.snapshot?.nodeId) this.takeSnapshot(node);
        if (!node) this.snapshot = null;
      })
    );

    // Mở từ danh sách lỗi (Lưu nháp / Ban hành) → hiện lỗi ngay
    this.sub.add(
      this.bridgeService.showErrors$.subscribe(() => {
        this.isSubmitted = true;
      })
    );

    this.sub.add(
      this.bridgeService.selectedNodeProps$.subscribe(props => {
        this.nodeProps = props ? { ...props } : null;
        if (this.nodeProps && isGatewayType(this.nodeProps.type)) {
          // Mặc định + Lỗi luôn có trong danh sách nhánh
          this.nodeProps.branches = withFixedBranches(this.nodeProps.branches, {
            defaultName: this.t('CANVAS.DEFAULT_BRANCH'),
            errorName: this.t('CANVAS.ERROR_BRANCH'),
          });
        }
      })
    );
  }

  /** Lỗi các trường bắt buộc (chỉ hiện sau lần bấm Lưu đầu tiên); giữ nguyên object khi không đổi để input con ổn định */
  public errors: NodeFieldErrors = {};

  ngDoCheck(): void {
    const next = this.isSubmitted && this.nodeProps ? this.validate(this.nodeProps) : {};
    if (JSON.stringify(next) !== JSON.stringify(this.errors)) this.errors = next;
  }

  /** Lưu: đủ trường bắt buộc thì giữ thay đổi và đóng; thiếu thì báo lỗi, cuộn tới ô lỗi đầu tiên */
  public onSave(): void {
    if (!this.nodeProps) return;
    this.isSubmitted = true;
    if (hasNodeErrors(this.validate(this.nodeProps))) {
      setTimeout(() => document.querySelector('.properties-side-drawer .has-error, .properties-side-drawer .field-error')?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
      return;
    }
    // Lưu thành công lần đầu → bước đã cấu hình xong
    if (this.nodeProps.isUnconfigured) {
      this.nodeProps.isUnconfigured = false;
      this.onPropChange('isUnconfigured');
    }
    this.finish();
  }

  /**
   * Hủy / nút X: trả node về trạng thái lúc mở drawer rồi đóng.
   * Bước vừa thêm mà chưa Lưu lần nào → xoá luôn khỏi canvas.
   */
  public onClose(): void {
    const unconfiguredId = !this.readonly && this.snapshot?.node?.data?.isUnconfigured ? this.snapshot.nodeId : null;
    this.restoreSnapshot();
    if (unconfiguredId) this.bridgeService.requestDeleteNode(unconfiguredId);
    this.finish();
  }

  private validate(props: NodePropertyModel): NodeFieldErrors {
    return validateNodeProps(props, {
      otherNodeKeys: otherNodeKeys(this.store.graph, props.id),
      otherVariableNames: this.variables.otherDeclaredNames(props.id),
      triggerType: this.store.processInfo?.triggerType,
    });
  }

  private finish(): void {
    this.snapshot = null;
    this.isSubmitted = false;
    this.bridgeService.closeDrawer();
  }

  private takeSnapshot(node: any): void {
    const graph = this.store.graph;
    this.isSubmitted = false;
    this.snapshot = {
      nodeId: node.id,
      node: node.toJSON(),
      edges: (graph?.getConnectedEdges(node) || []).map((e: any) => e.toJSON()),
      join: null,
    };
    const join = node.getData()?.joinNodeId && graph?.getCellById(node.getData().joinNodeId);
    if (join) this.snapshot.join = { id: join.id, data: { ...join.getData() }, attrs: JSON.parse(JSON.stringify(join.getAttrs())) };
  }

  /** Khôi phục data, hình, cổng của node và các cạnh nối vào cổng đã bị xoá */
  private restoreSnapshot(): void {
    const graph = this.store.graph;
    const snap = this.snapshot;
    const node = snap && graph?.getCellById(snap.nodeId);
    if (!snap || !node) return;
    if (JSON.stringify(node.toJSON()) === JSON.stringify(snap.node)) return;

    node.setData(snap.node.data, { overwrite: true });
    node.setAttrs(snap.node.attrs, { overwrite: true });
    node.resize(snap.node.size.width, snap.node.size.height);
    node.removePorts();
    node.addPorts(snap.node.ports?.items || []);

    if (snap.join) {
      const join = graph.getCellById(snap.join.id);
      join?.setData(snap.join.data, { overwrite: true });
      join?.setAttrs(snap.join.attrs, { overwrite: true });
    }

    const portIds = new Set((snap.node.ports?.items || []).map((p: any) => p.id));
    graph.getConnectedEdges(node).forEach((edge: any) => {
      const end = edge.getSourceCellId() === node.id ? edge.getSource() : edge.getTarget();
      if (end.port && !portIds.has(end.port)) graph.removeEdge(edge);
    });
    snap.edges
      .filter((e) => !graph.getCellById(e.id) && graph.getCellById(e.source?.cell) && graph.getCellById(e.target?.cell))
      .forEach((e) => graph.addEdge(e));
  }


  public onPropChange(field?: keyof NodePropertyModel | 'all'): void {
    if (!this.nodeProps) return;
    const value = field && field !== 'all' ? this.nodeProps[field] : this.nodeProps;
    this.bridgeService.updateNodeProp(this.nodeProps.id, field || 'all', value, this.nodeProps);
  }


  public isGateway(type: string | undefined): boolean {
    return isGatewayType(type);
  }

  /** Modal "Chọn biểu tượng" mở từ icon trên header */
  public isIconModalOpen: boolean = false;

  /** Icon trên header drawer (mọi loại bước trừ Gộp nhánh tự sinh) */
  public get headerIcon(): { src: string; bg: string } | null {
    const type = this.nodeProps?.type;
    if (!type || type === 'JOIN') return null;
    return { src: this.icons.getIconSrc(type), bg: NODE_ICON_BG[type] };
  }

  public getDrawerTitle(): string {
    if (!this.nodeProps) return this.t('DRAWER.DEFAULT_TITLE');
    if (isGatewayType(this.nodeProps.type)) return this.t('PALETTE.CONDITION_GROUP');
    return this.t(`NODE_TYPES.${this.nodeProps.type}`);
  }

  /** Đổi loại điều kiện: cập nhật data, icon, tên loại trên card và tên node Gộp nhánh đi kèm (cổng ra giữ nguyên) */
  public changeGatewayType(type: NodeType): void {
    const graph = this.store.graph;
    const node = this.nodeProps && graph?.getCellById(this.nodeProps.id);
    if (!this.nodeProps || !node || type === this.nodeProps.type) return;
    const typeTitle = this.t(`NODE_TYPES.${type}`);
    const changes = { type, typeTitle, gatewayType: GATEWAY_KIND[type] };
    this.nodeProps = { ...this.nodeProps, ...changes };
    node.setData({ ...node.getData(), ...changes });
    const src = this.icons.getIconSrc(type);
    node.setAttrs({ iconImg: { href: src, 'xlink:href': src } });
    this.factory.refreshCardView(node);

    const join = node.getData().joinNodeId && graph.getCellById(node.getData().joinNodeId);
    if (join) {
      join.setData({ ...join.getData(), label: this.t(`JOIN_LABELS.${type}`) });
      this.factory.refreshCardView(join);
    }
    this.store.selectedNodeProps = { ...this.nodeProps };
  }

  public deleteNode(): void {
    if (!this.nodeProps) return;
    if (confirm(this.t('MESSAGES.DELETE_NODE_CONFIRM', { name: this.nodeProps.label || this.nodeProps.typeTitle }))) {
      this.bridgeService.requestDeleteNode(this.nodeProps.id);
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
