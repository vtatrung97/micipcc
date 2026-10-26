import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {Observable, of, Subject} from "rxjs";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";
import {ResponseEnvelope} from "@core/models/response.model";
import {RightSideBarViewMode} from "@core/constant/ticket.enum";

export type CalloutQueue = {
    queueAgentId: string,
    queueId: string,
    queueCode: string,
    queueName: string,
    seatNumber?: number,
    username?: string,
    assignType: 'USERNAME' | 'SEAT',
    createTime?: number,
    isUsedCallout?: number
};

export type PreCheckCallOut = { data: any, callback: Function, phoneNumber?: string };
@Injectable({providedIn: 'root'})
export class CalloutService extends AbstractService {
    constructor(private http: HttpClient,
                private authSvc: AuthService,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/callout`;
    }

    public getPreCheckCallout(phoneNumber: string, queueAgentId?: string): Observable<ResponseEnvelope<any>> {
        let params = new HttpParams().set('phoneNumber', phoneNumber);
        if (queueAgentId) {
            params = params.set('queueAgentId', queueAgentId);
        }
        return this.getRequest(`${this.SERVICE_URL}/preCheck`, {params});
    }

    public getCalloutQueues(): Observable<ResponseEnvelope<CalloutQueue[]>> {
        return this.getRequest(`${this.SERVICE_URL}/queues`);
    }

    public getCalloutQueuesSilent(): Observable<ResponseEnvelope<CalloutQueue[]>> {
        return this.http.get<ResponseEnvelope<CalloutQueue[]>>(`${this.SERVICE_URL}/queues`);
    }

    public useCalloutQueue(queueAgentId: string): Observable<ResponseEnvelope<CalloutQueue>> {
        return this.putRequest(`${this.SERVICE_URL}/queues/${queueAgentId}/use`);
    }

    private openSelectQueueSrc = new Subject<void>();
    openSelectQueue$ = this.openSelectQueueSrc.asObservable()
    announceOpenSelectQueue() {
        this.openSelectQueueSrc.next();
    }

    public getPreCheckCallback(cbSessionId: string, queueId: string): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/preCheckCallback?cbSessionId=${cbSessionId}&queueId=${queueId}`);
    }


    private preCheckCallOutSrc = new Subject<PreCheckCallOut>();
    preCheckCallOut$ = this.preCheckCallOutSrc.asObservable()
    announcePreCheckCallOut(data: PreCheckCallOut) {
        this.preCheckCallOutSrc.next(data);
    }

    private callEventSrc = new Subject<any>();
    callEvent$ = this.callEventSrc.asObservable()
    announceCallEvent(data: any) {
        this.callEventSrc.next(data);
    }


}
