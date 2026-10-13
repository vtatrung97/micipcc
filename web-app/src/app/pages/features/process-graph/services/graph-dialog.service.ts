import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { validateBpmnGraph, GraphValidationResult, TranslateFn } from '../config/ports.config';
import { GraphEditorStore } from '../state/graph-editor.store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NodeEditorService } from './node-editor.service';
import { GraphBridgeService } from './graph-bridge.service';
import { ProcessVariableService } from './process-variable.service';
import { hasNodeErrors, otherNodeKeys, validateNodeProps } from '../models/node-validation';
import { normalizeNodeType } from '../models/node-type';
import { TemplateInfoModalComponent, NotifyConfigModalComponent, JsonPreviewModalComponent, ValidationModalComponent } from '../modals';

/** Validate đồ thị và các modal (validate, thông tin chung, thông báo, JSON). */
@Injectable()
export class GraphDialogService {
  constructor(
    private translate: TranslateService,
    private store: GraphEditorStore,
    private modalService: NzModalService,
    private editor: NodeEditorService,
    public bridgeService: GraphBridgeService,
    private variables: ProcessVariableService,
  ) {}

  /** Dịch key trong PROCESS_GRAPH.* (xem i18n/vi.json, en.json) */
  private t(key: string, params?: Record<string, any>): string {
    return this.translate.instant('PROCESS_GRAPH.' + key, params);
  }

  /** Hàm dịch truyền vào các hàm thuần trong ports.config */
  private readonly tFn: TranslateFn = (key, params) => this.translate.instant(key, params);


  // 5. GRAPH VALIDATION (BPMN 2.0 STANDARD COMPLIANCE) & DYNAMIC MODALS
  public validateGraph(): GraphValidationResult {
    const result = validateBpmnGraph(this.store.graph, this.tFn);
    // Bước còn thiếu / sai trường bắt buộc trong drawer
    (this.store.graph?.getNodes() || []).forEach((node: any) => {
      const data = node.getData() || {};
      const type = normalizeNodeType(data.type, data.gatewayType);
      const errors = validateNodeProps({ ...data, type }, {
        otherNodeKeys: otherNodeKeys(this.store.graph, node.id),
        otherVariableNames: this.variables.otherDeclaredNames(node.id),
        triggerType: this.store.processInfo?.triggerType,
      });
      if (!hasNodeErrors(errors)) return;
      const label = data.label || this.t(`NODE_TYPES.${type}`);
      result.errors.push({
        nodeId: node.id,
        nodeKey: data.nodeKey,
        nodeLabel: label,
        type,
        code: 'NODE_FIELDS_INVALID',
        message: this.t('VALIDATION.NODE_FIELDS_INVALID', { label }),
        severity: 'error',
      });
    });
    result.isValid = result.errors.length === 0;
    result.summary = this.t(result.isValid ? 'VALIDATION.SUMMARY_VALID' : 'VALIDATION.SUMMARY_INVALID', { count: result.errors.length });
    this.store.validationResult = result;
    return result;
  }


  public openValidationModal(result?: GraphValidationResult): void {
    const validationRes = result || this.validateGraph();
    const modal = this.modalService.create({
      nzTitle: this.t('MODALS.VALIDATION_TITLE'),
      nzContent: ValidationModalComponent,
      nzComponentParams: { validationResult: validationRes },
      nzWidth: 740,
      nzFooter: null,
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
    if (!nodeId || !this.store.graph) return;
    const node = this.store.graph.getCellById(nodeId);
    if (node && node.isNode?.()) {
      this.editor.selectNode(node);
      this.store.graph.centerCell(node);
      this.store.isDrawerOpen = true;
      this.bridgeService.selectNode(node, this.store.selectedNodeProps);
      this.bridgeService.showErrors$.next();
    }
  }


  // Dynamic Modals via NzModalService
  public openTemplateInfoModal(): void {
    this.modalService.create({
      nzTitle: this.t('MODALS.TEMPLATE_INFO_TITLE'),
      nzContent: TemplateInfoModalComponent,
      nzComponentParams: { template: this.store.currentTemplate },
      nzWidth: 500,
      nzFooter: [
        {
          label: this.t('COMMON.CLOSE'),
          type: 'primary',
          onClick: (inst) => inst?.closeModal(),
        },
      ],
    });
  }


  public openNotifyConfigModal(): void {
    this.modalService.create({
      nzTitle: this.t('MODALS.NOTIFY_CONFIG_TITLE'),
      nzContent: NotifyConfigModalComponent,
      nzWidth: 480,
      nzFooter: [
        {
          label: this.t('COMMON.CANCEL'),
          onClick: (inst) => inst?.closeModal(),
        },
        {
          label: this.t('MODALS.SAVE_CONFIG'),
          type: 'primary',
          onClick: (inst) => {
            inst?.closeModal();
          },
        },
      ],
    });
  }


  public openJsonPreviewModal(payload: any, title?: string): void {
    try {
      const fullMap = payload;
      this.store.lastSavedJson = JSON.stringify(fullMap, null, 2);
    } catch (err: any) {
      this.store.lastSavedJson = JSON.stringify(
        { error: err?.message || this.t('MODALS.SERIALIZE_ERROR') },
        null,
        2,
      );
    }

    this.modalService.create({
      nzTitle:
        title ||
        this.t('MODALS.JSON_DEBUG_TITLE'),
      nzContent: JsonPreviewModalComponent,
      nzComponentParams: { jsonPayload: this.store.lastSavedJson },
      nzWidth: 840,
      nzFooter: null,
    });
  }
}
