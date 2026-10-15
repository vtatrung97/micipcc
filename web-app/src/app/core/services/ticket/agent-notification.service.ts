import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {Observable} from "rxjs";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";
import {ResponseEnvelope} from "@core/models/response.model";
import {NotificationModel} from "@core/models/agent-notification/notification.model";

@Injectable({providedIn: 'root'})
export class AgentNotificationService extends AbstractService {
    constructor(private http: HttpClient,
                private authSvc: AuthService,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/agents`;
    }

    public getAllNotificationByAgentId(agentId: string, page: number, size: number,  requestTime: number): Observable<ResponseEnvelope<NotificationModel[]>> {
        return this.getRequest(`${this.SERVICE_URL}/${agentId}/notifications`, {params: {page, size, requestTime}});
    }

    public getAllUnreadNotificationByAgentId(agentId: string, page: number, size: number,  requestTime: number): Observable<ResponseEnvelope<NotificationModel[]>> {
        return this.getRequest(`${this.SERVICE_URL}/${agentId}/notifications/unread`, {params: {page, size, requestTime}});
    }

    public getUnreadNotificationCountByAgentId(agentId: string): Observable<ResponseEnvelope<number>> {
        return this.getRequest(`${this.SERVICE_URL}/${agentId}/notifications/unread-count`);
    }

    public readAllNotification(agentId: string): Observable<ResponseEnvelope<any>> {
        return this.putRequest(`${this.SERVICE_URL}/${agentId}/notifications/read-all`);
    }

    public readNotification(agentId: string, notiId: string): Observable<ResponseEnvelope<any>> {
        return this.putRequest(`${this.SERVICE_URL}/${agentId}/notifications/${notiId}/read`);
    }

    public readNotificationByAgentIdAndTicketId(agentId: string, ticketId: string): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/${agentId}/notifications/${ticketId}/readNotification`);
    }

}
