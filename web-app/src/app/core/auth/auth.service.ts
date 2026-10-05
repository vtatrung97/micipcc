import { Injectable } from '@angular/core';
import { OAuthService, OAuthEvent } from 'angular-oauth2-oidc';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { buildAuthConfig } from './auth.config';
import { TokenService } from './token.service';

export interface KeycloakUserProfile {
  sub?: string;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  email_verified?: boolean;
  roles?: string[];
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly jwtHelper = new JwtHelperService();
  private readonly isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private readonly userProfileSubject = new BehaviorSubject<KeycloakUserProfile | null>(null);

  public readonly isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();
  public readonly userProfile$: Observable<KeycloakUserProfile | null> = this.userProfileSubject.asObservable();

  constructor(private oauthSvc: OAuthService) {
    // Lắng nghe các sự kiện OAuth lifecycle (token_received, token_refreshed, logout...)
    this.oauthSvc.events.subscribe((event: OAuthEvent) => {
      if (['token_received', 'token_refreshed'].includes(event.type)) {
        this.updateAuthState();
      } else if (['logout', 'session_terminated', 'token_expires'].includes(event.type)) {
        this.clearAuthState();
      }
    });
  }

  /**
   * Khởi tạo cấu hình và nạp OIDC Discovery Document từ Keycloak Server
   */
  public async initAuth(): Promise<boolean> {
    try {
      const config = buildAuthConfig();
      this.oauthSvc.configure(config);

      // Thử nạp discovery document và xử lý login code nếu vừa redirect về
      const canConnect = await this.oauthSvc.loadDiscoveryDocumentAndTryLogin();

      if (this.oauthSvc.hasValidAccessToken()) {
        // Chỉ bật cơ chế refresh token khi có refresh token hợp lệ trong session
        if (this.oauthSvc.getRefreshToken()) {
          try {
            this.oauthSvc.setupAutomaticSilentRefresh();
          } catch (e) {
            console.warn('[Keycloak Auth] Bỏ qua silent refresh:', e);
          }
        }
        this.updateAuthState();
        console.log('[Keycloak Auth] Đăng nhập thành công với Keycloak. Token hợp lệ.');
        return true;
      }

      this.clearAuthState();
      return canConnect;
    } catch (error) {
      console.warn('[Keycloak Auth] Không thể kết nối tới Keycloak Discovery Server (chạy chế độ dự phòng):', error);
      this.clearAuthState();
      return false;
    }
  }

  /**
   * Kích hoạt luồng đăng nhập chuyển hướng đến Keycloak Login Page
   */
  public login(): void {
    this.oauthSvc.initLoginFlow();
  }

  /**
   * Đăng xuất khỏi Keycloak và xóa session
   */
  public logout(): void {
    this.clearAuthState();
    this.oauthSvc.logOut();
  }

  /**
   * Lấy Access Token hiện tại (Bearer Token)
   */
  public getAccessToken(): string {
    return this.oauthSvc.getAccessToken() || '';
  }

  /**
   * Lấy ID Token hiện tại
   */
  public getIdToken(): string {
    return this.oauthSvc.getIdToken() || '';
  }

  /**
   * Kiểm tra người dùng đã đăng nhập và token còn hạn hay không
   */
  public isLoggedIn(): boolean {
    return this.oauthSvc.hasValidAccessToken();
  }

  /**
   * Lấy thông tin User Profile đã decode từ Keycloak Token
   */
  public getUserProfile(): KeycloakUserProfile | null {
    return this.userProfileSubject.value;
  }

  /**
   * Trích xuất danh sách Roles từ Keycloak Realm Access & Resource Access
   */
  public getUserRoles(): string[] {
    const token = this.getAccessToken();
    if (!token) return [];

    try {
      const decoded: any = this.jwtHelper.decodeToken(token);
      const realmRoles: string[] = decoded?.realm_access?.roles || [];
      const resourceRoles: string[] = [];

      if (decoded?.resource_access) {
        Object.values(decoded.resource_access).forEach((resource: any) => {
          if (Array.isArray(resource?.roles)) {
            resourceRoles.push(...resource.roles);
          }
        });
      }

      return Array.from(new Set([...realmRoles, ...resourceRoles]));
    } catch (err) {
      console.warn('[Keycloak Auth] Lỗi giải mã token roles:', err);
      return [];
    }
  }

  /**
   * Kiểm tra xem user có chứa role chỉ định hay không
   */
  public hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  /**
   * Lấy danh sách scopes từ Access Token (OAuth2 scopes & Keycloak authorization scopes)
   */
  public getScopes(): string[] {
    const token = this.getAccessToken();
    if (!token) return [];

    try {
      const decoded: any = this.jwtHelper.decodeToken(token);
      const scopes = new Set<string>();

      // 1. OAuth2 standard scopes claim
      if (typeof decoded?.scope === 'string') {
        decoded.scope
          .split(' ')
          .map((s: string) => s.trim())
          .filter(Boolean)
          .forEach((s: string) => scopes.add(s));
      } else if (Array.isArray(decoded?.scope)) {
        decoded.scope.forEach((s: string) => scopes.add(String(s).trim()));
      }

      // 2. Keycloak Authorization Services scopes
      if (Array.isArray(decoded?.authorization?.permissions)) {
        decoded.authorization.permissions.forEach((perm: any) => {
          if (Array.isArray(perm?.scopes)) {
            perm.scopes.forEach((s: string) => {
              scopes.add(s);
              if (perm.rsname) {
                scopes.add(`${perm.rsname}:${s}`);
              }
            });
          }
        });
      }

      return Array.from(scopes);
    } catch {
      return [];
    }
  }

  /**
   * Kiểm tra xem user có chứa scope chỉ định hay không
   */
  public hasScope(scope: string): boolean {
    if (!scope) return false;
    return this.getScopes().includes(scope.trim());
  }

  /**
   * Lấy danh sách scopes theo client name (Keycloak Client / Resource)
   */
  public getListScopes(clientName: string): string[] {
    return TokenService.getListScopes(clientName);
  }

  private updateAuthState(): void {
    const hasToken = this.oauthSvc.hasValidAccessToken();
    this.isLoggedInSubject.next(hasToken);

    if (hasToken) {
      const claims: any = this.oauthSvc.getIdentityClaims() || {};
      const token = this.getAccessToken();
      TokenService.setToken(token);
      const decoded: any = token ? this.jwtHelper.decodeToken(token) : {};

      const profile: KeycloakUserProfile = {
        ...claims,
        preferred_username: claims.preferred_username || decoded?.preferred_username || 'user',
        name: claims.name || decoded?.name || claims.preferred_username || 'Người dùng',
        email: claims.email || decoded?.email,
        roles: this.getUserRoles()
      };

      this.userProfileSubject.next(profile);
    } else {
      this.clearAuthState();
    }
  }

  private clearAuthState(): void {
    TokenService.setToken('');
    this.isLoggedInSubject.next(false);
    this.userProfileSubject.next(null);
  }
}
