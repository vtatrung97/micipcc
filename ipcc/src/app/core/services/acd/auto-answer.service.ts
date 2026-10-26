import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, Subject} from "rxjs";
import {DatatablesResponse, ResponseEnvelope} from "@core/models/response.model";
import {ToastService} from "@core/services/toast-service";
import {AbstractService} from "@core/services/abstract.service";
import {AuthService} from "@core/services/auth/auth.service";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";
import {Ticket} from "@core/models/ticket/ticket.model";
import {AgentTicketEvent, TicketMonitorFilterForm} from "@core/models/monitor/agent-monitor.model";

export interface AutoAnswerStats {
    totalSamples: number;
    activeQueues: number;
    usedSamples: number;
    activeStatus: boolean;
    isQueueActive: boolean;
}

@Injectable({providedIn: 'root'})
export class AutoAnswerService extends AbstractService {
    constructor(private http: HttpClient,
                private authService: AuthService,
                private toastSvc: ToastService,
                private translateSvc: TranslateService) {
        super(http, toastSvc, translateSvc);
    }

    private autoAnswerEmitter = new Subject<Ticket>()

    publish(value: Ticket) {
        console.log("Start sending auto answer")
        this.autoAnswerEmitter.next(value)
    }

    listen() {
        return this.autoAnswerEmitter.asObservable();
    }

    get SERVICE_URL(): string {
        return `${SERVICES.ACD_SERVICE_API.url}/api/v1`;
    }

    getAutoAnswerConfig(queueId: string): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/queue-params/autoAnswer/${queueId}`);
    }

    getAutoAnswerText(ticketId: String, sourceId: string, agentName: string, ruleApply: string) {
        let params = new HttpParams()

        params = this.buildHttpParams(params, 'ticketId', ticketId)
        params = this.buildHttpParams(params, 'sourceId', sourceId)
        params = this.buildHttpParams(params, 'agentName', agentName)
        params = this.buildHttpParams(params, 'ruleApply', ruleApply)

        return this.getRequest(`${this.SERVICE_URL}/auto-answer-cfg`, {params: params})
    }

    getStat(queueId: string, agentName?: string) {
        let params = new HttpParams()

        params = this.buildHttpParams(params, 'queueId', queueId)
        params = this.buildHttpParams(params, 'agentName', agentName)
        return this.getRequest(`${this.SERVICE_URL}/auto-answer-stat`, {params: params})
    }
}
