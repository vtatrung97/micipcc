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
export class KeycloakRoleService extends AbstractService {

    constructor(private http: HttpClient,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }


    get SERVICE_URL(): string {
      return `${SERVICES.ACCOUNT_API.url}/api/v1/keycloak-roles`;
    }

  /**
   * 1. Tìm kiếm và phân trang danh sách vai trò (DataTables GET)
   * GET /api/v1/keycloak-roles?...
   */
   searchRoles(searchCriteria: any): Observable<any> {
    return this.http.get<any>(this.SERVICE_URL, { params: searchCriteria });
  }

  /**
   * 2. Lấy thông tin chi tiết vai trò theo ID (đổ dữ liệu lên modal Sửa)
   * GET /api/v1/keycloak-roles/{id}
   */
  getRoleDetail(roleId: string): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/${roleId}`);
  }

  /**
   * 3. Đếm số lượng User đang được gán vào vai trò trước khi xóa
   * GET /api/v1/keycloak-roles/{id}/assigned-users
   */
  countAssignedUsers(roleId: string): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/${roleId}/assigned-users`);
  }

  /**
   * 4. Thêm mới vai trò (Realm Role)
   * POST /api/v1/keycloak-roles
   */
  createRole(roleDTO: any): Observable<any> {
    return this.http.post<any>(this.SERVICE_URL, roleDTO);
  }

  /**
   * 5. Cập nhật thông tin vai trò theo ID
   * PUT /api/v1/keycloak-roles/{id}
   */
  updateRole(roleId: string, roleDTO: any): Observable<any> {
    return this.http.put<any>(`${this.SERVICE_URL}/${roleId}`, roleDTO);
  }

  /**
   * 6. Xóa đơn lẻ 1 vai trò (Mục 3.4.4.1 TKCT PYC_1409)
   * DELETE /api/v1/keycloak-roles/{id}
   */
  deleteSingleRole(roleId: string): Observable<any> {
    return this.http.delete<any>(`${this.SERVICE_URL}/${roleId}`);
  }

  /**
   * 7. Xóa hàng loạt vai trò (Mục 3.4.4.2 TKCT PYC_1409)
   * DELETE /api/v1/keycloak-roles/bulk
   */
  deleteRoles(roleIds: any): Observable<any> {
    return this.http.request<any>('delete', `${this.SERVICE_URL}/bulk`, {
      body: roleIds
    });
  }

  /**
   * 8. Lấy danh sách Người tạo phục vụ combobox lọc
   * GET /api/v1/keycloak-roles/creators
   */
  getCreators(): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/creators`);
  }

  /**
   * 9. Lấy danh sách Người cập nhật phục vụ combobox lọc
   * GET /api/v1/keycloak-roles/updators
   */
  getUpdators(): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/updators`);
  }


}
