import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from './auth.service';

export interface KeycloakResourcePermission {
  rsid?: string;
  rsname: string;
  scopes: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ScopeService {
  private readonly jwtHelper = new JwtHelperService();
  private readonly scopesSubject = new BehaviorSubject<string[]>([]);

  /**
   * Observable phát ra danh sách scopes mỗi khi token thay đổi
   */
  public readonly scopes$: Observable<string[]> = this.scopesSubject.asObservable();

  constructor(private authService: AuthService) {
    // Tự động đồng bộ scopes mỗi khi trạng thái đăng nhập hoặc token thay đổi
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.refreshScopes();
      } else {
        this.scopesSubject.next([]);
      }
    });
  }

  /**
   * Làm mới danh sách scopes từ Access Token hiện tại
   */
  public refreshScopes(): string[] {
    const scopes = this.extractAllScopes();
    this.scopesSubject.next(scopes);
    return scopes;
  }

  /**
   * Lấy toàn bộ danh sách scopes (OAuth2 Scopes + Keycloak Resource Scopes)
   */
  public getScopes(): string[] {
    const cached = this.scopesSubject.value;
    if (cached.length > 0) {
      return cached;
    }
    return this.refreshScopes();
  }

  /**
   * Kiểm tra xem user / token có chứa scope cụ thể hay không
   * @param scope Tên scope cần kiểm tra (ví dụ: 'openid', 'ticket:read', 'view', ...)
   */
  public hasScope(scope: string): boolean {
    if (!scope) return false;
    const currentScopes = this.getScopes();
    return currentScopes.includes(scope.trim());
  }

  /**
   * Kiểm tra xem user / token có chứa ít nhất 1 trong các scope yêu cầu hay không (OR)
   * @param scopes Mảng danh sách scopes cần kiểm tra
   */
  public hasAnyScope(scopes: string[]): boolean {
    if (!scopes || scopes.length === 0) return true;
    const currentScopes = this.getScopes();
    return scopes.some(s => currentScopes.includes(s.trim()));
  }

  /**
   * Kiểm tra xem user / token có chứa đầy đủ tất cả các scope yêu cầu hay không (AND)
   * @param scopes Mảng danh sách scopes bắt buộc
   */
  public hasAllScopes(scopes: string[]): boolean {
    if (!scopes || scopes.length === 0) return true;
    const currentScopes = this.getScopes();
    return scopes.every(s => currentScopes.includes(s.trim()));
  }

  /**
   * Lấy danh sách scopes theo một tài nguyên cụ thể (Keycloak Authorization / Resource Server)
   * @param resourceName Tên tài nguyên (ví dụ: 'ticket-service', 'process-template')
   */
  public getResourceScopes(resourceName: string): string[] {
    const permissions = this.getKeycloakPermissions();
    const matched = permissions.find(p => p.rsname === resourceName);
    return matched ? matched.scopes : [];
  }

  /**
   * Kiểm tra xem trên một Resource cụ thể có scope chỉ định hay không
   * @param resourceName Tên tài nguyên (rsname)
   * @param scope Tên scope thao tác (view, edit, delete...)
   */
  public hasResourceScope(resourceName: string, scope: string): boolean {
    const resourceScopes = this.getResourceScopes(resourceName);
    return resourceScopes.includes(scope);
  }

  /**
   * Lấy danh sách các permissions chi tiết từ Keycloak Authorization Services
   */
  public getKeycloakPermissions(): KeycloakResourcePermission[] {
    const token = this.authService.getAccessToken();
    if (!token) return [];

    try {
      const decoded: any = this.jwtHelper.decodeToken(token);
      return decoded?.authorization?.permissions || [];
    } catch {
      return [];
    }
  }

  /**
   * Trích xuất tổng hợp tất cả các loại scope từ token Keycloak
   */
  private extractAllScopes(): string[] {
    const token = this.authService.getAccessToken();
    if (!token) return [];

    try {
      const decoded: any = this.jwtHelper.decodeToken(token);
      const allScopes = new Set<string>();

      // 1. OAuth2 standard scopes claim (dạng chuỗi cách nhau bởi dấu cách: "openid profile email ...")
      if (typeof decoded?.scope === 'string') {
        decoded.scope
          .split(' ')
          .map((s: string) => s.trim())
          .filter(Boolean)
          .forEach((s: string) => allScopes.add(s));
      } else if (Array.isArray(decoded?.scope)) {
        decoded.scope.forEach((s: string) => allScopes.add(String(s).trim()));
      }

      // 2. Keycloak Authorization Services (authorization.permissions[].scopes)
      if (Array.isArray(decoded?.authorization?.permissions)) {
        decoded.authorization.permissions.forEach((perm: any) => {
          if (Array.isArray(perm?.scopes)) {
            perm.scopes.forEach((s: string) => {
              allScopes.add(s);
              // Lưu kèm cả tiền tố resource để truy vấn theo cú pháp resource:scope (ví dụ: ticket-service:view)
              if (perm.rsname) {
                allScopes.add(`${perm.rsname}:${s}`);
              }
            });
          }
        });
      }

      return Array.from(allScopes);
    } catch (err) {
      console.warn('[ScopeService] Lỗi khi trích xuất scopes từ token:', err);
      return [];
    }
  }
}
