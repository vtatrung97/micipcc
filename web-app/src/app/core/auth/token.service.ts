import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private static cachedToken: string = '';

  /**
   * Lưu trữ token trong bộ nhớ runtime (được gọi từ AuthService khi nhận token mới)
   */
  public static setToken(token: string): void {
    this.cachedToken = token || '';
  }

  /**
   * Lấy chuỗi Access Token hiện tại (ưu tiên cache trong memory, sau đó tới sessionStorage và localStorage)
   */
  public static getAccessToken(): string {
    if (this.cachedToken) {
      return this.cachedToken;
    }
    return (
      sessionStorage.getItem('access_token') ||
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('id_token') ||
      localStorage.getItem('id_token') ||
      ''
    );
  }

  /**
   * Giải mã payload JWT Token
   */
  public static decodeToken(rawToken?: string): any {
    const token = rawToken || this.getAccessToken();
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      // Base64URL to Base64
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

  /**
   * Lấy danh sách scopes theo client name từ Keycloak Token
   * Hỗ trợ đầy đủ:
   * 1. Keycloak resource_access[clientName].roles / scopes
   * 2. Keycloak Authorization Services authorization.permissions (rsname === clientName)
   * 3. Custom client claim (decoded[clientName]?.scopes)
   * 4. OAuth2 scope claim dạng "clientName:scope"
   *
   * @example
   * const listScopes = TokenService.getListScopes('ticket-service');
   * // -> ['view', 'create', 'update', 'delete']
   */
  public static getListScopes(clientName: string): string[] {
    if (!clientName) return [];

    const decoded = this.decodeToken();
    if (!decoded) return [];

    const scopes = new Set<string>();

    // 1. Keycloak resource_access (Client Roles thường được ánh xạ làm scopes)
    const clientResource = decoded.resource_access?.[clientName];
    if (clientResource) {
      if (Array.isArray(clientResource.roles)) {
        clientResource.roles.forEach((r: string) => scopes.add(r));
      }
      if (Array.isArray(clientResource.scopes)) {
        clientResource.scopes.forEach((s: string) => scopes.add(s));
      }
    }

    // 2. Keycloak Authorization Services (authorization.permissions có rsname === clientName)
    if (Array.isArray(decoded.authorization?.permissions)) {
      decoded.authorization.permissions.forEach((perm: any) => {
        if (perm.rsname === clientName || perm.rsid === clientName) {
          if (Array.isArray(perm.scopes)) {
            perm.scopes.forEach((s: string) => scopes.add(s));
          }
        }
      });
    }

    // 3. Custom claim theo clientName
    if (decoded[clientName]) {
      if (Array.isArray(decoded[clientName].scopes)) {
        decoded[clientName].scopes.forEach((s: string) => scopes.add(s));
      }
      if (Array.isArray(decoded[clientName].roles)) {
        decoded[clientName].roles.forEach((r: string) => scopes.add(r));
      }
    }

    // 4. OAuth2 standard scopes có tiền tố "clientName:action"
    const prefix = `${clientName}:`;
    if (typeof decoded.scope === 'string') {
      decoded.scope
        .split(' ')
        .map((s: string) => s.trim())
        .forEach((s: string) => {
          if (s.startsWith(prefix)) {
            scopes.add(s.substring(prefix.length));
          }
        });
    }

    return Array.from(scopes);
  }

  /**
   * Kiểm tra nhanh client có scope chỉ định hay không
   * @example
   * this.isCreate = TokenService.hasScope('ticket-service', 'create');
   */
  public static hasScope(clientName: string, scope: string): boolean {
    if (!clientName || !scope) return false;
    const scopes = this.getListScopes(clientName);
    return scopes.includes(scope.trim());
  }

  /**
   * Kiểm tra xem client có ít nhất 1 trong các scope này không (OR)
   */
  public static hasAnyScope(clientName: string, scopes: string[]): boolean {
    if (!scopes || scopes.length === 0) return true;
    const currentScopes = this.getListScopes(clientName);
    return scopes.some(s => currentScopes.includes(s.trim()));
  }

  /**
   * Kiểm tra xem client có tất cả các scope này không (AND)
   */
  public static hasAllScopes(clientName: string, scopes: string[]): boolean {
    if (!scopes || scopes.length === 0) return true;
    const currentScopes = this.getListScopes(clientName);
    return scopes.every(s => currentScopes.includes(s.trim()));
  }

  // --- Các method instance để có thể inject qua Angular DI nếu muốn ---
  public getListScopes(clientName: string): string[] {
    return TokenService.getListScopes(clientName);
  }

  public hasScope(clientName: string, scope: string): boolean {
    return TokenService.hasScope(clientName, scope);
  }

  public hasAnyScope(clientName: string, scopes: string[]): boolean {
    return TokenService.hasAnyScope(clientName, scopes);
  }

  public hasAllScopes(clientName: string, scopes: string[]): boolean {
    return TokenService.hasAllScopes(clientName, scopes);
  }

  public getAccessToken(): string {
    return TokenService.getAccessToken();
  }

  public decodeToken(rawToken?: string): any {
    return TokenService.decodeToken(rawToken);
  }
}
