import {Injectable} from '@angular/core';
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {catchError} from "rxjs/operators";
import {AgentStatusDTO} from "@models/acd/agent.model";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";
import {AgentStatusMonitorFilterForm} from "@core/models/monitor/agent-monitor.model";

@Injectable({providedIn: 'root'})
export class AgentService extends AbstractService {

    constructor(
        private http: HttpClient,
        private authSvc: AuthService,
        private toastSvc: ToastService,
        private translateSvc: TranslateService
    ) {
        super(http, toastSvc, translateSvc);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.ACD_SERVICE_API.url}/api/v1/agents`;
    }

    get CCMS_SERVICE_URL(): string {
        return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/agents`;
    }

    get QUALITY_SERVICE_URL(): string {
        return `${SERVICES.QUALITY_SERVICE_API.url}/api/v1/agent`;
    }

    public getAgents() {
        return this.getRequest(this.SERVICE_URL);
    }

    public getAllAgents() {
        return this.getRequest(`${this.QUALITY_SERVICE_URL}/list`);
    }

    public getListAgents() {
        return this.getRequest(`${this.CCMS_SERVICE_URL}/list`);
    }

    public getAgentsByTopLevelGroup(groupId: string) {
        return this.getRequest(`${this.QUALITY_SERVICE_URL}/by-top-level-group/${groupId}`);
    }

    public getAgentsFilteredAjax() {
        return `${this.SERVICE_URL}/by-props`;
    }

    public getMonitorFilteredAjax() {
        return `${this.SERVICE_URL}/by-queueId`;
    }

    public getAgentStatusFilteredAjaxUrl() {
        return `${this.SERVICE_URL}/monitor-status`;
    }

    public getAvailableChatAgents() {
        return this.getRequest(`${this.SERVICE_URL}/available-chat`);
    }

    public getAvailableChatAgentsInQueues(queueIds: string[], agentId: string, groupId: string) {
        return this.getRequest(`${this.SERVICE_URL}/available-chat-in-queues?queueIds=${queueIds}&agentId=${agentId}&groupId=${groupId}`);
    }

    public getAvailableTicketAgents() {
        return this.getRequest(`${this.SERVICE_URL}/available-ticket`);
    }

    public getAvailableTicketAgentsInQueues(queueIds: string[], agentId: string, groupId: string) {
        return this.getRequest(`${this.SERVICE_URL}/available-ticket-in-queues?queueIds=${queueIds}&agentId=${agentId}&groupId=${groupId}`);
    }

    public getAvailableVoiceOrVideoCallAgentsInQueues(queueIds: string[], agentId: string, groupId: string) {
        return this.getRequest(`${this.SERVICE_URL}/available-voice-video-call-in-queues?queueIds=${queueIds}&agentId=${agentId}&groupId=${groupId}`);
    }

    public getAgentStatus(): Observable<ResponseEnvelope<AgentStatusDTO>> {
        return this.getRequest(`${this.SERVICE_URL}/status`)
    }

    public updateAgentStatus(data: AgentStatusDTO): Observable<ResponseEnvelope<AgentStatusDTO>> {
        return this.putRequest(`${this.SERVICE_URL}/status`, data)
    }

    public getListAgentStatus(param: AgentStatusMonitorFilterForm): Observable<ResponseEnvelope<any>> {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'agentMonitorRequestDTO', param);
        return this.getRequest(`${this.SERVICE_URL}/monitor-status`,{params: params});
    }

    public updateAgentMonitorStatus(data: any): Observable<any> {
        return this.putRequest(`${this.SERVICE_URL}/monitor-status`, data);
    }

    public getAgentMonitorLogs(agentId: string, fieldCode?: string | null, fromTime?: number | null, toTime?: number | null): Observable<any> {
        let params = new HttpParams().set('agentId', agentId);
        if (fieldCode) params = params.set('fieldCode', fieldCode);
        if (fromTime !== null && fromTime !== undefined) params = params.set('fromTime', String(fromTime));
        if (toTime !== null && toTime !== undefined) params = params.set('toTime', String(toTime));
        return this.getRequest(`${this.SERVICE_URL}/monitor-log`, {params: params});
    }

    public getMailOmimap(agentId: string, sourceCode: string, channelOriginal: number, channelTarget: number): Observable<any> {
        return this.http.get(`${this.SERVICE_URL}/queue-omimap?agentId=${agentId}&sourceCode=${sourceCode}&channelOriginal=${channelOriginal}&channelTarget=${channelTarget}`)
            .pipe(catchError((error) => this.handleError(error)))
    }

    getAllSeniority(): Observable<any> {
        return this.getRequest(`${SERVICES.QUALITY_SERVICE_API.url}/api/v1/ap-params/get-all-seniority`)
    }
}
