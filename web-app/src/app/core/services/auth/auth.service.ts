import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {AuthConfig, OAuthService, OAuthStorage} from "angular-oauth2-oidc";
import {Subject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {KEYCLOAK, ZONE_ALIAS} from "@env/environment";
import {JwtHelperService} from "@auth0/angular-jwt";
import {v4 as uuidv4} from "uuid";


export function AuthzCodeFlowConfig(realm: string): AuthConfig {
    return {
        issuer: `${KEYCLOAK.endpoint}/realms/${realm}`,
        redirectUri: window.location.origin,
        clientId: 'agent-web',
        scope: 'openid profile email',
        responseType: 'code',
        userinfoEndpoint: `${KEYCLOAK.endpoint}/realms/${realm}/protocol/openid-connect/userinfo`,
        requireHttps: KEYCLOAK.requireHttps,
        showDebugInformation: KEYCLOAK.showDebugInformation,
        strictDiscoveryDocumentValidation: KEYCLOAK.strictDiscoveryDocumentValidation,
        logoutUrl: `${KEYCLOAK.endpoint}/realms/${realm}/protocol/openid-connect/logout?client_id=agent-web&post_logout_redirect_uri=${encodeURIComponent(window.location.origin)}`
    };
}

@Injectable({providedIn: 'root'})
export class AuthService {
    private _tenant: string;
    private _zoneAlias: string;
    private _impersonatedTenant: string;
    public authenticationEventObservable: Subject<boolean> = new Subject<boolean>();
    private jwtHelper: JwtHelperService = new JwtHelperService();

    sessionId = uuidv4();

    constructor(private router: Router, private http: HttpClient, private oauthSvc: OAuthService) {

        const {hostname} = new URL(window.location.href);
        let sub1: string, sub2: string;
        [sub1, sub2] = hostname.split('.'); // subdomain
        this._tenant = sub1;
        Object.keys(ZONE_ALIAS).forEach(key => {
            const typedKey = key as keyof typeof ZONE_ALIAS;
            if (ZONE_ALIAS[typedKey] === sub1) {
                this._zoneAlias = sub1;
                this._tenant = sub2;
            }
        });

        this._impersonatedTenant = this._tenant;
        console.log('[AuthService] Construct with realm:', this._tenant);
        this.oauthSvc.configure(AuthzCodeFlowConfig(this._tenant));

        /*  pyc 1355: 21/08/2026 */
        this.oauthSvc.events.subscribe(event => {
            if (event.type === 'token_refresh_error') {
                console.warn('[AuthService] Refresh token that bai, phien da het han:', event);
                this.logout();
            }
        });
    }

    public isLoggedIn(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.isAuthenticated()) {
                resolve(true);
            } else {
                console.log(`[AuthService] Tokens is not valid, try re-login via auth server`);

                this.oauthSvc.loadDiscoveryDocumentAndLogin().then((result: boolean) => {
                    console.log('[AuthService] Login result is: ' + result);

                    this.oauthSvc.setupAutomaticSilentRefresh(); // Optional
                    this.authenticationEventObservable.next(result);
                    resolve(result);
                }).catch((error: any) => {
                    console.log('[AuthService] Login error: ', error);
                    this.logout();
                    reject(false);
                });
            }
        })
    }

    public logout() {
        this.oauthSvc.logOut({id_token_hint: localStorage.getItem('id_token_hint')});
    }

    public isAuthenticated(): boolean {
        return this.oauthSvc.hasValidAccessToken() && this.oauthSvc.hasValidIdToken() && !this.jwtHelper.isTokenExpired(this.accessToken);
    }

    get accessToken(): string {
        return this.oauthSvc.getAccessToken();
    }

    get realmName(): string {
        let issuer = this.claims["iss"];
        return issuer.substring(issuer.lastIndexOf("/") + 1);
    }

    get kzAccountId(): string {
        return this.claims['kz-aid'];
    }

    get kzUserId(): string {
        return this.claims['kz-uid'];
    }

    get userId(): string {
        return this.claims['sub'];
    }

    /**
     * Id phiên đăng nhập Keycloak (claim sid / session_state). Mỗi lần đăng nhập lại có giá trị mới,
     * dùng để phân biệt "lần đăng nhập" (khác với reload trang trong cùng phiên).
     */
    get loginSessionId(): string {
        return this.claims?.['sid'] || this.claims?.['session_state'] || '';
    }

    get passportUserId(): string {
        return this.claims['userId'];
    }

    get deptId(): string {
        return this.claims['deptId'];
    }

    get username(): string {
        return this.claims['preferred_username'];
    }

    get tenant(): string {
        return this._tenant;
    }

    get zoneAlias(): string {
        return this._zoneAlias;
    }

    get idTokenHint(): string {
        return this.oauthSvc.getIdToken();
    }

    get presenceId() {
        return localStorage.getItem('presence_id');
    }

    get roles(): string[] | null {
        let token = this.oauthSvc.getAccessToken();
        try {
            return JSON.parse(atob(token.split('.')[1]))['realm_access']['roles'];
        } catch (e) {
            return null;
        }
    }

    /**
     * Bản v2 của getter roles: giải mã payload JWT đúng chuẩn base64url + UTF-8.
     * Getter roles cũ dùng atob() trực tiếp nên trả null với token có ký tự '-' hoặc '_'
     * (thường gặp khi claim name có dấu). Giữ nguyên roles cũ để không ảnh hưởng các chỗ đang dùng;
     * code mới nên dùng rolesV2.
     */
    get rolesV2(): string[] | null {
        const token = this.oauthSvc.getAccessToken();
        try {
            return AuthService.decodeJwtPayload(token)?.['realm_access']?.['roles'] ?? null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Giải mã phần payload của JWT.
     * JWT dùng base64url (ký tự '-' và '_', không padding) nên không thể đưa thẳng vào atob():
     * với token có '-' hoặc '_' atob() ném InvalidCharacterError và getter roles trả null.
     * Đồng thời giải mã UTF-8 để các claim có dấu (name, given_name...) đọc đúng.
     */
    static decodeJwtPayload(token: string): any {
        const part = token.split('.')[1];
        const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
        const binary = atob(padded);
        const utf8 = decodeURIComponent(
            Array.from(binary, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        );
        return JSON.parse(utf8);
    }

    public hasScope(scope: string): boolean {
        return this.scopes.indexOf(scope) >= 0;
    }

    get claims() {
        return this.oauthSvc.getIdentityClaims();
    }

    get scopes(): string[] {
        const _scopes: string[] = [];
        const _grantedScopes: any = this.oauthSvc.getGrantedScopes();
        for (let index in _grantedScopes) {
            _grantedScopes[index].split(' ').forEach((temp: string) => _scopes.push(temp));
        }
        return _scopes;
    }

    get privLevel() {
        return localStorage.getItem('priv_level');
    }

    public async tryRefreshToken(): Promise<boolean> {
        try {
            await this.oauthSvc.refreshToken();
            return true;
        } catch (e) {
            return false;
        }
    }
}

