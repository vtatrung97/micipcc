import {Injectable} from "@angular/core";
import {AbstractService} from "../abstract.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "../auth/auth.service";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {ToastService} from "../toast-service";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";
import {AgentQueueModel} from "@core/models/monitor/agent-monitor.model";
import {QueueModel} from "@core/models/monitor/queue-monitor.model";

@Injectable({ providedIn: 'root' })
export class AsRestService extends AbstractService {
    constructor(private http: HttpClient, private authSvc: AuthService, private toastSvc: ToastService, private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    public getDailyAgentsStat():  Observable<ResponseEnvelope<AgentQueueModel[]>>{
        return this.getRequest(`${this.SERVICE_URL}/agents/daily-stat`);
    }

    public getDailyQueuesStat():  Observable<ResponseEnvelope<QueueModel[]>>{
        return this.getRequest(`${this.SERVICE_URL}/queues/daily-stat`);
    }

    public getLiveCalls() {
        return this.getRequest(`${this.SERVICE_ACCOUNT_KAZOO_URL}/calls/live-calls`);
    }

    public getAgentsStatus():  Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_ACCOUNT_KAZOO_URL}/agents/status`);
    }

    public getInboundQueueTransactionStat() {
        return this.getRequest(`${this.SERVICE_ACCOUNT_KAZOO_URL}/queues/inbound-transaction-stat`);
    }

    public getOutboundQueueTransactionStat() {
        return this.getRequest(`${this.SERVICE_ACCOUNT_KAZOO_URL}/queues/outbound-transaction-stat`);
    }

    public getDailyVoiceQueuesStat() {
        return this.getRequest(`${this.SERVICE_ACCOUNT_KAZOO_URL}/queues/daily-stat`);
    }

    public muteCall(callId: string, otherLegCallId: string, ownerId: string, type: string) {
        return this.getRequest(`${this.SERVICE_URL}/calls/${callId}/mute?otherLegCallId=${otherLegCallId}&ownerId=${ownerId}&type=${type}`);
    }

    public notifyNewSession() {
        return this.postRequest(`${this.SERVICE_URL}/new-session`);
    }

    public notifyStatusChangedByMonitor(agent_id: string, status:string) {
        return this.postRequest(`${this.SERVICE_URL}/agents/${agent_id}/status-change-by-monitor?status=${status}`);
    }

    public supervisorChangeStatusCallOnline(kzAccountId: string, supervisorId: string, agentId: string) {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'kzAccountId', kzAccountId);
        params = this.buildHttpParams(params, 'supervisorId', supervisorId);
        params = this.buildHttpParams(params, 'agentId', agentId);
        return this.getRequest(`${this.SERVICE_URL}/agent-call-online/active`,{params: params});
    }

    public endCallOnlineFromSupervisor(kzAccountId: string, supervisorId: string, called: string | undefined) {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'kzAccountId', kzAccountId);
        params = this.buildHttpParams(params, 'supervisorId', supervisorId);
        params = this.buildHttpParams(params, 'agentId', called);
        return this.getRequest(`${this.SERVICE_URL}/agent-call-online/super-endcall`,{params: params});
    }

    get SERVICE_URL(): string {
        return `${SERVICES.AGENT_SERVER_API.url}/api/v1`;
    }

    get SERVICE_ACCOUNT_KAZOO_URL(): string {
        return `${SERVICES.AGENT_SERVER_API.url}/api/v1/accounts`;
    }
}
