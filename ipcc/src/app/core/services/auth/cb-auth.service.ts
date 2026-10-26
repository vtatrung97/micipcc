import {Injectable, isDevMode} from "@angular/core";
import {Router} from "@angular/router";
import {interval, Observable, Subscriber} from "rxjs";

import {JwtHelperService} from '@auth0/angular-jwt';
import {HttpClient} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {ResponseEnvelope} from "@core/models/response.model";
import {SERVICES} from "@env/environment";
import {OAuthService} from "angular-oauth2-oidc";
import {ToastService} from "@core/services/toast-service";


@Injectable({providedIn: 'root'})
export class CbAuthService {
    private _kzToken: any;
    private _kzRefreshToken: any;
    private _kzZone: any;
    private _kzSoftphoneRealm: string;
    private _impersonatedAid: any;

    private jwtHelper: JwtHelperService = new JwtHelperService();

    constructor(private router: Router, private http: HttpClient, private authSvc: AuthService,
                private oauthSvc: OAuthService, private toastSvc: ToastService) {
        this.init();
    }

    private init() {
        if (!this.authSvc.isAuthenticated()) return;

        try { // try to load kz_* from localStorage
            const cachedKzZone = localStorage.getItem('kz_zone');
            const cachedKzToken = localStorage.getItem('kz_token');
            const cachedKzRefreshToken  = localStorage.getItem('kz_refresh_token');
            const cachedKzSoftphoneRealm = localStorage.getItem('kz_softphone_realm');
            if (cachedKzZone && cachedKzToken && cachedKzRefreshToken && cachedKzSoftphoneRealm && !this.jwtHelper.isTokenExpired(cachedKzToken)
                && this.authSvc.kzUserId == this.jwtHelper.decodeToken(cachedKzToken).owner_id) {
                this._kzToken = cachedKzToken;
                this._kzRefreshToken = cachedKzRefreshToken;
                this._kzZone = JSON.parse(cachedKzZone);
                this._kzSoftphoneRealm = cachedKzSoftphoneRealm;
                isDevMode() && console.log("CbAuthService|initialized:", this);
            } else {
                localStorage.removeItem('kz_zone');
                localStorage.removeItem('kz_token');
                localStorage.removeItem('kz_refresh_token');
                localStorage.removeItem('kz_softphone_realm');
            }
        } catch (e) {
            console.log('[CbAuthService] Fail to decoding cached kz token', e);
        }
    }

    public maybeRequestKzToken(forceRequest?: boolean): Observable<string> {
        return new Observable((observer: Subscriber<string>) => {

            const onSuccess = (token: string) => {
                observer.next(token);
                observer.complete();
            };

            const onError = (error: any) => {
                console.log('[CbAuthService] Request kz token failed', error);
                observer.error(error);
                observer.complete();
            };

            if (forceRequest || !this._kzToken || this.jwtHelper.isTokenExpired(this._kzToken)) {
                this.http.get<ResponseEnvelope<any>>(`${SERVICES.ACCOUNT_API.url}/api/v1/realms/${this.authSvc.realmName}/users/${this.authSvc.userId}/zone/${this.authSvc.zoneAlias}/kz-token`).subscribe(res => {
                        if (res.status == 'success') {
                            this._kzZone = res.data.kzZone;
                            this._kzToken = res.data.kzToken;
                            this._kzSoftphoneRealm = res.data.kzSoftphoneRealm;
                            localStorage.setItem('kz_token', this._kzToken);
                            localStorage.setItem('kz_zone', JSON.stringify(this._kzZone));
                            localStorage.setItem('kz_softphone_realm', this._kzSoftphoneRealm);
                            this.requestRefreshToken(this._kzZone?.crossbarPublic).subscribe(
                                (res :any)=> {
                                    this._kzRefreshToken =  res['auth_token'];
                                    localStorage.setItem('kz_refresh_token', res['auth_token']);
                                    onSuccess(this._kzToken);
                                },
                                error => onError(error));
                        } else {
                            onError(res);
                        }
                    }, e => {
                        interval(3000).subscribe(res => {
                            this.logout();
                            onError(e);
                        });
                    }
                );
            } else {
                onSuccess(this._kzToken);
            }
        });
    }

    public requestRefreshToken(url: any, swapToken?: boolean) {
        if (swapToken && this._kzRefreshToken) {
            localStorage.setItem('kz_token', this._kzRefreshToken);
        }
        return this.http.put(`${url}/v2/auth`, JSON.stringify({"action": "refresh_token", "data": {}}));
    }


    public logout() {
        console.log('[CbAuthService] Logout called (bypassed)');
    }


    public impersonateAccount(accountId: string) {
        this._impersonatedAid = accountId;
    }

    get impersonatedAid(): string {
        return this._impersonatedAid;
    }

    get kzToken(): string {
        return this._kzToken;
    }

    get kzRefreshToken(): string {
        return this._kzRefreshToken;
    }

    get softphoneRealm(): string {
        return this._kzSoftphoneRealm;
    }

    get crossbar(): string {
        return this._kzZone ? this._kzZone.crossbarPublic : undefined;
    }

    get proxies(): string[] {
        return this._kzZone ? this._kzZone.wssProxiesPublic.split(',') : undefined;
    }

    get accountURI(): string {
        const aid = this._impersonatedAid ? this._impersonatedAid : this.authSvc.kzAccountId;
        return `${this.crossbar}/v2/accounts/${aid}`;
    }
}
