import {Injectable} from '@angular/core';
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";

import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {SCOPE} from "../../../../app.constants";
import {TokenService} from "../../../../init/token.service";

@Injectable({providedIn: 'root'})
export class AgentService extends AbstractService {
    listAgentScopes: string [] = [];

    constructor( private http: HttpClient,
                 private authSvc: AuthService,
                 private toastSvc: ToastService,
                 private translateSvc: TranslateService) {
            super(http, toastSvc, translateSvc)
            this.listAgentScopes = TokenService.getListScopes('ccms-service');
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/agents`;
    }

    get MONITOR_AGENT_URL(): string {
        if (this.listAgentScopes.includes(SCOPE.AGENT.MONITOR_AGENT_ALL_GROUP))
            return `${this.SERVICE_URL}/monitor-status-all-group`;
        else if (this.listAgentScopes.includes(SCOPE.AGENT.MONITOR_AGENT))
            return `${this.SERVICE_URL}/monitor-status`;
        else if (this.listAgentScopes.includes(SCOPE.AGENT.MONITOR_AGENT_QUEUE_SUPERVISOR))
            return `${this.SERVICE_URL}/monitor-status-queue-supervisor`;
        return '';
    }

    public listAgent(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/list`)
    }

    restartAgentsStatus(voiceAgentFilterForm: any) {
        return this.postRequest(`${this.SERVICE_URL}/monitor-status/restart`, voiceAgentFilterForm);
    }

    restartAgentStatus(kzuid: string) {
        return this.postRequest(`${this.SERVICE_URL}/monitor-status/restart/${kzuid}`);
    }

    restartAgentsStatusByFile(formData: any) {
        return this.postRequestFile2(`${this.SERVICE_URL}/monitor-status/restart/file`, formData);
    }

    actionExportExcel(params: any): Observable<any> {
        return this.getRequestFileConvertMessage(`${SERVICES.CCMS_SERVICE_API.url}/api/v1/agents/monitor-status-all-group-export-disagreement`, params)
    }
}
