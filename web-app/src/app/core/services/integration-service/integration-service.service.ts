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
// INTEGRATION SERVICE MODELS
// ==========================================

export type IntegrationEnvironment = 'DEV' | 'STAGING' | 'PROD';
export type IntegrationStatus = 'ACTIVE' | 'INACTIVE';
export type OperationStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

// 1. External System Models
export interface ExternalSystemSearchRequest {
  keyword?: string;
  code?: string;
  name?: string;
  environment?: IntegrationEnvironment;
  status?: IntegrationStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  [key: string]: any;
}

export interface ExternalSystemCreateRequest {
  code: string;
  name: string;
  environment: IntegrationEnvironment;
  description?: string;
  status?: IntegrationStatus;
}

export interface ExternalSystemUpdateRequest {
  name: string;
  environment?: IntegrationEnvironment;
  description?: string;
  status?: IntegrationStatus;
  rowVersion?: number;
}

export interface ExternalSystemResponse {
  id: string;
  code: string;
  name: string;
  environment: IntegrationEnvironment;
  description?: string;
  status: IntegrationStatus;
  connectionCount: number;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  updatedBy: string;
  rowVersion: number;
}

// 2. Connection Models
export interface ConnectionSearchRequest {
  keyword?: string;
  systemId?: number | string;
  protocol?: string;
  status?: IntegrationStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  [key: string]: any;
}

export interface ConnectionCreateRequest {
  systemId: number | string;
  code: string;
  name: string;
  baseUrl: string;
  protocol: string;
  authConfig?: any;
  retryPolicy?: any;
  circuitBreaker?: any;
  description?: string;
  status?: IntegrationStatus;
}

export interface ConnectionUpdateRequest {
  name: string;
  baseUrl: string;
  authConfig?: any;
  retryPolicy?: any;
  circuitBreaker?: any;
  description?: string;
  status?: IntegrationStatus;
  rowVersion?: number;
}

export interface ConnectionTestRequest {
  baseUrl: string;
  protocol: string;
  authConfig?: any;
}

export interface ConnectionTestResponse {
  success: boolean;
  statusCode?: number;
  responseTimeMs?: number;
  message?: string;
}

export interface ConnectionSummaryResponse {
  id: string;
  systemId: string;
  systemName: string;
  code: string;
  name: string;
  baseUrl: string;
  protocol: string;
  status: IntegrationStatus;
  operationCount: number;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  updatedBy: string;
  rowVersion: number;
}

export interface ConnectionResponse extends ConnectionSummaryResponse {
  authConfig?: any;
  retryPolicy?: any;
  circuitBreaker?: any;
  description?: string;
}

// 3. Operation Models
export interface OperationSearchRequest {
  keyword?: string;
  connectionId?: number | string;
  systemId?: number | string;
  status?: OperationStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  [key: string]: any;
}

export interface OperationCreateRequest {
  connectionId: number | string;
  code: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  headers?: Record<string, string>;
  inputParams?: any[];
  outputParams?: any[];
  timeoutMs?: number;
  description?: string;
}

export interface OperationUpdateRequest {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  headers?: Record<string, string>;
  inputParams?: any[];
  outputParams?: any[];
  timeoutMs?: number;
  description?: string;
  rowVersion?: number;
}

export interface RowVersionRequest {
  rowVersion?: number;
}

export interface OperationSummaryResponse {
  id: string;
  connectionId: string;
  connectionName: string;
  systemId: string;
  systemName: string;
  code: string;
  name: string;
  method: string;
  path: string;
  versionNo: number;
  status: OperationStatus;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  updatedBy: string;
  rowVersion: number;
}

export interface OperationResponse extends OperationSummaryResponse {
  headers?: Record<string, string>;
  inputParams?: any[];
  outputParams?: any[];
  timeoutMs?: number;
  description?: string;
}

