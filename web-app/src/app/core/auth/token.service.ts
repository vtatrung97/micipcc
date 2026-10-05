import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { KEYCLOAK } from '@environments/environment';

export interface RequiredPermission {
  resourceServer: string;
  rsname: string;
  scopes?: string[];
}

export interface PermissionConfig {
  permissions: RequiredPermission[];
  mode?: 'AND' | 'OR';
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private static cachedToken: string = '';

  public _permissions: any = null;
  public _menu: any = null;
  public _menuUrl: any = null;

  public clients: string[] = [
    'ticket-flow'
  ];

  constructor(
    private http: HttpClient,
    private authSvc: AuthService,
    private router: Router
  ) {
    if (this.authSvc.isLoggedIn()) {
      const temp = localStorage.getItem('user_permissions');
      const menu = localStorage.getItem('menu');
      const menuUrl = localStorage.getItem('menuUrl');

      if (temp && menu && menuUrl) {
        const cachedUserPermissions = this.decrypt(temp);
        const currentUserId = this.authSvc.getUserProfile()?.sub || '';

        if (cachedUserPermissions && (!currentUserId || currentUserId === cachedUserPermissions.userId)) {
          this._permissions = cachedUserPermissions.permissions;
          isDevMode() && console.debug('[TokenService] cached user permissions', this._permissions);
        } else {
          localStorage.removeItem('user_permissions');
        }

        this._menu = this.decrypt(menu);
        this._menuUrl = this.decrypt(menuUrl);
      }
    } else {
      this.clearCachedPermissions();
    }
  }

  /**
   * URL Token endpoint của Keycloak để trao đổi UMA Ticket
   */
  get SERVICE_URL(): string {
    let endpoint = (KEYCLOAK?.endpoint || 'http://192.168.10.24:8081').replace(/\/+$/, '');
    const realm = KEYCLOAK?.realm || 'ticket-flow';
    return `${endpoint}/realms/${realm}/protocol/openid-connect/token`;
  }

  /**
   * Khởi tạo danh sách quyền UMA từ Keycloak cho tất cả các Clients
   */
  public async initAuthorizationList(): Promise<any> {
    const idToken = this.authSvc.getIdToken();
    if (idToken) {
      localStorage.setItem('id_token_hint', idToken);
    }

    if (this._permissions && Object.keys(this._permissions).length > 0) {
      return Promise.resolve(this._permissions);
    } else {
      this._permissions = {};
      try {
        for (const client of this.clients) {
          await this.getPermissions(client);
        }
        this.saveUserPermissions();
        isDevMode() && console.debug('[TokenService] user permissions loaded: ', this._permissions);
        return Promise.resolve(this._permissions);
      } catch (error) {
        console.error('[TokenService] Lỗi khi nạp Authorization permissions:', error);
        return Promise.reject(error);
      }
    }
  }

