import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { CoreService, TicketCallFlowSearchRequest } from '@core/services/core-service/core-service.service';

/** Thời điểm dạng 'DD/MM/YYYY HH:mm:ss' (định dạng ngày giờ của danh sách quy trình) */
function formatDateTime(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/**
 * Quản lý vòng đời và dữ liệu Process Template (US-01, US-02, FR-07 → FR-10, FR-25).
 * Dùng chung cho màn danh sách template và Canvas Builder.
 */

export interface TemplateVersionItem {
  version_id: string;
  version_no: string; // e.g. "V1.0", "V1.1", "V2.1"
  status: 'Published' | 'Draft' | 'Archived' | 'Inactive';
  published_at: string;
  created_by: string;
  changelog: string;
  is_active: boolean;
  graphData?: any;
}

export interface TemplateExperimentConfig {
  experiment_id: string;
  template_code: string;
  template_name: string;
  version_a_id: string;
  version_a_no: string;
  version_b_id: string;
  version_b_no: string;
  ratio_a: number; // e.g. 50 (%) -> Version B gets 100 - ratio_a
  status: 'running' | 'paused' | 'draft';
  target_metric: string; // 'CSAT Score' | 'FCR (Giải quyết lần đầu)' | 'AHT (Thời gian xử lý)'
  started_at: string;
  description?: string;
}

export interface ProcessTemplateItem {
  id?: string;
  code: string; // e.g. "PRC_COMPLAINT_BILLING"
  name: string;
  category?: string; // 'Xử lý khiếu nại' | 'Cảnh báo chỉ số' | 'Chăm sóc sau tương tác' | 'Happy Call / Telesales' | 'Khảo sát CSAT'
  version: string; // e.g. "V2.1"
  active_version_id?: string;
  owner_org_id?: string; // e.g. "ORG_CSKH_MB"
  owner_org_name?: string; // e.g. "TT CSKH Miền Bắc"
  sla: string;
  slaStatus: 'normal' | 'warning' | 'danger' | 'overdue' | 'success';
  status: 'Published' | 'Draft' | 'Inactive';
  description: string;
  published_at?: string; // DD/MM/YYYY HH:mm[:ss]
  published_by?: string;
  created_at?: string; // DD/MM/YYYY HH:mm[:ss]
  created_by?: string;
  updatedAt?: string;
  updated_by?: string;
  active_instances_count?: number; // FR-09: chặn xóa nếu còn instance chạy dở
  // Tab "Thông tin chung" của Canvas Builder (process-graph/models/process-info.model.ts)
  triggerType?: 'MANUAL' | 'AUTO' | 'SCHEDULE' | 'HYBRID' | null;
  triggerConfig?: {
    manual?: { inputFormId: string | null };
    auto?: {
      apiId: string | null;
      conditions: { logicOperator: 'AND' | 'OR'; rules: { param: string; operator: string; value: string }[] };
    };
    schedule?: { mode: 'ONCE' | 'REPEAT'; runDate: string; runTime: string; repeat?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | null; weekDays?: number[]; monthDays?: number[] };
    hybrid?: {
      apiId: string | null;
      inputFormId: string | null;
      conditions?: { logicOperator: 'AND' | 'OR'; rules: { param: string; operator: string; value: string }[] };
    };
  } | null;
  slaValue?: number | null;
  slaUnit?: string;
  versions?: TemplateVersionItem[];
  graphData?: any;
  /** Thiết kế quy trình dạng FlowDefinition (FLOW_SCHEMA.md) — dùng vẽ canvas khi chưa có bản nháp */
  flowDefinition?: any;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private readonly endpoint = '/ticket-call-flows';
  private readonly STORAGE_KEY = 'ipcc_process_templates_store_v5';
  private readonly EXPERIMENT_KEY = 'ipcc_template_experiments_store';

  private templatesSubject = new BehaviorSubject<ProcessTemplateItem[]>([]);
  public templates$: Observable<ProcessTemplateItem[]> = this.templatesSubject.asObservable();

  private experimentsSubject = new BehaviorSubject<TemplateExperimentConfig[]>([]);
  public experiments$: Observable<TemplateExperimentConfig[]> = this.experimentsSubject.asObservable();

  constructor(
    private coreService: CoreService,
    private http: HttpClient
  ) {
    this.loadFromStorage();
  }

  public fetchTemplatesFromApi(request?: TicketCallFlowSearchRequest): Observable<ProcessTemplateItem[]> {
    return this.coreService.searchTicketCallFlows(request || { page: 0, size: 100 }).pipe(
      map(res => {
        const content = res?.data?.content || res?.result?.content || res?.content || (Array.isArray(res?.result) ? res.result : (Array.isArray(res) ? res : []));
        if (Array.isArray(content) && content.length > 0) {
          return content.map(item => this.mapApiItemToProcessTemplate(item));
        }
        return [];
      }),
      catchError(err => {
        console.warn('Lỗi khi tải danh sách quy trình từ API:', err);
        return of(this.templatesSubject.value || []);
      }),
      tap(templates => {
        this.templatesSubject.next(templates);
      })
    );
  }

  public mapApiItemToProcessTemplate(item: any): ProcessTemplateItem {
    const statusMap: Record<string, 'Published' | 'Draft' | 'Inactive'> = {
      ACTIVE: 'Published',
      PUBLISHED: 'Published',
      Published: 'Published',
      INACTIVE: 'Inactive',
      Inactive: 'Inactive',
      DRAFT: 'Draft',
      Draft: 'Draft'
    };

    const slaStatusMap: Record<string, 'normal' | 'warning' | 'danger' | 'overdue' | 'success'> = {
      normal: 'normal',
      warning: 'warning',
      danger: 'danger',
      overdue: 'overdue',
      success: 'success'
    };

    return {
      id: String(item.id || item.templateId || ''),
      code: item.code || '',
      name: item.name || '',
      category: item.category || 'Xử lý khiếu nại',
      version: item.versionName || (item.versionNo ? `V${item.versionNo}` : 'V1.0'),
      active_version_id: item.templateVersionId,
      owner_org_id: item.owner_org_id || 'ORG_CSKH',
      owner_org_name: item.owner_org_name || 'TT CSKH',
      sla: item.sla || `${item.slaValue || 0} ${item.slaUnit || 'HOUR'}`,
      slaStatus: slaStatusMap[item.slaStatus] || 'normal',
      status: statusMap[item.status] || 'Draft',
      description: item.description || '',
      published_at: item.publishedAt ? (typeof item.publishedAt === 'number' ? formatDateTime(new Date(item.publishedAt)) : item.publishedAt) : undefined,
      published_by: item.publishedBy,
      created_at: item.createdAt ? (typeof item.createdAt === 'number' ? formatDateTime(new Date(item.createdAt)) : item.createdAt) : undefined,
      created_by: item.createdBy,
      updatedAt: item.updatedAt ? (typeof item.updatedAt === 'number' ? formatDateTime(new Date(item.updatedAt)) : item.updatedAt) : undefined,
      updated_by: item.updatedBy,
      active_instances_count: item.active_instances_count || 0,
      triggerType: item.triggerType || item.trigger?.triggerType || 'MANUAL',
      triggerConfig: item.triggerConfig || null,
      slaValue: item.slaValue,
      slaUnit: item.slaUnit,
      flowDefinition: item.flowJson ? (typeof item.flowJson === 'string' ? JSON.parse(item.flowJson) : item.flowJson) : null
    };
  }

  private loadFromStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.EXPERIMENT_KEY);
      // Xoá tất cả key mock flow draft cũ
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('mock_flow_draft_') || key.startsWith('ipcc_process_templates_store'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}
    this.templatesSubject.next([]);
  }

  private saveToStorage(): void {
    // Không lưu vào localStorage, dữ liệu quản lý qua API Backend
  }

  private saveExperimentsToStorage(): void {
    // Không lưu vào localStorage
  }

  public getTemplates(): ProcessTemplateItem[] {
    return this.templatesSubject.value;
  }

  public getTemplateByCode(code: string): ProcessTemplateItem | undefined {
    return this.templatesSubject.value.find(t => t.code.toUpperCase() === code.toUpperCase());
  }

  public createTemplate(item: Partial<ProcessTemplateItem>): ProcessTemplateItem {
    const current = this.templatesSubject.value;
    const now = new Date();
    const formattedDate = formatDateTime(now);

    const newCode = (item.code || `PRC_${String(current.length + 1).padStart(3, '0')}`).toUpperCase();
    const initialVersion: TemplateVersionItem = {
      version_id: `ver-${Date.now()}`,
      version_no: item.version || 'V1.0',
      status: (item.status as any) || 'Draft',
      published_at: formattedDate,
      created_by: 'Admin Người dùng',
      changelog: 'Khởi tạo quy trình mới',
      is_active: true
    };

    const newTemplate: ProcessTemplateItem = {
      code: newCode,
      name: item.name || 'Quy trình mới',
      category: item.category || 'Xử lý khiếu nại',
      version: item.version || 'V1.0',
      owner_org_id: item.owner_org_id || 'ORG_CSKH_MB',
      owner_org_name: item.owner_org_name || 'TT CSKH Miền Bắc',
      sla: item.sla || '4h SLA',
      slaStatus: item.slaStatus || 'normal',
      status: item.status || 'Draft',
      description: item.description || '',
      published_at: formattedDate,
      created_at: formattedDate,
      created_by: 'Admin Người dùng',
      updatedAt: formattedDate,
      updated_by: 'Admin Người dùng',
      active_instances_count: 0,
      versions: [initialVersion],
      graphData: item.graphData || null
    };

    const updated = [newTemplate, ...current.filter(t => t.code !== newCode)];
    this.templatesSubject.next(updated);
    this.saveToStorage();
    return newTemplate;
  }

  public updateTemplate(code: string, updates: Partial<ProcessTemplateItem>): void {
    const now = new Date();
    const formattedDate = formatDateTime(now);

    const updated = this.templatesSubject.value.map(t => {
      if (t.code.toUpperCase() === code.toUpperCase()) {
        return {
          ...t,
          ...updates,
          updatedAt: formattedDate,
          updated_by: updates.updated_by || 'Admin Người dùng',
          published_at: updates.status === 'Published' ? formattedDate : t.published_at
        };
      }
      return t;
    });
    this.templatesSubject.next(updated);
    this.saveToStorage();
  }

  /** FR-10: Nhân bản quy trình */
  public cloneTemplate(sourceCode: string, newCode?: string, newName?: string, description?: string): ProcessTemplateItem | null {
    const original = this.getTemplateByCode(sourceCode);
    if (!original) return null;

    const finalCode = (newCode || `${original.code}_CLONE_${Math.floor(100 + Math.random() * 900)}`).toUpperCase();
    const finalName = newName || `${original.name} (Bản sao)`;
    const now = new Date();
    const formattedDate = formatDateTime(now);

    const cloned = this.createTemplate({
      code: finalCode,
      name: finalName,
      category: original.category,
      version: 'V1.0-draft',
      owner_org_id: original.owner_org_id,
      owner_org_name: original.owner_org_name,
      sla: original.sla,
      slaStatus: original.slaStatus,
      status: 'Draft',
      description: description || `Nhân bản từ ${original.code}: ${original.description}`,
      graphData: original.graphData ? JSON.parse(JSON.stringify(original.graphData)) : null,
      published_at: formattedDate,
      active_instances_count: 0
    });
    // Sao chép nốt cấu hình kích hoạt, thời hạn xử lý và thiết kế quy trình
    const copy = <T>(v: T): T => (v == null ? v : JSON.parse(JSON.stringify(v)));
    Object.assign(cloned, {
      triggerType: original.triggerType ?? null,
      triggerConfig: copy(original.triggerConfig),
      slaValue: original.slaValue ?? null,
      slaUnit: original.slaUnit,
      flowDefinition: copy(original.flowDefinition)
    });
    this.templatesSubject.next([...this.templatesSubject.value]);
    this.saveToStorage();
    return cloned;
  }

  /** FR-08: Bật / tắt quy trình */
  public toggleStatus(code: string): { success: boolean; newStatus: 'Published' | 'Inactive'; message: string } {
    const template = this.getTemplateByCode(code);
    if (!template) {
      return { success: false, newStatus: 'Inactive', message: 'Không tìm thấy quy trình.' };
    }
    const nextStatus = template.status === 'Published' ? 'Inactive' : 'Published';
    this.updateTemplate(code, { status: nextStatus });

    const message = nextStatus === 'Inactive'
      ? `Đã tạm dừng quy trình [${template.code}]. Hệ thống tạm ngưng nhận yêu cầu mới, các Flow Instance đang chạy vẫn tiếp tục xử lý bình thường (FR-08).`
      : `Đã kích hoạt vận hành quy trình [${template.code}] (Published).`;

    return { success: true, newStatus: nextStatus, message };
  }

  /** FR-09: Xóa quy trình, chặn nếu còn instance đang chạy */
  public deleteTemplate(code: string): { success: boolean; message: string; activeInstances?: number } {
    const template = this.getTemplateByCode(code);
    if (!template) {
      return { success: false, message: 'Quy trình không tồn tại.' };
    }

    if (template.active_instances_count && template.active_instances_count > 0) {
      return {
        success: false,
        activeInstances: template.active_instances_count,
        message: `Không thể xóa quy trình [${template.code}]! Hiện tại đang có ${template.active_instances_count} tiến trình (Flow Instance) đang chạy dở chưa kết thúc theo quy định BR-TMP-09.`
      };
    }

    const updated = this.templatesSubject.value.filter(t => t.code.toUpperCase() !== code.toUpperCase());
    this.templatesSubject.next(updated);
    this.saveToStorage();
    return {
      success: true,
      message: `Đã xóa thành công quy trình [${template.code} - ${template.name}].`
    };
  }

  public saveGraphData(code: string, graphData: any): void {
    this.updateTemplate(code, { graphData });
  }

  // ===== FR-25: cấu hình A/B testing =====
  public getExperiments(): TemplateExperimentConfig[] {
    return this.experimentsSubject.value;
  }

  public saveExperiment(exp: TemplateExperimentConfig): void {
    const current = this.experimentsSubject.value;
    const exists = current.some(e => e.experiment_id === exp.experiment_id);
    let updated: TemplateExperimentConfig[];
    if (exists) {
      updated = current.map(e => e.experiment_id === exp.experiment_id ? exp : e);
    } else {
      updated = [exp, ...current];
    }
    this.experimentsSubject.next(updated);
    this.saveExperimentsToStorage();
  }

  public toggleExperimentStatus(experimentId: string): void {
    const current = this.experimentsSubject.value;
    const updated = current.map(e => {
      if (e.experiment_id === experimentId) {
        return {
          ...e,
          status: (e.status === 'running' ? 'paused' : 'running') as 'running' | 'paused'
        };
      }
      return e;
    });
    this.experimentsSubject.next(updated);
    this.saveExperimentsToStorage();
  }
}
