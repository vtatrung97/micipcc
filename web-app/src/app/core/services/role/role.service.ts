import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {forkJoin, Observable, of} from "rxjs";
import {KEYCLOAK, SERVICES} from "@env/environment";
import {ResponseEnvelope} from "@core/models/response.model";
import {ToastService} from "@core/services/toast-service";
import {AbstractService} from "@core/services/abstract.service";
import {TranslateService} from "@ngx-translate/core";
import {catchError, map, switchMap} from "rxjs/operators";


@Injectable({providedIn: 'root'})
export class RoleService extends AbstractService {

    // Danh sách 12 Client mặc định để khởi tạo Policy
    private readonly DEFAULT_CLIENT_IDS = [
        'account-server', 'acd-service', 'bot-server', 'campaign-service',
        'ccms-service', 'chat-server', 'chat-service', 'happy-call-service',
        'monitor-server', 'quality-service', 'service-report', 'ticket-service'
    ];

    constructor(private http: HttpClient,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL_KEYCLOAK(): string {
        return `${KEYCLOAK.endpoint}`;
    }

    get SERVICE_URL(): string {
        return `${SERVICES.ACCOUNT_API.url}`;
    }

    // ===================================================
    // PHẦN 1: TẠO VAI TRÒ & KHỞI TẠO POLICY
    // ===================================================

    // Bước 1: Tạo Role gốc trên Keycloak Realm
    createRoleKeycloak(realm: string, data: { name: string; description?: string }): Observable<any> {
        return this.http.post<any>(`${this.SERVICE_URL_KEYCLOAK}/admin/realms/${realm}/roles`, data).pipe(
            catchError(() => new Observable<never>())
        );
    }

    // Tạo Policy cho 1 Client đơn lẻ
    createClientPolicy(realm: string, clientId: string, roleId: string, roleName: string): Observable<any> {
        const payload = {
            name: `${roleName}_policy`,
            type: 'role',
            logic: 'POSITIVE',
            roles: [{ id: roleId, required: true }]
        };

        return this.http.post<any>(
            `${this.SERVICE_URL_KEYCLOAK}/admin/realms/${realm}/clients/${clientId}/authz/resource-server/policy/role`,
            payload
        ).pipe(
            // TC_02: Giả lập/Bắt lỗi 500/Timeout tại từng Client, ghi log lỗi kỹ thuật và trả về of(null) để không làm dừng 11 Client còn lại
            catchError(err => {
                console.error(`[Fault Tolerance] Lỗi tạo policy tại client ${clientId}:`, err);
                return of(null);
            })
        );
    }

    // Tạo Role -> Lặp khởi tạo Policy qua 12 Client
    createRoleFullWorkflow(realm: string, roleData: { name: string; description?: string }): Observable<any> {
        return this.createRoleKeycloak(realm, roleData).pipe(
            switchMap((res: any) => {
                const roleId = res?.id || res?.role_id;
                if (!roleId) return of(res);

                // Gọi song song 12 Client, từng Client tự bắt lỗi độc lập
                const policyRequests = this.DEFAULT_CLIENT_IDS.map(clientId =>
                    this.createClientPolicy(realm, clientId, roleId, roleData.name)
                );

                return forkJoin(policyRequests).pipe(map(() => res));
            })
        );
    }

    // ===================================================
    // CHỈNH SỬA VAI TRÒ
    // ===================================================

    // Bước 1: Lấy chi tiết thông tin Role (Account Server)
    getRoleById(roleId: any): Observable<ResponseEnvelope<any>> {
        return this.http.get<ResponseEnvelope<any>>(`${this.SERVICE_URL}/api/roles/${roleId}`).pipe(
            catchError(() => new Observable<never>())
        );
    }

    // Bước 2: Cập nhật Role (Keycloak)
    updateRoleKeycloak(realm: string, roleName: string, data: { name: string; description?: string }): Observable<any> {
        return this.http.put<any>(`${this.SERVICE_URL_KEYCLOAK}/admin/realms/${realm}/roles/${roleName}`, data).pipe(
            catchError(() => new Observable<never>())
        );
    }

    // ===================================================
    // ĐỌC / TÌM KIẾM & CHECK USER GÁN
    // ===================================================

    // A. API Tìm kiếm & Phân trang (Account Server)
    getRoles(params?: {
        keyword?: string;
        createdBy?: string;
        createdFrom?: string;
        createdTo?: string;
        page?: number;
        size?: number;
    }): Observable<ResponseEnvelope<any>> {
        return this.http.get<ResponseEnvelope<any>>(`${this.SERVICE_URL}/api/roles`, { params }).pipe(
            catchError(() => new Observable<never>())
        );
    }

    // B. API Kiểm tra User đang gán (Account Server)
    getAssignedUsers(roleId: any): Observable<ResponseEnvelope<any>> {
        return this.http.get<ResponseEnvelope<any>>(`${this.SERVICE_URL}/api/roles/${roleId}/assigned-users`).pipe(
            catchError(() => new Observable<never>())
        );
    }

    // ===================================================
    // XÓA HÀNG LOẠT
    // ===================================================

    // Xóa hàng loạt qua Account Server (Server tự check user_count và kích hoạt Clean-up Keycloak Policy/Permission)
    deleteRolesBulk(roleIds: string[]): Observable<ResponseEnvelope<any>> {
        return this.http.delete<ResponseEnvelope<any>>(`${this.SERVICE_URL}/api/roles`, {
            body: { role_ids: roleIds }
        }).pipe(
            catchError(() => new Observable<never>())
        );
    }

}
