import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { edgeAttrs } from '../config/edge-style.config';
import { normalizeNodeType } from '../models/node-type';
import { GraphEditorStore } from '../state/graph-editor.store';
import { GraphDialogService } from './graph-dialog.service';
import { TemplateService } from '@core/services/ticket-call-flows/template.service';
import {
  CoreService,
  TicketCallFlowCreateRequest,
  TicketCallFlowUpdateRequest,
  SlaUnit,
  TriggerDto
} from '@core/services/core-service/core-service.service';
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
    private coreService: CoreService,
    private factory: NodeFactoryService,
    private editor: NodeEditorService,
    private history: GraphHistoryService,
    private message: NzMessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /** Dịch key trong PROCESS_GRAPH.* (xem i18n/vi.json, en.json) */
  private t(key: string, params?: Record<string, any>): string {
    return this.translate.instant('PROCESS_GRAPH.' + key, params);
  }

  private mapSlaUnit(unit?: string): SlaUnit {
    if (unit === 'Giờ' || unit === 'HOUR') return 'HOUR';
    if (unit === 'Ngày' || unit === 'DAY') return 'DAY';
    if (unit === 'Phút' || unit === 'MINUTE') return 'MINUTE';
    return 'HOUR';
  }

  /** Ban hành: hợp lệ thì lưu draft trước nếu cần, sau đó gọi publish API */
  public saveProcessTemplate(): boolean {
    if (!this.store.graph || !this.ensureValid()) return false;
    const definition = graphToFlowDefinition(this.store.graph);
    const flowJsonStr = JSON.stringify(definition);

    const info = this.store.processInfo;
    const slaVal = Number(info.slaValue) || 24;
    const slaU = this.mapSlaUnit(info.slaUnit);

    const triggerDto: TriggerDto = {
      triggerType: info.triggerType || 'MANUAL',
      conditionExpression: info.triggerType === 'AUTO' && info.auto?.conditions?.rules?.length
        ? JSON.stringify(info.auto.conditions)
        : undefined
    };

    if (this.store.isCreateMode) {
      const createReq: TicketCallFlowCreateRequest = {
        code: info.code.trim().toUpperCase(),
        name: info.name.trim(),
        category: info.category || 'Xử lý khiếu nại',
        description: info.description,
        trigger: triggerDto,
        slaValue: slaVal,
        slaUnit: slaU,
        status: 'ACTIVE',
        flowJson: flowJsonStr
      };

      this.coreService.createTicketCallFlow(createReq).subscribe({
        next: (res) => {
          const result = res?.result || res?.data || res;
          this.store.isCreateMode = false;
          this.store.draftRowVersion = result.rowVersion || 1;
          const flowId = String(result.id || result.templateId || createReq.code);
          const versionId = String(result.flowJsonVersionId || result.templateVersionId || '1');
          this.store.currentTemplate = {
            ...this.store.currentTemplate,
            id: flowId,
            code: result.code || createReq.code,
            name: result.name || createReq.name,
            active_version_id: versionId,
            status: 'Published'
          };
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { id: flowId, mode: null, initType: null },
            queryParamsHandling: 'merge',
            replaceUrl: true
          });
          this.publishVersion(flowId, versionId);
        },
        error: (err) => {
          this.message.error(err?.error?.message || err?.message || 'Lỗi khi tạo quy trình để ban hành');
        }
      });
    } else {
      const flowId = this.store.currentTemplate.id || this.store.currentTemplate.code;
      const versionId = this.store.currentTemplate.active_version_id || '1';

      const updateReq: TicketCallFlowUpdateRequest = {
        name: info.name.trim(),
        category: info.category || undefined,
        description: info.description,
        trigger: triggerDto,
        slaValue: slaVal,
        slaUnit: slaU,
        status: 'ACTIVE',
        flowJson: flowJsonStr,
        rowVersion: this.store.draftRowVersion
      };

      this.coreService.updateTicketCallFlowVersion(flowId, versionId, updateReq).subscribe({
        next: (res) => {
          const result = res?.result || res?.data || res;
          if (result?.rowVersion != null) {
            this.store.draftRowVersion = result.rowVersion;
          }
          this.publishVersion(flowId, versionId);
        },
        error: (err) => {
          this.message.error(err?.error?.message || err?.message || 'Lỗi khi lưu quy trình trước khi ban hành');
        }
      });
    }
    return true;
  }

  private publishVersion(flowId: string | number, versionId: string | number): void {
    this.coreService.publishTicketCallFlowVersion(flowId, versionId, { rowVersion: this.store.draftRowVersion }).subscribe({
      next: () => {
        this.store.currentTemplate = {
          ...this.store.currentTemplate,
          status: 'Published'
        };
        this.store.selectedCellInfo = this.t('STATUS.PUBLISHED', { code: this.store.currentTemplate.code });
        this.message.success(
          this.t('MESSAGES.PUBLISH_SUCCESS', {
            code: this.store.currentTemplate.code,
            name: this.store.currentTemplate.name
          })
        );
      },
      error: (err) => {
        this.message.error('Ban hành thất bại: ' + (err?.error?.message || err?.message || 'Có lỗi xảy ra'));
      }
    });
  }

  /** Kiểm tra trường bắt buộc + nguyên tắc nối bước; sai thì mở danh sách lỗi (bấm để tới bước lỗi) */
  private ensureValid(): boolean {
    const result = this.dialogs.validateGraph();
    if (result.isValid) return true;
    this.dialogs.openValidationModal(result);
    this.store.selectedCellInfo = this.t('STATUS.CANNOT_SAVE', { count: result.errors.length });
    return false;
  }

  /** Dựng payload "Lưu nháp" từ canvas hiện tại */
  public buildSaveDraftPayload() {
    const definition = graphToFlowDefinition(this.store.graph);
    const payload = buildSaveDraftPayload(
      {
        name: this.store.processInfo.name.trim(),
        description: this.store.processInfo.description,
        ...toProcessInfoPayload(this.store.processInfo),
        versionName: this.store.currentTemplate.version
          ? `Phiên bản ${String(this.store.currentTemplate.version).replace(/^v/i, '')}`
          : undefined,
        rowVersion: this.store.draftRowVersion,
      },
      definition,
    );
    return { payload, definition };
  }

  /** Lưu nháp: kiểm tra như Ban hành; gửi lên API BE */
  public saveDraft(): boolean {
    if (!this.store.graph || !this.ensureValid()) return false;
    const definition = graphToFlowDefinition(this.store.graph);
    const flowJsonStr = JSON.stringify(definition);

    const info = this.store.processInfo;
    const slaVal = Number(info.slaValue) || 24;
    const slaU = this.mapSlaUnit(info.slaUnit);

    const triggerDto: TriggerDto = {
      triggerType: info.triggerType || 'MANUAL',
      conditionExpression: info.triggerType === 'AUTO' && info.auto?.conditions?.rules?.length
        ? JSON.stringify(info.auto.conditions)
        : undefined
    };

    if (this.store.isCreateMode) {
      const createReq: TicketCallFlowCreateRequest = {
        code: info.code.trim().toUpperCase(),
        name: info.name.trim(),
        category: info.category || 'Xử lý khiếu nại',
        description: info.description,
        trigger: triggerDto,
        slaValue: slaVal,
        slaUnit: slaU,
        status: 'DRAFT',
        flowJson: flowJsonStr
      };

      this.coreService.createTicketCallFlow(createReq).subscribe({
        next: (res) => {
          const result = res?.result || res?.data || res;
          this.store.isCreateMode = false;
          this.store.draftRowVersion = result?.rowVersion || 1;
          const flowId = String(result?.id || result?.templateId || createReq.code);
          const versionId = String(result?.flowJsonVersionId || result?.templateVersionId || '1');
          this.store.currentTemplate = {
            ...this.store.currentTemplate,
            id: flowId,
            code: result?.code || createReq.code,
            name: result?.name || createReq.name,
            active_version_id: versionId,
            status: 'Draft'
          };
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { id: flowId, mode: null, initType: null },
            queryParamsHandling: 'merge',
            replaceUrl: true
          });
          this.message.success(this.t('STATUS.DRAFT_SAVED', { code: this.store.currentTemplate.code, rowVersion: this.store.draftRowVersion }));
        },
        error: (err) => {
          this.message.error(this.t('MESSAGES.SAVE_DRAFT_FAILED', { error: err?.error?.message || err?.message || 'Có lỗi xảy ra' }));
        }
      });
    } else {
      const flowId = this.store.currentTemplate.id || this.store.currentTemplate.code;
      const versionId = this.store.currentTemplate.active_version_id || '1';

      const updateReq: TicketCallFlowUpdateRequest = {
        name: info.name.trim(),
        category: info.category || undefined,
        description: info.description,
        trigger: triggerDto,
        slaValue: slaVal,
        slaUnit: slaU,
        status: 'DRAFT',
        flowJson: flowJsonStr,
        versionName: this.store.currentTemplate.version
          ? `Phiên bản ${String(this.store.currentTemplate.version).replace(/^v/i, '')}`
          : undefined,
        rowVersion: this.store.draftRowVersion
      };

      this.coreService.updateTicketCallFlowVersion(flowId, versionId, updateReq).subscribe({
        next: (res) => {
          const result = res?.result || res?.data || res;
          if (result?.rowVersion != null) {
            this.store.draftRowVersion = result.rowVersion;
          }
          this.message.success(this.t('STATUS.DRAFT_SAVED', { code: this.store.currentTemplate.code, rowVersion: this.store.draftRowVersion }));
        },
        error: (err) => {
          this.message.error(this.t('MESSAGES.SAVE_DRAFT_FAILED', { error: err?.error?.message || err?.message || 'Có lỗi xảy ra' }));
        }
      });
    }
    return true;
  }

  /** Mở lại bản nháp đã lưu từ API GET /ticket-call-flows/{id}. Trả false nếu chưa có. */
  public loadSavedDraft(codeOrId: string): boolean {
    let loaded = false;
    this.coreService.getTicketCallFlowById(codeOrId).subscribe({
      next: (res) => {
        const item = res?.result || res?.data || res;
        if (!item?.flowJson) return;
        try {
          this.store.draftRowVersion = item.rowVersion;
          this.store.currentTemplate = {
            ...this.store.currentTemplate,
            id: String(item.id || ''),
            code: item.code || this.store.currentTemplate.code,
            name: item.name || this.store.currentTemplate.name,
            active_version_id: String(item.flowJsonVersionId || item.templateVersionId || '1'),
            status: item.status === 'ACTIVE' || item.status === 'PUBLISHED' ? 'Published' : (item.status === 'INACTIVE' ? 'Inactive' : 'Draft')
          };
          this.renderFlowDefinition(parseFlowJson(item));
          this.store.selectedCellInfo = this.t('STATUS.DRAFT_OPENED', { code: item.code || codeOrId, rowVersion: item.rowVersion });
          loaded = true;
        } catch (err) {
          console.warn('Không đọc được flowJson:', err);
        }
      },
      error: (err) => {
        console.warn('Không tải được quy trình từ API:', err);
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
