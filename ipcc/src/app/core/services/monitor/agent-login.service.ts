import {Injectable} from '@angular/core';
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";

@Injectable({providedIn: 'root'})
export class AgentLoginService extends AbstractService {

    constructor(
        private http: HttpClient,
        private authSvc: AuthService,
        private toastSvc: ToastService,
        private translateSvc: TranslateService
    ) {
        super(http, toastSvc, translateSvc);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.ACD_SERVICE_API.url}/api/v1/agent-login`;
    }

    public getListAgentStatus(param: any[]): Observable<ResponseEnvelope<any>> {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'agentIds', param);
        return this.getRequest(`${this.SERVICE_URL}/monitor-status`,{params: params});
    }
}
