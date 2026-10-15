import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { KEYCLOAK, SERVICES } from '@env/environment';
import { ResponseEnvelope } from '@core/models/response.model';
import { ToastService } from '@core/services/toast-service';
import { AbstractService } from '@core/services/abstract.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap } from 'rxjs/operators';

// ==========================================
// COMMON MODELS & ENVELOPES
// ==========================================

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
  requestId?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ==========================================
// CORE SERVICE - TICKET CALL FLOW MODELS
// ==========================================

export type SlaUnit = 'HOUR' | 'DAY' | 'MINUTE';
export type FlowStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';
export type VersionStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface TriggerDto {
  triggerType: string;
  eventSource?: string;
  conditionExpression?: string;
}

export interface TicketCallFlowSearchRequest {
  keyword?: string;
  name?: string;
  code?: string;
  status?: FlowStatus;
  versionStatus?: VersionStatus;
  versionNo?: number;
  updatedFrom?: number;
  updatedTo?: number;
  publishedFrom?: number;
  publishedTo?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  size?: number;
  [key: string]: any;
}

export interface TicketCallFlowCreateRequest {
  code: string;
  name: string;
  category: string;
  description?: string;
  trigger: TriggerDto;
  slaValue: number;
  slaUnit: SlaUnit;
  status?: FlowStatus;
  flowJson: string;
}

export interface TicketCallFlowUpdateRequest {
  name: string;
  category?: string;
  description?: string;
  trigger?: TriggerDto;
  slaValue?: number;
  slaUnit?: SlaUnit;
  status?: FlowStatus;
  flowJson: string;
  versionName?: string;
  versionDescription?: string;
  rowVersion?: number;
}

export interface TicketCallFlowPublishRequest {
  rowVersion?: number;
  versionName?: string;
  versionDescription?: string;
}

export interface TicketCallFlowCloneRequest {
  code: string;
  name: string;
  description?: string;
}

export interface TicketCallFlowStatsResponse {
  total: number;
  active: number;
  hasDraft: number;
}

export interface TicketCallFlowSummaryResponse {
  templateId: string;
  templateVersionId: string;
  code: string;
  name: string;
  category: string;
  description: string;
  status: FlowStatus;
  triggerType: string;
  slaValue: number;
  slaUnit: SlaUnit;
  versionNo: number;
  versionStatus: VersionStatus;
  versionName: string;
  publishedAt?: number;
  publishedBy?: string;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  updatedBy: string;
  rowVersion: number;
}

export interface TicketCallFlowVersionSummaryResponse {
  id: string;
  versionNo: number;
  status: VersionStatus;
  versionName: string;
  versionDescription: string;
  publishedAt?: number;
  publishedBy?: string;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  updatedBy: string;
}

export interface TicketCallFlowVersionResponse {
  flowId: string;
  id: string;
  versionNo: number;
  status: VersionStatus;
  versionName: string;
  versionDescription: string;
  flowJson: string;
  publishedAt?: number;
  publishedBy?: string;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  updatedBy: string;
}

export interface TicketCallFlowResponse {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  status: FlowStatus;
  trigger: TriggerDto;
  slaValue: number;
  slaUnit: SlaUnit;
  flowJson: string;
  flowJsonVersionId: string;
  flowJsonVersionNo: number;
  flowJsonVersionStatus: VersionStatus;
  publishedVersion?: TicketCallFlowVersionSummaryResponse;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  updatedBy: string;
  rowVersion: number;
}

// ==========================================
// OTHER CORE MODELS: AGENT, GROUP, APP PARAM
// ==========================================

export interface AgentGroupResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  status?: string;
}

export interface AgentResponse {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  status?: string;
}

export interface KeycloakGroupResponse {
  id: string;
  name: string;
  path?: string;
}

export interface AppParamResponse {
  id: number;
  code: string;
  name: string;
  type: string;
  value?: string;
  description?: string;
  status?: string;
}

export interface AppParamCreateRequest {
  code: string;
  name: string;
  type: string;
  value?: string;
  description?: string;
  status?: string;
}

