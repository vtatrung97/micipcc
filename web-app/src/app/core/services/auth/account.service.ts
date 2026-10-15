import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from "rxjs";
import {SERVICES} from "@env/environment";
import {ResponseEnvelope} from "@core/models/response.model";
import {ToastService} from "@core/services/toast-service";
import {AbstractService} from "@core/services/abstract.service";
import {TranslateService} from "@ngx-translate/core";
import {catchError} from "rxjs/operators";


@Injectable({providedIn: 'root'})
export class AccountService extends AbstractService {

    constructor(private http: HttpClient,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.ACCOUNT_API.url}`;
    }

    getServiceOwner(): Observable<ResponseEnvelope<any>> {
        return this.http.get<ResponseEnvelope<any>>(`${this.SERVICE_URL}/api/v1/groups/service-owner`).pipe(
            catchError(() => new Observable<never>())
        )
    }

    getMenu(): Observable<ResponseEnvelope<any>> {
        return this.http.get<ResponseEnvelope<any>>(`${this.SERVICE_URL}/api/v1/workspaces/menus/current`).pipe(
            catchError(err => this.handleError(err))
        )
    }

    getMenuSystem(): Observable<ResponseEnvelope<any>> {
        return this.http.get<ResponseEnvelope<any>>(`${this.SERVICE_URL}/api/v1/menus`).pipe(
            catchError(err => this.handleError(err))
        )
    }

    logoutAllSession(): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/api/v1/logout`, null);
    }

    logoutAgentAllSession(agentId: string): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/api/v1/logout/${agentId}`, null);
    }
}