  /**
   * Gọi Keycloak token endpoint lấy permissions của một client cụ thể qua UMA Ticket
   */
  public async getPermissions(resourceServerId: string): Promise<any> {
    const accessToken = TokenService.getAccessToken();
    if (!accessToken) {
      console.warn(`[TokenService] Không có Access Token, bỏ qua UMA request cho client '${resourceServerId}'.`);
      this._permissions[resourceServerId] = [];
      return [];
    }

    const body = new HttpParams()
      .set('grant_type', 'urn:ietf:params:oauth:grant-type:uma-ticket')
      .set('audience', resourceServerId)
      .set('response_mode', 'permissions');

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${accessToken}`
    });

    try {
      const res: any = await this.http.post(this.SERVICE_URL, body.toString(), { headers }).toPromise();
      this._permissions[resourceServerId] = res || [];
      return res;
    } catch (err: any) {
      const detail = err?.error?.error_description || err?.error?.error || err?.statusText || err?.message;
      console.warn(`[TokenService] Không thể lấy permissions cho client '${resourceServerId}' từ ${this.SERVICE_URL}:`, detail);
      this._permissions[resourceServerId] = [];
      return [];
    }
  }

  /**
   * Lưu thông tin permissions vào localStorage
   */
  private saveUserPermissions(): void {
    const userId = this.authSvc.getUserProfile()?.sub || '';
    localStorage.setItem('user_permissions', this.encrypt({
      userId: userId,
      permissions: this._permissions
    }));
  }

  /**
   * Kiểm tra danh sách permissions bắt buộc
   */
  public checkPermissions(requiredPermissions: RequiredPermission[]): boolean {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    for (const requiredPermission of requiredPermissions) {
      const resourceServerPermissions = this._permissions ? this._permissions[requiredPermission.resourceServer] : null;
      if (!resourceServerPermissions) return false;

      const found = resourceServerPermissions.filter(
        (resourcePermission: any) => resourcePermission.rsname === requiredPermission.rsname
      );

      if (found.length === 0) return false;
    }
    return true;
  }

  /**
   * Kiểm tra quyền theo cấu hình AND / OR
   */
  public checkUserPermissions(config: PermissionConfig): boolean {
    const { permissions, mode = 'OR' } = config;
    if (!permissions || permissions.length === 0) return true;

    const results = permissions.map(p => this.checkSinglePermission(p));
    return mode === 'AND' ? results.every(Boolean) : results.some(Boolean);
  }

  /**
   * Kiểm tra đơn lẻ một tài nguyên và danh sách scopes
   */
  private checkSinglePermission(p: RequiredPermission): boolean {
    const resourceServerPermissions = this._permissions ? this._permissions[p.resourceServer] : null;
    if (!resourceServerPermissions) return false;

    const matchedResources = resourceServerPermissions.filter(
      (res: any) => res.rsname === p.rsname
    );

    if (matchedResources.length === 0) return false;

    if (p.scopes && p.scopes.length > 0) {
      return p.scopes.every(scope =>
        matchedResources.some((res: any) => res.scopes?.includes(scope))
      );
    }

    return true;
  }

  /**
   * Kiểm tra quyền truy cập route theo menu đã cấp
   */
  public checkRoute(url: string): boolean {
    return (
      url === '/' ||
      (this._menuUrl && this._menuUrl.filter((_url: any) => _url !== '' && url.includes(_url)).length > 0) ||
      url.includes('role-menu') ||
      url.includes('personal-profile')
    );
  }

  /**
   * Lấy danh sách scopes theo clientName từ user_permissions đã lưu
   */
  public static getListScopes(clientName: string): string[] {
    let listScopes: string[] = [];
    const temp = localStorage.getItem('user_permissions');
    if (!temp) {
      // Fallback: nếu chưa gọi UMA, thử lấy từ token thông thường (resource_access)
      const decoded = TokenService.decodeToken();
      if (decoded?.resource_access?.[clientName]?.roles) {
        return decoded.resource_access[clientName].roles;
      }
      return [];
    }

    let cachedUserPermissions: any;
    try {
      cachedUserPermissions = JSON.parse(decodeURIComponent(escape(atob(temp))));
    } catch {
      try {
        cachedUserPermissions = JSON.parse(temp);
      } catch {
        return [];
      }
    }

    const resource = cachedUserPermissions?.permissions?.[clientName];
    if (resource != undefined && resource.length > 0) {
      for (const i of resource) {
        if (i.scopes != undefined) {
          listScopes = listScopes.concat(i.scopes);
        }
      }
    }
    return Array.from(new Set(listScopes));
  }

  /**
   * Kiểm tra nhanh client có scope chỉ định hay không
   */
  public static hasScope(clientName: string, scope: string): boolean {
    if (!clientName || !scope) return false;
    const scopes = this.getListScopes(clientName);
    return scopes.includes(scope.trim());
  }

  public static hasAnyScope(clientName: string, scopes: string[]): boolean {
    if (!scopes || scopes.length === 0) return true;
    const currentScopes = this.getListScopes(clientName);
    return scopes.some(s => currentScopes.includes(s.trim()));
  }

  public static hasAllScopes(clientName: string, scopes: string[]): boolean {
    if (!scopes || scopes.length === 0) return true;
    const currentScopes = this.getListScopes(clientName);
    return scopes.every(s => currentScopes.includes(s.trim()));
  }

  // --- Các tiện ích mã hóa / giải mã lưu trữ ---
  private encrypt(data: any): string {
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    } catch {
      return JSON.stringify(data);
    }
  }

  private decrypt(data: string): any {
    try {
      return JSON.parse(decodeURIComponent(escape(atob(data))));
    } catch {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
  }

  private clearCachedPermissions(): void {
    localStorage.removeItem('user_permissions');
    localStorage.removeItem('menu');
    localStorage.removeItem('menu_system');
    localStorage.removeItem('menuUrl');
    localStorage.removeItem('listServiceOwner');
    localStorage.removeItem('selectedServiceOwner');
  }

  // --- Các static helper methods cho Access Token ---
  public static setToken(token: string): void {
    this.cachedToken = token || '';
  }

  public static getCookie(name: string): string {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : '';
  }

  public static getAccessToken(): string {
    if (this.cachedToken) {
      return this.cachedToken;
    }
    return (
      this.getCookie('access_token') ||
      this.getCookie('token') ||
      this.getCookie('jwt') ||
      sessionStorage.getItem('access_token') ||
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('id_token') ||
      localStorage.getItem('id_token') ||
      ''
    );
  }

  public static decodeToken(rawToken?: string): any {
    const token = rawToken || this.getAccessToken();
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(payload)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    } catch (err) {
      console.warn('[TokenService] Lỗi giải mã JWT Token:', err);
      return null;
    }
  }

  // DI Instance wrappers
  public getListScopes(clientName: string): string[] {
    return TokenService.getListScopes(clientName);
  }

  public hasScope(clientName: string, scope: string): boolean {
    return TokenService.hasScope(clientName, scope);
  }
}