// ==========================================
// INTEGRATION SERVICE
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class IntegrationService extends AbstractService {

  constructor(
    private http: HttpClient,
    private toastSvc: ToastService,
    private translate: TranslateService
  ) {
    super(http, toastSvc, translate);
  }

  get SERVICE_URL(): string {
    return `${(SERVICES?.INTEGRATION_SERVICE_API?.url || '').replace(/\/+$/, '')}/api/v1/integrations`;
  }

  // --------------------------------------------------
  // 1. EXTERNAL SYSTEMS (Hệ thống thứ 3)
  // --------------------------------------------------

  /** GET /api/v1/integrations/systems: Tìm kiếm hệ thống tích hợp */
  searchSystems(request?: ExternalSystemSearchRequest): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/systems`, { params: request });
  }

  /** GET /api/v1/integrations/systems/{id}: Chi tiết hệ thống */
  getSystemById(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/systems/${id}`);
  }

  /** POST /api/v1/integrations/systems: Tạo hệ thống mới */
  createSystem(request: ExternalSystemCreateRequest): Observable<any> {
    return this.http.post<any>(`${this.SERVICE_URL}/systems`, request);
  }

  /** PUT /api/v1/integrations/systems/{id}: Cập nhật hệ thống */
  updateSystem(id: string | number, request: ExternalSystemUpdateRequest): Observable<any> {
    return this.http.put<any>(`${this.SERVICE_URL}/systems/${id}`, request);
  }

  /** DELETE /api/v1/integrations/systems/{id}: Xóa hệ thống */
  deleteSystem(id: string | number): Observable<any> {
    return this.http.delete<any>(`${this.SERVICE_URL}/systems/${id}`);
  }

  // --------------------------------------------------
  // 2. CONNECTIONS (Kết nối tới hệ thống ngoài)
  // --------------------------------------------------

  /** GET /api/v1/integrations/connections: Tìm kiếm kết nối */
  searchConnections(request?: ConnectionSearchRequest): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/connections`, { params: request });
  }

  /** GET /api/v1/integrations/connections/{id}: Chi tiết kết nối */
  getConnectionById(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/connections/${id}`);
  }

  /** POST /api/v1/integrations/connections: Tạo kết nối mới */
  createConnection(request: ConnectionCreateRequest): Observable<any> {
    return this.http.post<any>(`${this.SERVICE_URL}/connections`, request);
  }

  /** PUT /api/v1/integrations/connections/{id}: Cập nhật kết nối */
  updateConnection(id: string | number, request: ConnectionUpdateRequest): Observable<any> {
    return this.http.put<any>(`${this.SERVICE_URL}/connections/${id}`, request);
  }

  /** DELETE /api/v1/integrations/connections/{id}: Xóa kết nối */
  deleteConnection(id: string | number): Observable<any> {
    return this.http.delete<any>(`${this.SERVICE_URL}/connections/${id}`);
  }

  /** POST /api/v1/integrations/connections/{id}/test: Test kết nối đã lưu */
  testConnection(id: string | number): Observable<any> {
    return this.http.post<any>(`${this.SERVICE_URL}/connections/${id}/test`, {});
  }

  /** POST /api/v1/integrations/connections/test: Test kết nối chưa lưu */
  testUnsavedConnection(request: ConnectionTestRequest): Observable<any> {
    return this.http.post<any>(`${this.SERVICE_URL}/connections/test`, request);
  }

  // --------------------------------------------------
  // 3. OPERATIONS (API qua kết nối)
  // --------------------------------------------------

  /** GET /api/v1/integrations/operations: Tìm kiếm operation */
  searchOperations(request?: OperationSearchRequest): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/operations`, { params: request });
  }

  /** GET /api/v1/integrations/operations/active: Lấy danh sách operation đang ACTIVE (cấu hình node) */
  getActiveOperations(keyword?: string, systemId?: number | string): Observable<any> {
    const params: any = {};
    if (keyword) params.keyword = keyword;
    if (systemId) params.systemId = systemId;
    return this.http.get<any>(`${this.SERVICE_URL}/operations/active`, { params });
  }

  /** GET /api/v1/integrations/operations/{id}: Chi tiết operation */
  getOperationById(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/operations/${id}`);
  }

  /** GET /api/v1/integrations/operations/{id}/versions: Danh sách phiên bản operation */
  getOperationVersions(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/operations/${id}/versions`);
  }

  /** POST /api/v1/integrations/operations: Tạo operation mới */
  createOperation(request: OperationCreateRequest): Observable<any> {
    return this.http.post<any>(`${this.SERVICE_URL}/operations`, request);
  }

  /** PUT /api/v1/integrations/operations/{id}: Cập nhật operation */
  updateOperation(id: string | number, request: OperationUpdateRequest): Observable<any> {
    return this.http.put<any>(`${this.SERVICE_URL}/operations/${id}`, request);
  }

  /** POST /api/v1/integrations/operations/{id}/new-version: Tạo phiên bản mới */
  createOperationNewVersion(id: string | number): Observable<any> {
    return this.http.post<any>(`${this.SERVICE_URL}/operations/${id}/new-version`, {});
  }

  /** POST /api/v1/integrations/operations/{id}/activate: Kích hoạt phiên bản */
  activateOperation(id: string | number, request?: RowVersionRequest): Observable<any> {
    return this.http.post<any>(`${this.SERVICE_URL}/operations/${id}/activate`, request || {});
  }

  /** POST /api/v1/integrations/operations/{id}/deactivate: Hủy kích hoạt */
  deactivateOperation(id: string | number, request?: RowVersionRequest): Observable<any> {
    return this.http.post<any>(`${this.SERVICE_URL}/operations/${id}/deactivate`, request || {});
  }

  /** DELETE /api/v1/integrations/operations/{id}: Xóa operation */
  deleteOperation(id: string | number): Observable<any> {
    return this.http.delete<any>(`${this.SERVICE_URL}/operations/${id}`);
  }
}