// ==========================================
// CORE SERVICE
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class CoreService extends AbstractService {

  constructor(
    private http: HttpClient,
    private toastSvc: ToastService,
    private translate: TranslateService
  ) {
    super(http, toastSvc, translate);
  }

  get SERVICE_URL(): string {
    return `${(SERVICES?.CORE_SERVICE_API?.url || '').replace(/\/+$/, '')}/api/v1`;
  }

  // --------------------------------------------------
  // 1. TICKET CALL FLOWS (10 Endpoints)
  // --------------------------------------------------

  /** GET /api/v1/ticket-call-flows: Tìm kiếm / phân trang danh sách quy trình */
  searchTicketCallFlows(request?: TicketCallFlowSearchRequest): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/ticket-call-flows`, { params: request });
  }

  /** GET /api/v1/ticket-call-flows/stats: Thống kê số lượng */
  getTicketCallFlowStats(): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/ticket-call-flows/stats`);
  }

  /** GET /api/v1/ticket-call-flows/{id}: Chi tiết quy trình kèm flowJson */
  getTicketCallFlowById(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/ticket-call-flows/${id}`);
  }

  /** POST /api/v1/ticket-call-flows: Tạo mới quy trình */
  createTicketCallFlow(request: TicketCallFlowCreateRequest): Observable<any> {
    return this.http.post<any>(`${this.SERVICE_URL}/ticket-call-flows`, request);
  }

  /** GET /api/v1/ticket-call-flows/{id}/versions: Danh sách phiên bản */
  getTicketCallFlowVersions(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/ticket-call-flows/${id}/versions`);
  }

  /** GET /api/v1/ticket-call-flows/{id}/versions/{versionId}: Chi tiết một phiên bản */
  getTicketCallFlowVersion(id: string | number, versionId: string | number): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/ticket-call-flows/${id}/versions/${versionId}`);
  }

  /** PUT /api/v1/ticket-call-flows/{id}/versions/{versionId}: Cập nhật phiên bản (Lưu nháp canvas) */
  updateTicketCallFlowVersion(
    id: string | number,
    versionId: string | number,
    request: TicketCallFlowUpdateRequest
  ): Observable<any> {
    return this.http.put<any>(`${this.SERVICE_URL}/ticket-call-flows/${id}/versions/${versionId}`, request);
  }

  /** POST /api/v1/ticket-call-flows/{id}/versions/{versionId}/publish: Ban hành phiên bản */
  publishTicketCallFlowVersion(
    id: string | number,
    versionId: string | number,
    request?: TicketCallFlowPublishRequest
  ): Observable<any> {
    return this.http.post<any>(`${this.SERVICE_URL}/ticket-call-flows/${id}/versions/${versionId}/publish`, request || {});
  }

  /** POST /api/v1/ticket-call-flows/{id}/versions/{versionId}/clone: Nhân bản quy trình */
  cloneTicketCallFlowVersion(
    id: string | number,
    versionId: string | number,
    request: TicketCallFlowCloneRequest
  ): Observable<any> {
    return this.http.post<any>(`${this.SERVICE_URL}/ticket-call-flows/${id}/versions/${versionId}/clone`, request);
  }

  /** DELETE /api/v1/ticket-call-flows/{id}/versions/{versionId}: Xóa phiên bản */
  deleteTicketCallFlowVersion(id: string | number, versionId: string | number): Observable<any> {
    return this.http.delete<any>(`${this.SERVICE_URL}/ticket-call-flows/${id}/versions/${versionId}`);
  }

  // --------------------------------------------------
  // 2. AGENT GROUPS, AGENTS, KEYCLOAK GROUPS
  // --------------------------------------------------

  /** GET /api/v1/agent-groups: Tìm kiếm nhóm agent */
  searchAgentGroups(params?: Record<string, any>): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/agent-groups`, { params });
  }

  /** GET /api/v1/agents: Tìm kiếm agent/nhân viên */
  searchAgents(params?: Record<string, any>): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/agents`, { params });
  }

  /** GET /api/v1/keycloak-groups: Tìm kiếm nhóm Keycloak */
  searchKeycloakGroups(params?: Record<string, any>): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/keycloak-groups`, { params });
  }

  // --------------------------------------------------
  // 3. APP PARAMS
  // --------------------------------------------------

  /** GET /api/v1/app-params: Tìm kiếm cấu hình hệ thống */
  searchAppParams(params?: Record<string, any>): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/app-params`, { params });
  }

  /** POST /api/v1/app-params: Thêm mới tham số hệ thống */
  createAppParam(request: AppParamCreateRequest): Observable<any> {
    return this.http.post<any>(`${this.SERVICE_URL}/app-params`, request);
  }
}