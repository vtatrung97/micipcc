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
// ENGINE SERVICE MODELS
// ==========================================

export interface ValidateDefinitionRequest {
  processKey: string;
  flowJson: string;
}

export interface ValidationErrorDto {
  nodeId?: string;
  field?: string;
  message: string;
  severity?: 'ERROR' | 'WARNING';
}

export interface ValidationResultResponse {
  valid: boolean;
  errors: ValidationErrorDto[];
}

export interface DeployDefinitionRequest {
  processKey: string;
  processName: string;
  versionNo?: number;
  flowJson: string;
  tenantId?: string;
}

export interface DeploymentResponse {
  deploymentId: string;
  processDefinitionId: string;
  processKey: string;
  version: number;
  deployedAt: string;
}

export interface StartInstanceRequest {
  processKey: string;
  businessKey?: string;
  input?: Record<string, any>;
  tenantId?: string;
}

export interface ActiveStepResponse {
  activityId: string;
  activityName: string;
  activityType: string;
  startTime: string;
}

export interface ProcessInstanceResponse {
  processInstanceId: string;
  processDefinitionId: string;
  processKey: string;
  businessKey?: string;
  status: 'RUNNING' | 'COMPLETED' | 'CANCELLED' | 'SUSPENDED';
  startTime: string;
  endTime?: string;
  activeSteps: ActiveStepResponse[];
  variables: Record<string, any>;
}

export interface CancelInstanceRequest {
  reason?: string;
}

export interface TaskSearchRequest {
  assignee?: string;
  candidateUser?: string;
  candidateGroup?: string;
  processInstanceId?: string;
  page?: number;
  size?: number;
  [key: string]: any;
}

export interface TaskResponse {
  taskId: string;
  taskName: string;
  processInstanceId: string;
  processKey: string;
  assignee?: string;
  candidateGroups?: string[];
  createTime: string;
  dueDate?: string;
}

export interface TaskDetailResponse extends TaskResponse {
  formFields?: any[];
  prefilledData?: Record<string, any>;
  variables?: Record<string, any>;
}

export interface ClaimTaskRequest {
  userId: string;
}

export interface CompleteTaskRequest {
  formData: Record<string, any>;
}

// ==========================================
// ENGINE SERVICE
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class EngineService extends AbstractService {

  constructor(
    private http: HttpClient,
    private toastSvc: ToastService,
    private translate: TranslateService
  ) {
    super(http, toastSvc, translate);
  }

  get SERVICE_URL(): string {
    return `${(SERVICES?.ENGINE_SERVICE_API?.url || '').replace(/\/+$/, '')}/internal/v1`;
  }

  // --------------------------------------------------
  // 1. DEFINITIONS (Kiểm tra & Deploy)
  // --------------------------------------------------

  /** POST /internal/v1/definitions/validate: Kiểm tra cú pháp flowJson */
  validateDefinition(request: ValidateDefinitionRequest): Observable<any> {
    return this.http.post<any>(`${this.SERVICE_URL}/definitions/validate`, request);
  }

  /** POST /internal/v1/definitions/deploy: Chuyển flowJson sang BPMN và deploy */
  deployDefinition(request: DeployDefinitionRequest): Observable<any> {
    return this.http.post<any>(`${this.SERVICE_URL}/definitions/deploy`, request);
  }

  // --------------------------------------------------
  // 2. PROCESS INSTANCES (Phiên chạy quy trình)
  // --------------------------------------------------

  /** POST /internal/v1/instances: Khởi tạo phiên chạy mới */
  startInstance(request: StartInstanceRequest): Observable<any> {
    return this.http.post<any>(`${this.SERVICE_URL}/instances`, request);
  }

  /** GET /internal/v1/instances/{processInstanceId}: Trạng thái, bước đang chạy & biến */
  getInstance(processInstanceId: string): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/instances/${processInstanceId}`);
  }

  /** POST /internal/v1/instances/{processInstanceId}/cancel: Hủy phiên chạy */
  cancelInstance(processInstanceId: string, request?: CancelInstanceRequest): Observable<any> {
    return this.http.post<any>(`${this.SERVICE_URL}/instances/${processInstanceId}/cancel`, request || {});
  }

  // --------------------------------------------------
  // 3. USER TASKS (Nhiệm vụ người dùng)
  // --------------------------------------------------

  /** GET /internal/v1/tasks: Tìm danh sách task */
  searchTasks(request?: TaskSearchRequest): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/tasks`, { params: request });
  }

  /** GET /internal/v1/tasks/{taskId}: Chi tiết task kèm dữ liệu form */
  getTaskDetail(taskId: string): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/tasks/${taskId}`);
  }

  /** POST /internal/v1/tasks/{taskId}/claim: Nhận việc */
  claimTask(taskId: string, request: ClaimTaskRequest): Observable<any> {
    return this.http.post<any>(`${this.SERVICE_URL}/tasks/${taskId}/claim`, request);
  }

  /** POST /internal/v1/tasks/{taskId}/complete: Hoàn thành task */
  completeTask(taskId: string, request: CompleteTaskRequest): Observable<any> {
    return this.http.post<any>(`${this.SERVICE_URL}/tasks/${taskId}/complete`, request);
  }
}
