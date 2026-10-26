import {Injectable} from '@angular/core';
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {Agent, AgentStatusDTO} from "@models/acd/agent.model";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";
import {DailyAgentEachOtherStat} from "@core/models/monitor/voice/voice-agent-monitor.model";
import {
    AgentCallStatDashboardComponent
} from "@pages/dashboards/agent-call-status-dashboard/agent-call-stat-dashboard.component";
import {AgentCallOnlineForm} from "@models/call-online/call-online.model";
import {DailyAgentInQueue} from "@core/models/agent/DailyAgentInQueue";

@Injectable({providedIn: 'root'})
export class AgentCcmsService extends AbstractService {

    constructor(
        private http: HttpClient,
        private authSvc: AuthService,
        private toastSvc: ToastService,
        private translateSvc: TranslateService
    ) {
        super(http, toastSvc, translateSvc);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/agents`;
    }

    public getAgents() {
        return this.getRequest(this.SERVICE_URL);
    }

    public getAgentsFilteredAjax() {
        return `${this.SERVICE_URL}/by-for-agent-call-online`;
    }

    public getAgentDetail() {
        return this.getRequest(`${this.SERVICE_URL}/getAgentDetail`);
    }

    public getCallStatNumber(dto: DailyAgentInQueue){
        return this.postRequest(`${this.SERVICE_URL}/call-stat`, dto)
    }

    public getAgentInRealm() {
        return this.getRequest(`${this.SERVICE_URL}/list`);
    }

    get CCMS_SERVICE_URL(): string {
        return `${SERVICES.CCMS_SERVICE_API.url}`;
    }

    public preCheckChangeVoiceStatus(previousStatus: string, currentStatus: string) {
        return this.http.get(`${this.SERVICE_URL}/change-voice-status?previousStatus=${previousStatus}&currentStatus=${currentStatus}`);
    }

    finishListening(params: any) {
        return this.postRequest(`${SERVICES.CHAT_SERVER_API.url}/api/v1/finish-listening`, params);
    }

}

