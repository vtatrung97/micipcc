import {Injectable} from '@angular/core';
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";
import {DailyAgentEachStat} from "@core/models/monitor/voice/voice-agent-monitor.model";

@Injectable({providedIn: 'root'})
export class ReportService extends AbstractService {

    constructor(
        private http: HttpClient,
        private authSvc: AuthService,
        private toastSvc: ToastService,
        private translateSvc: TranslateService
    ) {
        super(http, toastSvc, translateSvc);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.REPORT_SERVICE_API.url}/api/v1/reports`;
    }

    public getAllDailyAgentStatusStat(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/daily-agent-status-stat/all`);
    }

    public getDailyAgentStatusStat(filterForm: any): Observable<ResponseEnvelope<any>> {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'requestDTO', filterForm);
        return this.getRequest(`${this.SERVICE_URL}/daily-agent-status-stat`, {params: params});
    }

    public getDailyAgentEachStatusStat(): Observable<ResponseEnvelope<DailyAgentEachStat>> {
        return this.getRequest(`${this.SERVICE_URL}/daily-agent-each-status-stat`);
    }

    public getDailyAgentEachChatAndTicketStatusStat(): Observable<ResponseEnvelope<DailyAgentEachStat>> {
        return this.getRequest(`${this.SERVICE_URL}/daily-agent-chat-ticket-status-stat`);
    }

    public getAllDailyAgentStatusInQueueStat(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/daily-agent-status-in-queue-stat/all`);
    }

    public getDailyAgentStatusInQueueStat(filterForm: any): Observable<ResponseEnvelope<any>> {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'requestDTO', filterForm);
        return this.getRequest(`${this.SERVICE_URL}/daily-agent-status-in-queue-stat`, {params: params});
    }
}
