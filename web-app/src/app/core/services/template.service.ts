import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * ============================================================================
 * IPCC 2.0 FLOW SYSTEM - TEMPLATE MANAGEMENT SERVICE
 * ============================================================================
 * Quản lý vòng đời và dữ liệu của các Process Template (US-01, US-02, FR-07 -> FR-10, FR-25)
 * Kết nối tương tác trực tiếp giữa:
 * - Trang 1: Danh sách Template & Vòng đời (/templates/templates-management)
 * - Trang 2: Canvas Builder độc lập (/templates/graph)
 * ============================================================================
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
  published_at?: string; // DD/MM/YYYY HH:mm
  updatedAt?: string;
  active_instances_count?: number; // Dành cho FR-09: Kiểm tra chặn xóa nếu còn instance chạy dở
  versions?: TemplateVersionItem[];
  graphData?: any;
}

const DEFAULT_TEMPLATES: ProcessTemplateItem[] = [
  {
    code: 'PRC_COMPLAINT_BILLING',
    name: 'Quy trình xử lý khiếu nại cước di động trả sau đa phòng ban',
    category: 'Xử lý khiếu nại',
    version: 'V2.1',
    owner_org_id: 'ORG_CSKH_MB',
    owner_org_name: 'TT CSKH Miền Bắc',
    sla: '2h SLA',
    slaStatus: 'normal',
    status: 'Published',
    description: 'Quy trình tiếp nhận, tra cứu cước CDR, đối soát khuyến mãi và gửi SMS kết quả phản hồi khách hàng',
    published_at: '28/09/2026 14:30',
    updatedAt: '28/09/2026 14:30',
    active_instances_count: 14,
    versions: [
      {
        version_id: 'ver-103',
        version_no: 'V2.1',
        status: 'Published',
        published_at: '28/09/2026 14:30',
        created_by: 'Admin Hệ thống',
        changelog: 'Tối ưu nhánh rẽ Exclusive Gateway và tích hợp cổng lỗi Exception Path tự động',
        is_active: true
      },
      {
        version_id: 'ver-102',
        version_no: 'V2.0',
        status: 'Archived',
        published_at: '15/08/2026 09:00',
        created_by: 'Nguyễn Văn Quản trị',
        changelog: 'Bổ sung bước BO Duyệt phê duyệt hoàn cước',
        is_active: false
      },
      {
        version_id: 'ver-101',
        version_no: 'V1.0',
        status: 'Archived',
        published_at: '01/06/2026 08:30',
        created_by: 'Trần Thị Thu',
        changelog: 'Phiên bản ban đầu cho hệ thống IPCC 1.0',
        is_active: false
      }
    ]
  },
  {
    code: 'PRC_FTTH_SUPPORT',
    name: 'Hỗ trợ kỹ thuật truyền hình & Internet cáp quang FTTH',
    category: 'Cảnh báo chỉ số',
    version: 'V1.4',
    owner_org_id: 'ORG_KT_BROADBAND',
    owner_org_name: 'Phòng Kỹ thuật Broadband',
    sla: '4h SLA',
    slaStatus: 'warning',
    status: 'Published',
    description: 'Điều phối nhân viên kỹ thuật đo kiểm quang độ, reset port OLT và thay thế thiết bị ONT tại nhà',
    published_at: '27/09/2026 09:15',
    updatedAt: '27/09/2026 09:15',
    active_instances_count: 6,
    versions: [
      {
        version_id: 'ver-202',
        version_no: 'V1.4',
        status: 'Published',
        published_at: '27/09/2026 09:15',
        created_by: 'Trần Kỹ Thuật',
        changelog: 'Thêm kiểm tra suy hao OLT tự động trước khi điều xe',
        is_active: true
      },
      {
        version_id: 'ver-201',
        version_no: 'V1.0',
        status: 'Archived',
        published_at: '10/05/2026 10:00',
        created_by: 'Admin Hệ thống',
        changelog: 'Khởi tạo quy trình báo hỏng mạng FTTH',
        is_active: false
      }
    ]
  },
  {
    code: 'PRC_MNP_AUTOMATION',
    name: 'Chuyển mạng giữ số (MNP) tự động & Đồng bộ CSDL quốc gia',
    category: 'Chăm sóc sau tương tác',
    version: 'V1.0',
    owner_org_id: 'ORG_BILLING',
    owner_org_name: 'Trung tâm Đối soát & Tính cước',
    sla: '24h SLA',
    slaStatus: 'normal',
    status: 'Draft',
    description: 'Tự động kiểm tra điều kiện chuyển mạng, đồng bộ cơ sở dữ liệu chuyển mạng trung tâm quốc gia',
    published_at: '26/09/2026 16:45',
    updatedAt: '26/09/2026 16:45',
    active_instances_count: 0,
    versions: [
      {
        version_id: 'ver-301',
        version_no: 'V1.0',
        status: 'Draft',
        published_at: '26/09/2026 16:45',
        created_by: 'Phạm Thị Hương',
        changelog: 'Bản nháp đang cấu hình kiểm tra điều kiện thuê bao',
        is_active: true
      }
    ]
  },
  {
    code: 'PRC_TELESALES_UPGRADE',
    name: 'Happy Call khảo sát & Telesales nâng cấp gói cước băng rộng Home Mesh',
    category: 'Happy Call / Telesales',
    version: 'V1.2',
    owner_org_id: 'ORG_TELESALES',
    owner_org_name: 'Phòng Kinh doanh & Telesales',
    sla: '8h SLA',
    slaStatus: 'normal',
    status: 'Published',
    description: 'Phân phối danh sách khách hàng tiềm năng đến tổng đài viên, ghi nhận ý kiến và tạo đơn hàng gói cước mới',
    published_at: '25/09/2026 11:20',
    updatedAt: '25/09/2026 11:20',
    active_instances_count: 3,
    versions: [
      {
        version_id: 'ver-402',
        version_no: 'V1.2',
        status: 'Published',
        published_at: '25/09/2026 11:20',
        created_by: 'Lê Hoàng Yến',
        changelog: 'Tích hợp kịch bản gọi tự động Auto-Dialer',
        is_active: true
      },
      {
        version_id: 'ver-401',
        version_no: 'V1.0',
        status: 'Archived',
        published_at: '12/04/2026 15:00',
        created_by: 'Admin Hệ thống',
        changelog: 'Khởi tạo kịch bản Telesales',
        is_active: false
      }
    ]
  },
  {
    code: 'PRC_CSAT_SURVEY',
    name: 'Khảo sát mức độ hài lòng khách hàng (CSAT/NPS) sau cuộc gọi tổng đài',
    category: 'Khảo sát CSAT',
    version: 'V1.0',
    owner_org_id: 'ORG_CSKH_MN',
    owner_org_name: 'TT CSKH Miền Nam',
    sla: '1h SLA',
    slaStatus: 'normal',
    status: 'Inactive',
    description: 'Bắn tin nhắn SMS Brandname và gọi IVR Outbound tự động thu thập điểm đánh giá chất lượng phục vụ',
    published_at: '20/09/2026 10:00',
    updatedAt: '20/09/2026 10:00',
    active_instances_count: 0,
    versions: [
      {
        version_id: 'ver-501',
        version_no: 'V1.0',
        status: 'Inactive',
        published_at: '20/09/2026 10:00',
        created_by: 'Võ Minh Trí',
        changelog: 'Tạm ngưng khảo sát bảo trì kênh SMS Brandname',
        is_active: true
      }
    ]
  }
];

