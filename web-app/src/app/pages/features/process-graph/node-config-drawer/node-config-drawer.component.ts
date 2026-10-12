import { Component, DoCheck, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { GraphBridgeService } from '../services/graph-bridge.service';
import { NodePropertyModel, ActionLibraryItem, ConditionBranch, ConditionRuleItem } from '../models/node-property.model';
import { isGatewayType } from '../models/node-type';
import { NODE_ICON_BG } from '../config/node-view.config';
import { NodeIconService } from '../services/node-icon.service';
import { GraphEditorStore } from '../state/graph-editor.store';
import { NodeFieldErrors, hasNodeErrors, validateNodeProps } from '../models/node-validation';

/** Trạng thái node lúc mở drawer — dùng để hoàn tác khi bấm Hủy */
interface NodeSnapshot {
  nodeId: string;
  node: any;
  edges: any[];
}

@Component({
  selector: 'app-node-config-drawer',
  templateUrl: './node-config-drawer.component.html',
  styleUrls: ['./node-config-drawer.component.scss']
})
export class NodeConfigDrawerComponent implements OnInit, DoCheck, OnDestroy {
  public isVisible: boolean = false;
  public selectedNode: any = null;
  public nodeProps: NodePropertyModel | null = null;

  // Accordion open/close states
  public accordions: Record<string, boolean> = {
    general: true,
    notification: true,
    cases: true,
    defaultFlow: true,
    errorFlow: true
  };

  // Modal điều kiện
  public isConditionModalVisible: boolean = false;
  public editingBranch: ConditionBranch | null = null;
  public editingRules: ConditionRuleItem[] = [];
  public editingLogicOperator: 'AND' | 'OR' = 'AND';

  /** Đã bấm Lưu mà còn thiếu trường bắt buộc → bắt đầu hiện lỗi */
  public isSubmitted: boolean = false;

  private snapshot: NodeSnapshot | null = null;
  private sub = new Subscription();

  constructor(
    public bridgeService: GraphBridgeService,
    private translate: TranslateService,
    private icons: NodeIconService,
    private store: GraphEditorStore,
  ) {}

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

    this.sub.add(
      this.bridgeService.selectedNodeProps$.subscribe(props => {
        this.nodeProps = props ? { ...props } : null;
        if (this.nodeProps && isGatewayType(this.nodeProps.type)) {
          if (!this.nodeProps.branches || this.nodeProps.branches.length === 0) {
            this.nodeProps.branches = [
              { id: 'br-1', name: this.t('CANVAS.DEFAULT_CASE_NAME'), value: 'valid', expression: '.priority == "Cao"', rules: [{ param: '.priority', operator: 'EQ', value: 'Cao' }] },
              { id: 'br-default', name: this.t('CANVAS.DEFAULT_BRANCH'), value: 'default', expression: 'default', isDefault: true, rules: [] }
            ];
          }
        }
      })
    );
  }

  /** Lỗi các trường bắt buộc (chỉ hiện sau lần bấm Lưu đầu tiên); giữ nguyên object khi không đổi để input con ổn định */
  public errors: NodeFieldErrors = {};

  ngDoCheck(): void {
    const next = this.isSubmitted && this.nodeProps ? validateNodeProps(this.nodeProps) : {};
    if (JSON.stringify(next) !== JSON.stringify(this.errors)) this.errors = next;
  }

  /** Lưu: đủ trường bắt buộc thì giữ thay đổi và đóng; thiếu thì báo lỗi, cuộn tới ô lỗi đầu tiên */
  public onSave(): void {
    if (!this.nodeProps) return;
    this.isSubmitted = true;
    if (hasNodeErrors(validateNodeProps(this.nodeProps))) {
      setTimeout(() => document.querySelector('.properties-side-drawer .has-error, .properties-side-drawer .field-error')?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
      return;
    }
    this.finish();
  }

  /** Hủy / nút X: trả node về trạng thái lúc mở drawer rồi đóng */
  public onClose(): void {
    this.restoreSnapshot();
    this.finish();
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
    };
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

    const portIds = new Set((snap.node.ports?.items || []).map((p: any) => p.id));
    graph.getConnectedEdges(node).forEach((edge: any) => {
      const end = edge.getSourceCellId() === node.id ? edge.getSource() : edge.getTarget();
      if (end.port && !portIds.has(end.port)) graph.removeEdge(edge);
    });
    snap.edges
      .filter((e) => !graph.getCellById(e.id) && graph.getCellById(e.source?.cell) && graph.getCellById(e.target?.cell))
      .forEach((e) => graph.addEdge(e));
  }

  public onLabelChange(): void {
    if (!this.nodeProps) return;
    this.bridgeService.updateNodeLabel(this.nodeProps.id, this.nodeProps.label, this.nodeProps);
  }

  public onPropChange(field?: keyof NodePropertyModel | 'all'): void {
    if (!this.nodeProps) return;
    const value = field && field !== 'all' ? this.nodeProps[field] : this.nodeProps;
    this.bridgeService.updateNodeProp(this.nodeProps.id, field || 'all', value, this.nodeProps);
  }

  public toggleAccordion(key: string): void {
    this.accordions[key] = !this.accordions[key];
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
    if (isGatewayType(this.nodeProps.type)) {
      return this.t('DRAWER.GATEWAY_TITLE', { type: this.t(`NODE_TYPES.${this.nodeProps.type}`) });
    }
    return this.t(`NODE_TYPES.${this.nodeProps.type}`);
  }

  // Condition cases helpers
  public addCase(): void {
    if (!this.nodeProps) return;
    if (!this.nodeProps.branches) this.nodeProps.branches = [];
    const count = this.nodeProps.branches.filter(b => !b.isDefault).length + 1;
    const newBranch: ConditionBranch = {
      id: `br-${Date.now()}`,
      name: this.t('DRAWER.NEW_CASE', { index: count }),
      value: `case_${count}`,
      expression: '',
      isDefault: false,
      rules: [{ param: '.priority', operator: 'EQ', value: 'Cao' }],
      logicOperator: 'AND'
    };

    const defaultIdx = this.nodeProps.branches.findIndex(b => b.isDefault);
    if (defaultIdx !== -1) {
      this.nodeProps.branches.splice(defaultIdx, 0, newBranch);
    } else {
      this.nodeProps.branches.push(newBranch);
    }
    this.onPropChange('branches');
  }

  public removeCase(index: number): void {
    if (!this.nodeProps?.branches) return;
    this.nodeProps.branches.splice(index, 1);
    this.onPropChange('branches');
  }

  public openConditionModal(branch: ConditionBranch): void {
    this.editingBranch = branch;
    this.editingRules = branch.rules && branch.rules.length > 0
      ? JSON.parse(JSON.stringify(branch.rules))
      : [{ param: '.priority', operator: 'EQ', value: 'Cao' }];
    this.editingLogicOperator = branch.logicOperator || 'AND';
    this.isConditionModalVisible = true;
  }

  public closeConditionModal(): void {
    this.isConditionModalVisible = false;
    this.editingBranch = null;
  }

  public saveConditionModal(): void {
    if (this.editingBranch) {
      this.editingBranch.rules = [...this.editingRules];
      this.editingBranch.logicOperator = this.editingLogicOperator;
      this.onPropChange('branches');
    }
    this.isConditionModalVisible = false;
    this.editingBranch = null;
  }

  public addRule(): void {
    this.editingRules.push({ param: '.priority', operator: 'EQ', value: '' });
  }

  public removeRule(index: number): void {
    this.editingRules.splice(index, 1);
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
