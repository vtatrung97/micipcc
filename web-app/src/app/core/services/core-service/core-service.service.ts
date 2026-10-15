import { AbstractService } from "@core/services/abstract.service";
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SERVICES } from "@env/environment";
import { AuthService } from "@core/services/auth/auth.service";
import { ToastService } from "@core/services/toast-service";
import { TranslateService } from "@ngx-translate/core";

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
// CORE API SERVICE
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class CoreApiService extends AbstractService {

  constructor(
    private http: HttpClient,
    private authSvc: AuthService,
    private toastSvc: ToastService,
    private translate: TranslateService
  ) {
    super(http, toastSvc, translate);
  }

  get SERVICE_URL(): string {
    const root = (SERVICES?.CORE_SERVICE_API?.url || '').replace(/\/+$/, '');
    return `${root}/api/v1`;
  }


  // --------------------------------------------------
  // 1. TICKET CALL FLOWS (10 Endpoints)
  // --------------------------------------------------

  /** GET /api/v1/ticket-call-flows: Tìm kiếm / phân trang danh sách quy trình */
  public searchTicketCallFlows(request?: TicketCallFlowSearchRequest): Observable<ApiResponse<PageResponse<TicketCallFlowSummaryResponse>>> {
    return this.getRequest(`${this.SERVICE_URL}/ticket-call-flows`, { params: this.buildParams(request) });
  }

  /** GET /api/v1/ticket-call-flows/stats: Thống kê số lượng */
  public getTicketCallFlowStats(): Observable<ApiResponse<TicketCallFlowStatsResponse>> {
    return this.getRequest(`${this.SERVICE_URL}/ticket-call-flows/stats`);
  }

  /** GET /api/v1/ticket-call-flows/{id}: Chi tiết quy trình kèm flowJson */
  public getTicketCallFlowById(id: string | number): Observable<ApiResponse<TicketCallFlowResponse>> {
    return this.getRequest(`${this.SERVICE_URL}/ticket-call-flows/${id}`);
  }

  /** POST /api/v1/ticket-call-flows: Tạo mới quy trình */
  public createTicketCallFlow(request: TicketCallFlowCreateRequest): Observable<ApiResponse<TicketCallFlowResponse>> {
    return this.postRequest(`${this.SERVICE_URL}/ticket-call-flows`, request);
  }

  /** GET /api/v1/ticket-call-flows/{id}/versions: Danh sách phiên bản */
  public getTicketCallFlowVersions(id: string | number): Observable<ApiResponse<TicketCallFlowVersionSummaryResponse[]>> {
    return this.getRequest(`${this.SERVICE_URL}/ticket-call-flows/${id}/versions`);
  }

  /** GET /api/v1/ticket-call-flows/{id}/versions/{versionId}: Chi tiết một phiên bản */
  public getTicketCallFlowVersion(id: string | number, versionId: string | number): Observable<ApiResponse<TicketCallFlowVersionResponse>> {
    return this.getRequest(`${this.SERVICE_URL}/ticket-call-flows/${id}/versions/${versionId}`);
  }

  /** PUT /api/v1/ticket-call-flows/{id}/versions/{versionId}: Cập nhật phiên bản (Lưu nháp canvas) */
  public updateTicketCallFlowVersion(
    id: string | number,
    versionId: string | number,
    request: TicketCallFlowUpdateRequest
  ): Observable<ApiResponse<TicketCallFlowResponse>> {
    return this.putRequest(`${this.SERVICE_URL}/ticket-call-flows/${id}/versions/${versionId}`, request);
  }

  /** POST /api/v1/ticket-call-flows/{id}/versions/{versionId}/publish: Ban hành phiên bản */
  public publishTicketCallFlowVersion(
    id: string | number,
    versionId: string | number,
    request?: TicketCallFlowPublishRequest
  ): Observable<ApiResponse<TicketCallFlowResponse>> {
    return this.postRequest(`${this.SERVICE_URL}/ticket-call-flows/${id}/versions/${versionId}/publish`, request || {});
  }

  /** POST /api/v1/ticket-call-flows/{id}/versions/{versionId}/clone: Nhân bản quy trình */
  public cloneTicketCallFlowVersion(
    id: string | number,
    versionId: string | number,
    request: TicketCallFlowCloneRequest
  ): Observable<ApiResponse<TicketCallFlowResponse>> {
    return this.postRequest(`${this.SERVICE_URL}/ticket-call-flows/${id}/versions/${versionId}/clone`, request);
  }

  /** DELETE /api/v1/ticket-call-flows/{id}/versions/{versionId}: Xóa phiên bản */
  public deleteTicketCallFlowVersion(id: string | number, versionId: string | number): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(`${this.SERVICE_URL}/ticket-call-flows/${id}/versions/${versionId}`)
      .pipe(catchError(error => this.handleError(error)));
  }

  // --------------------------------------------------
  // 2. AGENT GROUPS, AGENTS, KEYCLOAK GROUPS
  // --------------------------------------------------

  /** GET /api/v1/agent-groups: Tìm kiếm nhóm agent */
  public searchAgentGroups(params?: Record<string, any>): Observable<ApiResponse<PageResponse<AgentGroupResponse>>> {
    return this.getRequest(`${this.SERVICE_URL}/agent-groups`, { params: this.buildParams(params) });
  }

  /** GET /api/v1/agents: Tìm kiếm agent/nhân viên */
  public searchAgents(params?: Record<string, any>): Observable<ApiResponse<PageResponse<AgentResponse>>> {
    return this.getRequest(`${this.SERVICE_URL}/agents`, { params: this.buildParams(params) });
  }

  /** GET /api/v1/keycloak-groups: Tìm kiếm nhóm Keycloak */
  public searchKeycloakGroups(params?: Record<string, any>): Observable<ApiResponse<PageResponse<KeycloakGroupResponse>>> {
    return this.getRequest(`${this.SERVICE_URL}/keycloak-groups`, { params: this.buildParams(params) });
  }

  // --------------------------------------------------
  // 3. APP PARAMS
  // --------------------------------------------------

  /** GET /api/v1/app-params: Tìm kiếm cấu hình hệ thống */
  public searchAppParams(params?: Record<string, any>): Observable<ApiResponse<PageResponse<AppParamResponse>>> {
    return this.getRequest(`${this.SERVICE_URL}/app-params`, { params: this.buildParams(params) });
  }

  /** POST /api/v1/app-params: Thêm mới tham số hệ thống */
  public createAppParam(request: AppParamCreateRequest): Observable<ApiResponse<AppParamResponse>> {
    return this.postRequest(`${this.SERVICE_URL}/app-params`, request);
  }
}
