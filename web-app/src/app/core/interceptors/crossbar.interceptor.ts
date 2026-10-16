import {HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable, isDevMode} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject, Observable, throwError} from "rxjs";
import {AuthService} from "../services/auth/auth.service";
import {CbAuthService} from "../services/auth/cb-auth.service";
import {catchError, filter, finalize, switchMap, take} from "rxjs/operators";


@Injectable()
export class CrossbarInterceptor implements HttpInterceptor {
    isRefreshingToken = false;
    tokenBehaviorSubject$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private router: Router, private authSvc: AuthService, private cbAuthSvc: CbAuthService) {
    }

    private isCrossbarRequest(url: string): boolean {
        return this.cbAuthSvc.crossbar != undefined && url.startsWith(this.cbAuthSvc.crossbar);
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
        let url = req.url.toLowerCase();
        if (!this.isCrossbarRequest(url)) return next.handle(req);

        return next.handle(this.injectToken(req)).pipe(catchError(error => {
            if (error instanceof HttpErrorResponse && (<HttpErrorResponse>error).status === 401) {
                return this.handle401Error(req, next);
            } else if (error instanceof HttpErrorResponse && (<HttpErrorResponse>error).status === 412) {
                return this.handle412Error(req, next);
            } else {
                return throwError(error);
            }
        }))
    }

    handle401Error(req: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshingToken) {
            isDevMode() && console.log("[CbInterceptor] Error#401 with last CB request, get new token for re-request");

            this.isRefreshingToken = true;
            this.tokenBehaviorSubject$.next(null); // Reset here so that the following requests wait until the token comes back from the refreshToken call.

            return this.cbAuthSvc.maybeRequestKzToken(true).pipe(
                switchMap(ok => {
                    isDevMode() && console.log("[CbInterceptor] Receive new token, do re-request");
                    this.tokenBehaviorSubject$.next(this.cbAuthSvc.kzToken);
                    return next.handle(this.injectToken(req));
                }),
                catchError(error => Observable.throw(error)),
                finalize(() => this.isRefreshingToken = false));
        } else {
            return this.tokenBehaviorSubject$.pipe(
                filter((token: any) => token != null),
                take(1),
                switchMap(token => {
                    return next.handle(this.injectToken(req));
                })
            );
        }
    }

    handle412Error(req: HttpRequest<any>, next: HttpHandler) {
        return next.handle(this.injectToken(req));//re request if 412
    }

    injectToken(req: HttpRequest<any>): HttpRequest<any> {
        if (!this.cbAuthSvc.kzToken) return req;

        if (req.url.toLowerCase().endsWith("/raw")) {
            return req.clone({setHeaders: {'X-Auth-Token': this.cbAuthSvc.kzToken}});
        } else {
            return req.clone({
                setHeaders: {
                    'X-Auth-Token': this.cbAuthSvc.kzToken,
                    'Content-Type': 'application/json'
                }
            });
        }
    }
}
