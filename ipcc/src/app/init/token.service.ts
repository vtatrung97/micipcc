import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { AbstractService } from '@core/services/abstract.service';
import { AuthService } from '@core/services/auth/auth.service';
import { KEYCLOAK } from '@env/environment';
import { AccountService } from '@core/services/auth/account.service';
import { Router } from '@angular/router';
import { ToastService } from "@core/services/toast-service";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class TokenService extends AbstractService {
  _permissions: any = null;
  _menu: any = null;
  _menuUrl: any = null;
  clients = [
    'account-server', 'ticket-service', 'chat-service', 'acd-service',
    'social-gateway', 'ccms-service', 'quality-service', 'bot-server',
    'happy-call-service', 'chat-server', 'service-report'
  ];

  constructor(
    http: HttpClient,
    private authSvc: AuthService,
    private accountService: AccountService,
    private router: Router,
    private toastSvc: ToastService,
    private translate: TranslateService,
  ) {
    super(http, toastSvc, translate);

    if (this.authSvc.isAuthenticated()) {
      const temp = localStorage.getItem('user_permissions');
      // const menu = localStorage.getItem('menu');
      // const menuUrl = localStorage.getItem('menuUrl');
      if (temp) {
        try {
          const cachedUserPermissions = JSON.parse(temp);
          if (this.authSvc.userId == cachedUserPermissions.userId) {
            this._permissions = cachedUserPermissions.permissions;
            isDevMode() && console.debug('[TokenService] cached user permissions', this._permissions);
          } else {
            localStorage.removeItem('user_permissions');
          }
          // this._menu = JSON.parse(menu);
          // this._menuUrl = JSON.parse(menuUrl);
        } catch (e) {
          // this._menu = menu;
          // this._menuUrl = menuUrl;
        }
      }
    }
  }

  async initAuthorizationList(): Promise<any> {
    localStorage.setItem('id_token_hint', this.authSvc.idTokenHint || '');

    if (this._permissions && this._menu && this._menuUrl) {
      return Promise.resolve();
    } else {
      this._permissions = {};
      try {
        await this.getMenus();
        this.saveUserPermissions();
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
  }

  private async getMenus(): Promise<any> {
    try {
      let menu = localStorage.getItem('menu');
      let menuUrl = localStorage.getItem('menuUrl');
      if (!menu || !menuUrl) {
        const { DEFAULT_IPCC_MENUS, DEFAULT_IPCC_URLS } = await import('../layouts/sidebar/menu');
        localStorage.setItem('menu', JSON.stringify(DEFAULT_IPCC_MENUS));
        localStorage.setItem('menuUrl', JSON.stringify(DEFAULT_IPCC_URLS));
        menu = JSON.stringify(DEFAULT_IPCC_MENUS);
        menuUrl = JSON.stringify(DEFAULT_IPCC_URLS);
      }
      this._menu = JSON.parse(menu);
      this._menuUrl = JSON.parse(menuUrl);
    } catch (e) {
      console.warn('[TokenService] Failed to load local menus:', e);
    }
  }

  private saveUserPermissions() {
    localStorage.setItem('user_permissions', JSON.stringify({
      userId: this.authSvc.userId,
      permissions: this._permissions
    }));
  }

  public checkRouter(url: string): boolean {
    // if (url === '/' || url === '/ticket') return true;
    // if (url.startsWith('/processX') || url.startsWith('/process') || url.startsWith('/procedure')) return true;
    // if (this._menuUrl && Array.isArray(this._menuUrl)) {
    //   return this._menuUrl.some((u: string) => u !== '' && url.includes(u));
    // }
    return true;
  }

  get SERVICE_URL(): string {
    return `${KEYCLOAK?.endpoint}/realms/${this.authSvc.tenant}/protocol/openid-connect/token`;
  }
}