const DEFAULT_EXPERIMENTS: TemplateExperimentConfig[] = [
  {
    experiment_id: 'EXP-001',
    template_code: 'PRC_COMPLAINT_BILLING',
    template_name: 'Quy trình xử lý khiếu nại cước di động',
    version_a_id: 'ver-103',
    version_a_no: 'V2.1 (Hiện tại)',
    version_b_id: 'ver-102',
    version_b_no: 'V2.0 (Thử nghiệm)',
    ratio_a: 70,
    status: 'running',
    target_metric: 'FCR (Tỷ lệ xử lý ngay lần đầu)',
    started_at: '25/09/2026',
    description: 'Thử nghiệm phân bổ 70% luồng sang bản V2.1 tự động hóa API và 30% luồng theo V2.0 truyền thống.'
  }
];

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private readonly STORAGE_KEY = 'ipcc_process_templates_store';
  private readonly EXPERIMENT_KEY = 'ipcc_template_experiments_store';
  
  private templatesSubject = new BehaviorSubject<ProcessTemplateItem[]>([]);
  public templates$: Observable<ProcessTemplateItem[]> = this.templatesSubject.asObservable();

  private experimentsSubject = new BehaviorSubject<TemplateExperimentConfig[]>([]);
  public experiments$: Observable<TemplateExperimentConfig[]> = this.experimentsSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.templatesSubject.next(parsed);
        } else {
          this.templatesSubject.next([...DEFAULT_TEMPLATES]);
          this.saveToStorage();
        }
      } else {
        this.templatesSubject.next([...DEFAULT_TEMPLATES]);
        this.saveToStorage();
      }
    } catch {
      this.templatesSubject.next([...DEFAULT_TEMPLATES]);
    }

    try {
      const expRaw = localStorage.getItem(this.EXPERIMENT_KEY);
      if (expRaw) {
        const parsedExp = JSON.parse(expRaw);
        if (Array.isArray(parsedExp)) {
          this.experimentsSubject.next(parsedExp);
          return;
        }
      }
    } catch {}
    this.experimentsSubject.next([...DEFAULT_EXPERIMENTS]);
    this.saveExperimentsToStorage();
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.templatesSubject.value));
    } catch {}
  }

  private saveExperimentsToStorage(): void {
    try {
      localStorage.setItem(this.EXPERIMENT_KEY, JSON.stringify(this.experimentsSubject.value));
    } catch {}
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
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
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
      updatedAt: formattedDate,
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
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const updated = this.templatesSubject.value.map(t => {
      if (t.code.toUpperCase() === code.toUpperCase()) {
        return { 
          ...t, 
          ...updates, 
          updatedAt: formattedDate,
          published_at: updates.status === 'Published' ? formattedDate : t.published_at 
        };
      }
      return t;
    });
    this.templatesSubject.next(updated);
    this.saveToStorage();
  }

  /**
   * FR-10: Nhân bản quy trình
   * Tạo bản ghi mới ở trạng thái DRAFT giữ nguyên 100% cấu hình các Node và đường nối từ bản vẽ gốc
   */
  public cloneTemplate(sourceCode: string, newCode?: string, newName?: string, description?: string): ProcessTemplateItem | null {
    const original = this.getTemplateByCode(sourceCode);
    if (!original) return null;

    const finalCode = (newCode || `${original.code}_CLONE_${Math.floor(100 + Math.random() * 900)}`).toUpperCase();
    const finalName = newName || `${original.name} (Bản sao)`;
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

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
    return cloned;
  }

  /**
   * FR-08: Bật / Tắt quy trình
   * Ràng buộc nghiệp vụ: Khi tắt quy trình, hệ thống chỉ tạm dừng nhận các yêu cầu khởi tạo mới,
   * tuyệt đối không làm ảnh hưởng hoặc gián đoạn các Flow Instance đang chạy dở trước đó.
   */
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

  /**
   * FR-09: Xóa quy trình
   * Ràng buộc nghiệp vụ bắt buộc: Hệ thống kiểm tra và CHẶN XÓA (báo lỗi)
   * nếu Template này vẫn còn các Flow Instance đang trong tiến trình xử lý chưa kết thúc.
   */
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

  // ============================================================================
  // FR-25: A/B TESTING CONFIGURATION (Bảng template_experiment)
  // ============================================================================
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
