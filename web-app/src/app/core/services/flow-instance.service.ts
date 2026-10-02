import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '@core/http/api.service';

export type FlowInstanceStatus = 'RUNNING' | 'COMPLETED' | 'OVERDUE' | 'FAILED' | 'EXCEPTION' | 'CANCELLED';

export interface FlowInstanceItem {
  process_instance_id: string; // Mã định danh duy nhất của tiến trình
  business_key: string;        // Mã định danh nghiệp vụ (VD: số thuê bao 0903..., mã khiếu nại KN-...)
  template_id?: string;
  template_name: string;       // Tên quy trình
  version_no: string;          // Phiên bản hiệu lực (VD: V1.0, V2.1)
  status: FlowInstanceStatus;  // Trạng thái: RUNNING | COMPLETED | OVERDUE | FAILED | EXCEPTION
  current_step_name: string;   // Tên Node/bước đang dừng
  activity_id: string;         // ID của Activity/Node hiện tại
  current_owner: string;       // Người/bộ phận phụ trách duy nhất theo FR-13, US-20
  assignee?: string;           // Người phụ trách
  candidate_group?: string;    // Phòng ban phụ trách (VD: Phòng CSKH)
  started_at: string;          // Ngày giờ bắt đầu (ISO string)
  ended_at?: string;           // Ngày giờ kết thúc
  due_at: string;              // Thời hạn cam kết SLA
  sla_status?: 'normal' | 'warning' | 'overdue';
  trigger_source: string;      // Kênh tiếp nhận: Zalo, Facebook, SMS, IPCC 2.0, Webhook, MANUAL
  last_error_message?: string; // Thông tin lỗi nếu có sự cố
  variables?: Record<string, any>;
}

export interface FlowInstanceSummary {
  total: number;
  running: number;
  completed: number;
  overdue: number;
  failed: number;
}

export interface FlowTimelineItem {
  step_id: string;
  step_name: string;
  node_type: 'trigger' | 'task' | 'action' | 'condition' | 'split' | 'merge' | 'end';
  status: 'COMPLETED' | 'RUNNING' | 'FAILED' | 'SKIPPED' | 'WAITING';
  started_at: string;
  completed_at?: string;
  duration?: string;
  actor?: string;
  branch_reason?: string; // Lý do rẽ nhánh theo US-03, FR-12
  exception_detail?: {
    error_code?: string;
    message: string;
    stack_trace?: string;
    failed_at: string;
    retry_count?: number;
  };
  input_payload?: any;
  output_payload?: any;
}

export interface FlowInstanceFilter {
  search?: string;           // Tìm theo process_instance_id hoặc business_key
  template_id?: string;      // ID Template quy trình
  status?: string;           // Trạng thái: RUNNING, COMPLETED, OVERDUE, FAILED
  current_owner?: string;    // Người hoặc bộ phận phụ trách
  from_date?: string;        // Thời gian khởi tạo từ
  to_date?: string;          // Thời gian khởi tạo đến
  trigger_source?: string;   // Nguồn kích hoạt
  page: number;
  page_size: number;
}

