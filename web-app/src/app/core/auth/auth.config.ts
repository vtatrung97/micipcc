import { AuthConfig } from 'angular-oauth2-oidc';
import { KEYCLOAK } from '@environments/environment';

/**
 * Cấu hình OAuth2 / OpenID Connect (OIDC) cho Keycloak Identity Provider
 * Tự động nạp giá trị từ window.env (thông qua KEYCLOAK trong environment.ts)
 */
export function buildAuthConfig(): AuthConfig {
  const endpoint = (KEYCLOAK?.endpoint || 'http://localhost:8080').replace(/\/+$/, '');
  const realm = KEYCLOAK?.realm || 'ticket-flow';
  const clientId = KEYCLOAK?.clientId || 'ticket-flow-web';

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4200';

  return {
    // URL phát hành Token của Keycloak Realm
    issuer: `${endpoint}/realms/${realm}`,

    // URL chuyển hướng sau khi đăng nhập thành công
    redirectUri: `${origin}/`,

    // URL chuyển hướng sau khi đăng xuất
    postLogoutRedirectUri: `${origin}/`,

    // Client ID đã đăng ký trong Keycloak
    clientId: clientId,

    // Sử dụng chuẩn Authorization Code Flow with PKCE
    responseType: 'code',

    // Scopes yêu cầu
    scope: 'openid profile email offline_access',

    // Cấu hình HTTPS và Debug
    showDebugInformation: KEYCLOAK?.showDebugInformation ?? false,
    requireHttps: KEYCLOAK?.requireHttps ?? false,
    strictDiscoveryDocumentValidation: KEYCLOAK?.strictDiscoveryDocumentValidation ?? false,

    // Bỏ qua kiểm tra khớp Issuer nếu sử dụng Reverse Proxy / Gateway
    skipIssuerCheck: true,

    // Xóa hash trên URL sau khi nhận code / token
    clearHashAfterLogin: true
  };
}
