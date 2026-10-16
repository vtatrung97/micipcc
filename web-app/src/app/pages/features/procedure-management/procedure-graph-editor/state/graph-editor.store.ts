import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ProcessTemplateItem } from '@core/services/ticket-call-flows/template.service';
import { NodePropertyModel } from '../models/node-property.model';
import { GraphValidationResult } from '../config/ports.config';
import { ProcessInfo, ProcessInfoErrors, processInfoFromTemplate } from '../models/process-info.model';

/**
 * Trạng thái dùng chung của màn Canvas Builder (1 instance / 1 lần mở màn hình,
 * được provide ở GraphEditorComponent). Các service đọc / ghi state qua đây.
 */
@Injectable()
export class GraphEditorStore {
  public graph: any = null;

  // Node / edge đang chọn và dữ liệu drawer
  public selectedNode: any = null;
  public selectedCell: any = null;
  public isDrawerOpen = false;
  public selectedNodeProps: NodePropertyModel = {
    id: '',
    nodeKey: '',
    type: 'USER_TASK',
    typeTitle: 'Giao việc',
    label: '',
    icon: '👤',
    description: '',
  };

  // Thanh trạng thái / toolbar
  public selectedCellInfo: string;
  public nodeCount = 0;
  public edgeCount = 0;
  public currentZoom = 100;
  /** Chế độ chỉ xem (popup xem quy trình): không kéo / nối / xoá node */
  public isReadonly = false;
  public hasLocalData = false;
  public canvasMode: 'select' | 'pan' = 'select';

  // Undo / Redo
  public canUndo = false;
  public canRedo = false;
  /** true trong lúc undo/redo/vẽ lại: không ghi thêm lịch sử */
  public isUndoRedoAction = false;

  // Validate / JSON preview
  public validationResult: GraphValidationResult | null = null;
  public lastSavedJson: string | null = null;
  public showJsonPreview = false;

  /** rowVersion lần lưu nháp gần nhất (chống ghi đè) */
  public draftRowVersion?: number;

  /** Quy trình đang mở (giá trị mặc định khi chưa có ?id=) */
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
    active_instances_count: 5,
  };

  /** Dữ liệu tab "Thông tin chung" (dựng lại mỗi khi đổi currentTemplate) */
  public processInfo: ProcessInfo = processInfoFromTemplate(this.currentTemplate);
  /** Lỗi validate tab "Thông tin chung" (hiện sau khi bấm Lưu nháp / Ban hành) */
  public processInfoErrors: ProcessInfoErrors = {};
  /** Đang tạo mới (vào từ "Tạo mới quy trình", chưa có bản ghi) */
  public isCreateMode = false;

  public readonly STORAGE_KEY = 'x6_workflow_graph_data';

  constructor(translate: TranslateService) {
    this.selectedCellInfo = translate.instant('PROCESS_GRAPH.STATUS.READY');
  }

  /** Cập nhật số node / edge trên thanh trạng thái */
  public updateCounts(): void {
    if (!this.graph) return;
    this.nodeCount = this.graph.getNodes().length;
    this.edgeCount = this.graph.getEdges().length;
    this.hasLocalData = !!localStorage.getItem(this.STORAGE_KEY);
  }
}
