import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { edgeAttrs } from '../config/edge-style.config';
import { normalizeNodeType } from '../models/node-type';
import { GraphEditorStore } from '../state/graph-editor.store';
import { GraphDialogService } from './graph-dialog.service';
import { TemplateService } from '@core/services/template.service';
import { FlowDraftMockService } from './flow-draft-mock.service';
import { NodeFactoryService } from './node-factory.service';
import { NodeEditorService } from './node-editor.service';
import { GraphHistoryService } from './graph-history.service';
import { FlowDefinition } from '../models/flow-definition.model';
import { toProcessInfoPayload } from '../models/process-info.model';
import { graphToFlowDefinition, buildSaveDraftPayload, parseFlowJson, flowNodeToNodeData, handleToPortId } from '../flow-definition/flow-definition.mapper';

/** Lưu nháp / Ban hành, vẽ lại flow từ response BE, mở dữ liệu canvas cũ. */
@Injectable()
export class FlowPersistenceService {
  constructor(
    private translate: TranslateService,
    private store: GraphEditorStore,
    private dialogs: GraphDialogService,
    private templateService: TemplateService,
    private flowDraftService: FlowDraftMockService,
    private factory: NodeFactoryService,
    private editor: NodeEditorService,
    private history: GraphHistoryService
  ) {}

  /** Dịch key trong PROCESS_GRAPH.* (xem i18n/vi.json, en.json) */
  private t(key: string, params?: Record<string, any>): string {
    return this.translate.instant('PROCESS_GRAPH.' + key, params);
  }


  public saveProcessTemplate(): void {
    if (!this.store.graph) return;
    const result = this.dialogs.validateGraph();
    if (!result.isValid) {
      this.dialogs.openValidationModal(result);
      this.store.selectedCellInfo = this.t('STATUS.CANNOT_SAVE', { count: result.errors.length });
      return;
    }

    const graphData = this.store.graph.toJSON();
    this.templateService.saveGraphData(this.store.currentTemplate.code, graphData);
    this.store.selectedCellInfo = this.t('STATUS.PUBLISHED', { code: this.store.currentTemplate.code });
    alert(
      this.t('MESSAGES.PUBLISH_SUCCESS', { code: this.store.currentTemplate.code, name: this.store.currentTemplate.name }),
    );
  }



  /** Dựng payload "Lưu nháp" (PUT /ticket-call-flows/{id}) từ canvas hiện tại */
  public buildSaveDraftPayload() {
    const definition = graphToFlowDefinition(this.store.graph);
    const payload = buildSaveDraftPayload(
      {
        // Tên / mô tả / cấu hình lấy từ tab "Thông tin chung"
        name: this.store.processInfo.name.trim(),
        description: this.store.processInfo.description,
        ...toProcessInfoPayload(this.store.processInfo),
        versionName: this.store.currentTemplate.version
          ? `Phiên bản ${this.store.currentTemplate.version}`
          : undefined,
        rowVersion: this.store.draftRowVersion,
      },
      definition,
    );
    return { payload, definition };
  }


  public saveDraft(): void {
    if (!this.store.graph) return;
    const { payload, definition } = this.buildSaveDraftPayload();
    console.log('[Lưu nháp] Payload gửi BE:', payload);
    console.log('[Lưu nháp] flowJson (đã parse):', definition);

    this.flowDraftService
      .saveDraft(this.store.currentTemplate.code, payload)
      .subscribe({
        next: (res) => {
          this.store.draftRowVersion = res.result.rowVersion;
          this.store.selectedCellInfo = this.t('STATUS.DRAFT_SAVED', { code: this.store.currentTemplate.code, rowVersion: res.result.rowVersion });
          // Hiển thị payload; flowJson parse ra object cho dễ đọc (gửi thật là chuỗi)
          this.dialogs.openJsonPreviewModal(
            { ...payload, flowJson: definition },
            this.t('MODALS.JSON_SAVE_DRAFT_TITLE'),
          );
        },
        error: (err) => {
          alert(this.t('MESSAGES.SAVE_DRAFT_FAILED', { error: err?.message || err }));
        },
      });
  }


  /** Mở lại bản nháp đã lưu (giả lập GET /ticket-call-flows/{id}). Trả false nếu chưa có bản nháp. */
  public loadSavedDraft(code: string): boolean {
    let loaded = false;
    this.flowDraftService.getFlow(code).subscribe((res) => {
      if (!res?.result) return;
      try {
        this.store.draftRowVersion = res.result.rowVersion;
        this.renderFlowDefinition(parseFlowJson(res.result));
        this.store.selectedCellInfo = this.t('STATUS.DRAFT_OPENED', { code, rowVersion: res.result.rowVersion });
        loaded = true;
      } catch (err) {
        console.warn('Không đọc được flowJson của bản nháp:', err);
      }
    });
    return loaded;
  }


  /** Vẽ lại canvas từ FlowDefinition (response BE) */
  public renderFlowDefinition(def: FlowDefinition): void {
    if (!this.store.graph) return;
    this.store.isUndoRedoAction = true;
    this.store.graph.clearCells();

    const dataById = new Map<string, any>();
    def.nodes.forEach((fn) => {
      const data = flowNodeToNodeData(fn, def.edges);
      dataById.set(fn.id, data);
      this.factory.createCompactCardNode(
        fn.type,
        fn.position?.x || 0,
        fn.position?.y || 0,
        fn.name || '',
        data,
      );
    });

    const joinInCount = new Map<string, number>();
    def.edges.forEach((e) => {
      const sourceData = dataById.get(e.source);
      const targetData = dataById.get(e.target);
      if (!sourceData || !targetData) return;

      let targetPort = 'in';
      if (targetData.type === 'JOIN') {
        const idx = joinInCount.get(e.target) || 0;
        joinInCount.set(e.target, idx + 1);
        targetPort = `in-merge-${idx % 2}`;
      }
      this.store.graph.addEdge({
        id: e.id,
        source: {
          cell: e.source,
          port: handleToPortId(sourceData.type, e.sourceHandle, sourceData),
        },
        target: { cell: e.target, port: targetPort },
        attrs: edgeAttrs(),
      });
    });

    if (def.viewport?.zoom) this.store.graph.zoomTo(def.viewport.zoom);
    this.store.graph.centerContent();
    this.store.isUndoRedoAction = false;
    this.editor.clearSelection();
    this.store.updateCounts();
    this.history.pushHistorySnapshot();
  }


  public loadGraphData(customJson?: any): void {
    if (!this.store.graph) return;
    try {
      if (customJson) {
        this.store.graph.fromJSON(customJson);
        // Dữ liệu canvas lưu trước đây dùng type cũ (trigger, task, condition...) → đổi sang type mới
        this.store.graph.getNodes()?.forEach((n: any) => {
          const d = n.getData() || {};
          n.setData({ ...d, type: normalizeNodeType(d.type, d.gatewayType) });
        });
        this.store.graph.getEdges()?.forEach((e: any) => e.setLabels([]));
        this.store.graph.centerContent();
        this.store.updateCounts();
      }
    } catch (err) {
      console.warn('Lỗi load graph data:', err);
    }
  }
}
