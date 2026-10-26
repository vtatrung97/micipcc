import {AbstractService} from "@core/services/abstract.service";
import {Injectable} from "@angular/core";
import {SERVICES} from "@env/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";

@Injectable({providedIn: 'root'})
export class AgentNotifyServerService extends AbstractService {

    constructor(private http: HttpClient, private authSvc: AuthService, private toastSvc: ToastService, private translateSvc: TranslateService) {
        super(http, toastSvc, translateSvc);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.AGENT_NOTIFY_SERVER_API.url}/api/v1`;
    }

    notifyToAgentThroughFirebase(notificationPayload: any) {
        let param = new HttpParams();
        param = this.buildHttpParams(param, "ticketId", notificationPayload.ticketId)
        param = this.buildHttpParams(param, "agentId", notificationPayload.agentId)
        param = this.buildHttpParams(param, "notiType", notificationPayload.notiType)
        param = this.buildHttpParams(param, "channelId", notificationPayload.ticketChannelId)
        param = this.buildHttpParams(param, "payload", JSON.stringify(notificationPayload))
        return this.getRequest(`${this.SERVICE_URL}/ticket-notify/to-agent`, {params: param})
    }

    getConversationRecentlySpeechToText(callId: string) {
        return this.getRequest(`${this.SERVICE_URL}/speech-to-text`, {params: {callId}})
    }
}