export interface FlowInstanceListResponse {
  items: FlowInstanceItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface ProcessTemplateOption {
  id: string;
  code: string;
  name: string;
}

export interface AssigneeOption {
  id: string;
  name: string;
  department: string;
}

// ============================================================================
// [TRANG 2] LỊCH SỬ THỰC THI & AUDIT TRAIL (US-23)
// ============================================================================
export interface FlowHistoryItem {
  process_instance_id: string;
  business_key: string;
  template_id?: string;
  template_name: string;
  version_no: string;
  started_at: string;
  ended_at: string;
  duration: string;             // Tổng thời gian thực thi (VD: "12m 45s", "1h 10m")
  initiator: string;            // Người / Hệ thống khởi tạo
  final_approver?: string;      // Người phê duyệt / xử lý bước cuối
  final_status: 'COMPLETED' | 'CANCELLED' | 'FAILED' | 'TERMINATED';
  sla_compliance: 'MET' | 'BREACHED'; // Đạt SLA hay Trễ SLA
  audit_checksum?: string;      // Mã hash kiểm tra tính toàn vẹn (US-23)
  total_steps: number;
  channel: string;
}

export interface FlowHistoryFilter {
  search?: string;
  template_id?: string;
  final_status?: string;
  initiator?: string;
  from_date?: string;
  to_date?: string;
  sla_compliance?: string;
  page: number;
  page_size: number;
}

export interface FlowHistoryListResponse {
  items: FlowHistoryItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface VariableChangeRecord {
  variable_name: string;
  old_value: any;
  new_value: any;
  changed_by: string;
  changed_at: string;
  step_name: string;
}

export interface AuditTrailDetail {
  process_instance_id: string;
  business_key: string;
  template_name: string;
  version_no: string;
  started_at: string;
  ended_at: string;
  initiator: string;
  final_status: string;
  integrity_hash: string;
  steps: FlowTimelineItem[];
  variable_changes: VariableChangeRecord[];
}

// ============================================================================
// [TRANG 3] NHẬT KÝ LOG HỆ THỐNG (FR-15 IMMUTABLE LOGS)
// ============================================================================
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'FATAL' | 'DEBUG';

export interface SystemLogItem {
  log_id: string;
  timestamp: string;          // ISO string
  level: LogLevel;
  module: string;             // M1: Template | M2: Flow Engine | M3: Task | M4: Reports | Security
  service_name: string;       // Engine Service | IPCC Gateway | Webhook Worker | Auth Service
  trace_id: string;           // Distributed Trace ID
  process_instance_id?: string;
  action: string;             // EXECUTE_NODE | API_CALL | STATE_CHANGE | EXCEPTION
  message: string;
  actor: string;              // User ID / System Agent
  ip_address?: string;
  host_node?: string;
  payload?: any;
  stack_trace?: string;
}

export interface SystemLogFilter {
  search?: string;
  level?: string;
  module?: string;
  service_name?: string;
  from_date?: string;
  to_date?: string;
  trace_id?: string;
  page: number;
  page_size: number;
}

export interface SystemLogListResponse {
  items: SystemLogItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface SystemLogSummary {
  total: number;
  info: number;
  warn: number;
  error: number;
  fatal: number;
}

@Injectable({
  providedIn: 'root'
})
export class FlowInstanceService {
  private readonly endpoint = '/flow-instances';

  constructor(private apiService: ApiService) {}

  // --------------------------------------------------------------------------
  // 1. MÀN HÌNH GIÁM SÁT TIẾN TRÌNH THỜI GIAN THỰC (/instances/monitor)
  // --------------------------------------------------------------------------

  public getInstances(filter: FlowInstanceFilter): Observable<FlowInstanceListResponse> {
    let params = new HttpParams()
      .set('page', filter.page.toString())
      .set('page_size', filter.page_size.toString());

    if (filter.search && filter.search.trim()) {
      params = params.set('search', filter.search.trim());
    }
    if (filter.template_id) {
      params = params.set('template_id', filter.template_id);
    }
    if (filter.status && filter.status !== 'ALL') {
      params = params.set('status', filter.status);
    }
    if (filter.current_owner) {
      params = params.set('current_owner', filter.current_owner);
    }
    if (filter.from_date) {
      params = params.set('from_date', filter.from_date);
    }
    if (filter.to_date) {
      params = params.set('to_date', filter.to_date);
    }
    if (filter.trigger_source && filter.trigger_source !== 'ALL') {
      params = params.set('trigger_source', filter.trigger_source);
    }

    return this.apiService.get<FlowInstanceListResponse>(this.endpoint, params);
  }

  public getSummary(): Observable<FlowInstanceSummary> {
    return this.apiService.get<FlowInstanceSummary>(`${this.endpoint}/summary`);
  }

  public getInstanceDetail(instanceId: string): Observable<FlowInstanceItem> {
    return this.apiService.get<FlowInstanceItem>(`${this.endpoint}/${instanceId}`);
  }

