import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { SERVICES } from '@env/environment';
import { AbstractService } from '../abstract.service';
import { AuthService } from '@core/services/auth/auth.service';
import { ToastService } from '@core/services/toast-service';
import { ResponseEnvelope } from '@core/models/response.model';

// ==================== INTERFACES & MODELS ====================

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface TicketCallFlowSearchRequest {
  keyword?: string;
  name?: string;
  code?: string;
  status?: string;
  versionStatus?: string;
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

export interface TicketCallFlowStatsResponse {
  total: number;
  active: number;
  hasDraft: number;
}

export interface TicketCallFlowTriggerDto {
  triggerType: string;
  eventSource?: string;
  conditionExpression?: string;
}

export interface TicketCallFlowCreateRequest {
  code: string;
  name: string;
  category: string;
  description?: string;
  trigger: TicketCallFlowTriggerDto;
  slaValue: number;
  slaUnit: 'HOUR' | 'DAY' | 'MINUTE';
  status?: string;
  flowJson: string;
}

export interface TicketCallFlowUpdateRequest {
  name: string;
  category?: string;
  description?: string;
  trigger?: TicketCallFlowTriggerDto;
  slaValue?: number;
  slaUnit?: 'HOUR' | 'DAY' | 'MINUTE';
  status?: string;
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

export interface TicketCallFlowSummaryResponse {
  templateId: string;
  templateVersionId: string;
  code: string;
  name: string;
  category: string;
  description: string;
  status: string;
  triggerType: string;
  slaValue: number;
  slaUnit: string;
  versionNo: number;
  versionStatus: string;
  versionName: string;
  publishedAt: number;
  publishedBy: string;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  updatedBy: string;
  rowVersion: number;
}

export interface TicketCallFlowVersionSummaryResponse {
  id: string;
  versionNo: number;
  status: string;
  versionName: string;
  versionDescription: string;
  publishedAt: number;
  publishedBy: string;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  updatedBy: string;
}

export interface TicketCallFlowVersionResponse {
  flowId: string;
  id: string;
  versionNo: number;
  status: string;
  versionName: string;
  versionDescription: string;
  flowJson: string;
  publishedAt: number;
  publishedBy: string;
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
  status: string;
  trigger: TicketCallFlowTriggerDto;
  slaValue: number;
  slaUnit: string;
  flowJson: string;
  flowJsonVersionId: string;
  flowJsonVersionNo: number;
  flowJsonVersionStatus: string;
  publishedVersion?: TicketCallFlowVersionSummaryResponse;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  updatedBy: string;
  rowVersion: number;
}

// ==================== SERVICE CLASS ====================

@Injectable({
  providedIn: 'root'
})
export class TicketCallFlowsService extends AbstractService {

  constructor(
    private http: HttpClient,
    private authSvc: AuthService,
    private toastSvc: ToastService,
    private translate: TranslateService
  ) {
    super(http, toastSvc, translate);
  }

  get SERVICE_URL(): string {
    return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-call-flows`;
  }

  /**
   * 1. GET /api/v1/ticket-call-flows
   * Tìm kiếm & phân trang danh sách quy trình
   */
  public search(request?: TicketCallFlowSearchRequest): Observable<ResponseEnvelope<PageResponse<TicketCallFlowSummaryResponse>>> {
    let params = new HttpParams();
    if (request) {
      Object.keys(request).forEach(key => {
        const val = (request as any)[key];
        if (val !== undefined && val !== null && val !== '') {
          params = params.set(key, String(val));
        }
      });
    }
    return this.getRequest(this.SERVICE_URL, { params });
  }

  /**
   * 2. GET /api/v1/ticket-call-flows/stats
   * Thống kê số liệu (Tổng, đang hiệu lực, có bản nháp)
   */
  public getStats(): Observable<ResponseEnvelope<TicketCallFlowStatsResponse>> {
    return this.getRequest(`${this.SERVICE_URL}/stats`);
  }

  /**
   * 3. GET /api/v1/ticket-call-flows/{id}
   * Lấy chi tiết quy trình (kèm flowJson để vẽ lại Canvas)
   */
  public getById(id: string | number): Observable<ResponseEnvelope<TicketCallFlowResponse>> {
    return this.getRequest(`${this.SERVICE_URL}/${id}`);
  }

  /**
   * 4. POST /api/v1/ticket-call-flows
   * Tạo mới quy trình
   */
  public create(payload: TicketCallFlowCreateRequest): Observable<ResponseEnvelope<TicketCallFlowResponse>> {
    return this.postRequest(this.SERVICE_URL, payload);
  }

  /**
   * 5. GET /api/v1/ticket-call-flows/{id}/versions
   * Lấy danh sách lịch sử phiên bản của quy trình
   */
  public getVersions(id: string | number): Observable<ResponseEnvelope<TicketCallFlowVersionSummaryResponse[]>> {
    return this.getRequest(`${this.SERVICE_URL}/${id}/versions`);
  }

  /**
   * 6. GET /api/v1/ticket-call-flows/{id}/versions/{versionId}
   * Lấy chi tiết 1 phiên bản cụ thể (kèm flowJson)
   */
  public getVersion(id: string | number, versionId: string | number): Observable<ResponseEnvelope<TicketCallFlowVersionResponse>> {
    return this.getRequest(`${this.SERVICE_URL}/${id}/versions/${versionId}`);
  }

  /**
   * 7. PUT /api/v1/ticket-call-flows/{id}/versions/{versionId}
   * Lưu / Cập nhật phiên bản quy trình (Lưu nháp canvas)
   */
  public updateVersion(
    id: string | number,
    versionId: string | number,
    payload: TicketCallFlowUpdateRequest
  ): Observable<ResponseEnvelope<TicketCallFlowResponse>> {
    return this.putRequest(`${this.SERVICE_URL}/${id}/versions/${versionId}`, payload);
  }

  /**
   * 8. POST /api/v1/ticket-call-flows/{id}/versions/{versionId}/publish
   * Ban hành (Publish) phiên bản quy trình
   */
  public publishVersion(
    id: string | number,
    versionId: string | number,
    payload?: TicketCallFlowPublishRequest
  ): Observable<ResponseEnvelope<TicketCallFlowResponse>> {
    return this.postRequest(`${this.SERVICE_URL}/${id}/versions/${versionId}/publish`, payload || {});
  }

  /**
   * 9. POST /api/v1/ticket-call-flows/{id}/versions/{versionId}/clone
   * Nhân bản quy trình thành một quy trình mới
   */
  public cloneVersion(
    id: string | number,
    versionId: string | number,
    payload: TicketCallFlowCloneRequest
  ): Observable<ResponseEnvelope<TicketCallFlowResponse>> {
    return this.postRequest(`${this.SERVICE_URL}/${id}/versions/${versionId}/clone`, payload);
  }

  /**
   * 10. DELETE /api/v1/ticket-call-flows/{id}/versions/{versionId}
   * Xóa mềm một phiên bản quy trình
   */
  public deleteVersion(id: string | number, versionId: string | number): Observable<ResponseEnvelope<void>> {
    return this.deleteRequest(`${this.SERVICE_URL}/${id}/versions/${versionId}`);
  }
}
