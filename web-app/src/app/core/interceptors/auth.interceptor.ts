import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthService } from "../services/auth/auth.service";
import { OAuthResourceServerErrorHandler, OAuthStorage } from "angular-oauth2-oidc";
import { catchError, switchMap, tap } from "rxjs/operators";
import { SERVICES } from "@env/environment";
import { ToastService } from "@core/services/toast-service";
import { CookieService } from "ngx-cookie-service";
import { KEYCLOAK } from "@env/environment.k8s";
import { CbAuthService } from "@core/services/auth/cb-auth.service";
import { from } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private authSvc: AuthService,
        private authStorage: OAuthStorage,
        private toastSvc: ToastService,
        private errorHandler: OAuthResourceServerErrorHandler,
        private cookieService: CookieService,
        private cbAuthService: CbAuthService) {
    }

    private shouldTokenBeInjectedIntoRequest(url: string): boolean {
        let found = false;

        if (url.startsWith(KEYCLOAK.endpoint)) {
            found = true;
        }

        if (this.cbAuthService.crossbar && url.startsWith(this.cbAuthService.crossbar)) {
            found = false;
            return found;
        }

        for (let service of Object.values(SERVICES)) {
            if (service.authJwt && url.startsWith(service.url)) {
                found = true;
                break;
            }
        }
        return found;
    }

    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let url = req.url.toLowerCase();
        let groupId = localStorage.getItem('selectedServiceOwner');
        if (!this.shouldTokenBeInjectedIntoRequest(url)) {
            return next.handle(req);
        }
        if (isDevMode()) console.debug('Injecting auth token for:', url)

        let headers = req.headers
            .set('Authorization', `Bearer ${this.authStorage.getItem('access_token')}`)
            .set('Accept-Language', this.cookieService.get('lang') ? this.cookieService.get('lang') : "vi");

        if (!url.startsWith(KEYCLOAK.endpoint)) { //không inject 'x-ipcc2-realm' khi request tới keycloak
            headers = headers.set('x-ipcc2-realm', this.authSvc.tenant);
            if (groupId) {
                headers = headers.set('groupId', groupId);
            }
        }

        req = req.clone({ headers });
        /*  pyc 1355: 21/08/2026: check them loi 401 de dieu huong logout khi het phien */
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                // if (error.status === 401 || error.status === 403) {
                //     return from(this.authSvc.tryRefreshToken()).pipe(
                //         switchMap(refreshed => {
                //             if (!refreshed) {
                //                 this.authSvc.logout();
                //             } else {
                //                 this.errorHandler.handleError(error as any);
                //             }
                //             return throwError(error);
                //         }),
                //     );
                // }
                if (!this.authSvc.isAuthenticated()) {
                    this.authSvc.logout();
                } else {
                    this.errorHandler.handleError(error as any);
                }
                return throwError(error);
            }),
        );
    }
}
