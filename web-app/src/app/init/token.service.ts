import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { AbstractService } from '@core/services/abstract.service';
import { AuthService } from '@core/services/auth/auth.service';
import { KEYCLOAK } from '@env/environment';
import { AccountService } from '@core/services/auth/account.service';
import { Router } from '@angular/router';
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";

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
        // await this.getMenus();
        // await this.getSystemMenu();
        this.saveUserPermissions();
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
  }

  // private async getMenus(): Promise<any> {
  //   try {
  //     const rs = await this.accountService.getMenu().toPromise();
  //     if (rs?.data) {
  //       localStorage.setItem('menu', JSON.stringify(rs.data.listMenuDTO || []));
  //       localStorage.setItem('menuUrl', JSON.stringify(rs.data.listUrl || []));
  //       this._menu = rs.data.listMenuDTO;
  //       this._menuUrl = rs.data.listUrl;
  //     }
  //   } catch (e) {
  //     console.warn('[TokenService] Failed to getMenus:', e);
  //   }
  // }

  // private async getSystemMenu(): Promise<any> {
  //   try {
  //     const isEnabled = localStorage.getItem('menu_system_enabled') !== 'false';
  //     if (isEnabled) {
  //       const rs = await this.accountService.getMenuSystem().toPromise();
  //       const list = rs?.data?.listMenuDTO || [];
  //       localStorage.setItem('menu_system', JSON.stringify(list));
  //     }
  //   } catch (error) {
  //     console.error('[TokenService] Failed to fetch system menu', error);
  //   }
  // }

  private saveUserPermissions() {
    localStorage.setItem('user_permissions', JSON.stringify({
      userId: this.authSvc.userId,
      permissions: this._permissions
    }));
  }

  public checkRouter(url: string): boolean {
    // return url == '/'
    // || (this._menuUrl && this._menuUrl.filter(
    //   (_url: any) => _url != '' && url.includes(_url)).length > 0) || url.includes('role-menu') || url.includes('personal-profile') || url.includes('process');
    return true;
  }

  get SERVICE_URL(): string {
    return `${KEYCLOAK?.endpoint}/realms/${this.authSvc.tenant}/protocol/openid-connect/token`;
  }
}
