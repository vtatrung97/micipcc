import { AbstractService } from "@core/services/abstract.service";
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SERVICES } from "@env/environment";
import { AuthService } from "@core/services/auth/auth.service";
import { ToastService } from "@core/services/toast-service";
import { TranslateService } from "@ngx-translate/core";
import { ApiResponse, PageResponse } from '../core-service/core-service.service';

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
// INTEGRATION API SERVICE
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class IntegrationApiService extends AbstractService {

  constructor(
    private http: HttpClient,
    private authSvc: AuthService,
    private toastSvc: ToastService,
    private translate: TranslateService
  ) {
    super(http, toastSvc, translate);
  }

  get SERVICE_URL(): string {
    const root = (SERVICES?.INTEGRATION_SERVICE_API?.url || '').replace(/\/+$/, '');
    return `${root}/api/v1/integrations`;
  }


  // --------------------------------------------------
  // 1. EXTERNAL SYSTEMS (Hệ thống thứ 3)
  // --------------------------------------------------

  /** GET /api/v1/integrations/systems: Tìm kiếm hệ thống tích hợp */
  public searchSystems(request?: ExternalSystemSearchRequest): Observable<ApiResponse<PageResponse<ExternalSystemResponse>>> {
    return this.getRequest(`${this.SERVICE_URL}/systems`, { params: this.buildParams(request) });
  }

  /** GET /api/v1/integrations/systems/{id}: Chi tiết hệ thống */
  public getSystemById(id: string | number): Observable<ApiResponse<ExternalSystemResponse>> {
    return this.getRequest(`${this.SERVICE_URL}/systems/${id}`);
  }

  /** POST /api/v1/integrations/systems: Tạo hệ thống mới */
  public createSystem(request: ExternalSystemCreateRequest): Observable<ApiResponse<ExternalSystemResponse>> {
    return this.postRequest(`${this.SERVICE_URL}/systems`, request);
  }

  /** PUT /api/v1/integrations/systems/{id}: Cập nhật hệ thống */
  public updateSystem(id: string | number, request: ExternalSystemUpdateRequest): Observable<ApiResponse<ExternalSystemResponse>> {
    return this.putRequest(`${this.SERVICE_URL}/systems/${id}`, request);
  }

  /** DELETE /api/v1/integrations/systems/{id}: Xóa hệ thống */
  public deleteSystem(id: string | number): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(`${this.SERVICE_URL}/systems/${id}`)
      .pipe(catchError(error => this.handleError(error)));
  }

  // --------------------------------------------------
  // 2. CONNECTIONS (Kết nối tới hệ thống ngoài)
  // --------------------------------------------------

  /** GET /api/v1/integrations/connections: Tìm kiếm kết nối */
  public searchConnections(request?: ConnectionSearchRequest): Observable<ApiResponse<PageResponse<ConnectionSummaryResponse>>> {
    return this.getRequest(`${this.SERVICE_URL}/connections`, { params: this.buildParams(request) });
  }

  /** GET /api/v1/integrations/connections/{id}: Chi tiết kết nối */
  public getConnectionById(id: string | number): Observable<ApiResponse<ConnectionResponse>> {
    return this.getRequest(`${this.SERVICE_URL}/connections/${id}`);
  }

  /** POST /api/v1/integrations/connections: Tạo kết nối mới */
  public createConnection(request: ConnectionCreateRequest): Observable<ApiResponse<ConnectionResponse>> {
    return this.postRequest(`${this.SERVICE_URL}/connections`, request);
  }

  /** PUT /api/v1/integrations/connections/{id}: Cập nhật kết nối */
  public updateConnection(id: string | number, request: ConnectionUpdateRequest): Observable<ApiResponse<ConnectionResponse>> {
    return this.putRequest(`${this.SERVICE_URL}/connections/${id}`, request);
  }

  /** DELETE /api/v1/integrations/connections/{id}: Xóa kết nối */
  public deleteConnection(id: string | number): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(`${this.SERVICE_URL}/connections/${id}`)
      .pipe(catchError(error => this.handleError(error)));
  }

  /** POST /api/v1/integrations/connections/{id}/test: Test kết nối đã lưu */
  public testConnection(id: string | number): Observable<ApiResponse<ConnectionTestResponse>> {
    return this.postRequest(`${this.SERVICE_URL}/connections/${id}/test`, {});
  }

  /** POST /api/v1/integrations/connections/test: Test kết nối chưa lưu */
  public testUnsavedConnection(request: ConnectionTestRequest): Observable<ApiResponse<ConnectionTestResponse>> {
    return this.postRequest(`${this.SERVICE_URL}/connections/test`, request);
  }

  // --------------------------------------------------
  // 3. OPERATIONS (API qua kết nối)
  // --------------------------------------------------

  /** GET /api/v1/integrations/operations: Tìm kiếm operation */
  public searchOperations(request?: OperationSearchRequest): Observable<ApiResponse<PageResponse<OperationSummaryResponse>>> {
    return this.getRequest(`${this.SERVICE_URL}/operations`, { params: this.buildParams(request) });
  }

  /** GET /api/v1/integrations/operations/active: Lấy danh sách operation đang ACTIVE (cấu hình node) */
  public getActiveOperations(keyword?: string, systemId?: number | string): Observable<ApiResponse<OperationSummaryResponse[]>> {
    const params = this.buildParams({ keyword, systemId });
    return this.getRequest(`${this.SERVICE_URL}/operations/active`, { params });
  }

  /** GET /api/v1/integrations/operations/{id}: Chi tiết operation */
  public getOperationById(id: string | number): Observable<ApiResponse<OperationResponse>> {
    return this.getRequest(`${this.SERVICE_URL}/operations/${id}`);
  }

  /** GET /api/v1/integrations/operations/{id}/versions: Danh sách phiên bản operation */
  public getOperationVersions(id: string | number): Observable<ApiResponse<OperationSummaryResponse[]>> {
    return this.getRequest(`${this.SERVICE_URL}/operations/${id}/versions`);
  }

  /** POST /api/v1/integrations/operations: Tạo operation mới */
  public createOperation(request: OperationCreateRequest): Observable<ApiResponse<OperationResponse>> {
    return this.postRequest(`${this.SERVICE_URL}/operations`, request);
  }

  /** PUT /api/v1/integrations/operations/{id}: Cập nhật operation */
  public updateOperation(id: string | number, request: OperationUpdateRequest): Observable<ApiResponse<OperationResponse>> {
    return this.putRequest(`${this.SERVICE_URL}/operations/${id}`, request);
  }

  /** POST /api/v1/integrations/operations/{id}/new-version: Tạo phiên bản mới */
  public createOperationNewVersion(id: string | number): Observable<ApiResponse<OperationResponse>> {
    return this.postRequest(`${this.SERVICE_URL}/operations/${id}/new-version`, {});
  }

  /** POST /api/v1/integrations/operations/{id}/activate: Kích hoạt phiên bản */
  public activateOperation(id: string | number, request?: RowVersionRequest): Observable<ApiResponse<OperationResponse>> {
    return this.postRequest(`${this.SERVICE_URL}/operations/${id}/activate`, request || {});
  }

  /** POST /api/v1/integrations/operations/{id}/deactivate: Hủy kích hoạt */
  public deactivateOperation(id: string | number, request?: RowVersionRequest): Observable<ApiResponse<OperationResponse>> {
    return this.postRequest(`${this.SERVICE_URL}/operations/${id}/deactivate`, request || {});
  }

  /** DELETE /api/v1/integrations/operations/{id}: Xóa operation */
  public deleteOperation(id: string | number): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(`${this.SERVICE_URL}/operations/${id}`)
      .pipe(catchError(error => this.handleError(error)));
  }
}