  public getInstanceTimeline(instanceId: string): Observable<FlowTimelineItem[]> {
    return this.apiService.get<FlowTimelineItem[]>(`${this.endpoint}/${instanceId}/timeline`);
  }

  public retryStep(instanceId: string, activityId?: string): Observable<any> {
    return this.apiService.post(`${this.endpoint}/${instanceId}/retry`, {
      activity_id: activityId
    });
  }

  public cancelInstance(instanceId: string, reason: string): Observable<any> {
    return this.apiService.post(`${this.endpoint}/${instanceId}/cancel`, {
      reason
    });
  }

  public getTemplateOptions(): Observable<ProcessTemplateOption[]> {
    return this.apiService.get<ProcessTemplateOption[]>(`${this.endpoint}/templates`);
  }

  public getAssigneeOptions(): Observable<AssigneeOption[]> {
    return this.apiService.get<AssigneeOption[]>(`${this.endpoint}/assignees`);
  }

  // --------------------------------------------------------------------------
  // 2. MÀN HÌNH LỊCH SỬ THỰC THI & AUDIT (US-23) (/instances/history)
  // --------------------------------------------------------------------------

  public getExecutionHistory(filter: FlowHistoryFilter): Observable<FlowHistoryListResponse> {
    let params = new HttpParams()
      .set('page', filter.page.toString())
      .set('page_size', filter.page_size.toString());

    if (filter.search && filter.search.trim()) {
      params = params.set('search', filter.search.trim());
    }
    if (filter.template_id) {
      params = params.set('template_id', filter.template_id);
    }
    if (filter.final_status && filter.final_status !== 'ALL') {
      params = params.set('final_status', filter.final_status);
    }
    if (filter.initiator) {
      params = params.set('initiator', filter.initiator);
    }
    if (filter.from_date) {
      params = params.set('from_date', filter.from_date);
    }
    if (filter.to_date) {
      params = params.set('to_date', filter.to_date);
    }
    if (filter.sla_compliance && filter.sla_compliance !== 'ALL') {
      params = params.set('sla_compliance', filter.sla_compliance);
    }

    return this.apiService.get<FlowHistoryListResponse>(`${this.endpoint}/history`, params);
  }

  public getAuditTrail(instanceId: string): Observable<AuditTrailDetail> {
    return this.apiService.get<AuditTrailDetail>(`${this.endpoint}/${instanceId}/audit`);
  }

  // --------------------------------------------------------------------------
  // 3. MÀN HÌNH NHẬT KÝ LOG HỆ THỐNG (FR-15 IMMUTABLE LOGS) (/instances/logs)
  // --------------------------------------------------------------------------

  public getSystemLogs(filter: SystemLogFilter): Observable<SystemLogListResponse> {
    let params = new HttpParams()
      .set('page', filter.page.toString())
      .set('page_size', filter.page_size.toString());

    if (filter.search && filter.search.trim()) {
      params = params.set('search', filter.search.trim());
    }
    if (filter.level && filter.level !== 'ALL') {
      params = params.set('level', filter.level);
    }
    if (filter.module && filter.module !== 'ALL') {
      params = params.set('module', filter.module);
    }
    if (filter.service_name && filter.service_name !== 'ALL') {
      params = params.set('service_name', filter.service_name);
    }
    if (filter.from_date) {
      params = params.set('from_date', filter.from_date);
    }
    if (filter.to_date) {
      params = params.set('to_date', filter.to_date);
    }
    if (filter.trace_id) {
      params = params.set('trace_id', filter.trace_id);
    }

    return this.apiService.get<SystemLogListResponse>(`${this.endpoint}/logs`, params);
  }

  public getSystemLogSummary(): Observable<SystemLogSummary> {
    return this.apiService.get<SystemLogSummary>(`${this.endpoint}/logs/summary`);
  }

  public getLogDetail(logId: string): Observable<SystemLogItem> {
    return this.apiService.get<SystemLogItem>(`${this.endpoint}/logs/${logId}`);
  }
}
