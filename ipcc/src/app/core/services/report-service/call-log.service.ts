import { Injectable } from "@angular/core";
import { AbstractService } from "@core/services/abstract.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AuthService } from "@core/services/auth/auth.service";
import { ToastService } from "@core/services/toast-service";
import { Observable } from "rxjs";
import { SERVICES } from "@env/environment";
import { TranslateService } from "@ngx-translate/core";
import { ResponseEnvelope } from "@core/models/response.model";
import { AutoblockRuleModel, ReqInvalidBlockRuleModel } from "@core/models/ticket/autoblock-rule.model";
import * as qs from "qs";
import { ServiceHoliday } from "@core/models/organize/calendar/calendar.model";

@Injectable({ providedIn: 'root' })
export class CallLogService extends AbstractService {
    constructor(private http: HttpClient,
        private authSvc: AuthService,
        private toastSvc: ToastService,
        private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.REPORT_SERVICE_API.url}/api/v1/reports/call-log`;
        // return `http://demo.127.0.0.1.nip.io:8105/api/v1/reports/call-log`;
    }

    public getCallLogById(callId: string, callType?: string, legBCallId?: string, fromTime?: number, toTime?: number): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/${callId}`, { params: { callType, legBCallId, fromTime, toTime } });
    }

    public getVoiceToText(callId: string, requestTime: number): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${SERVICES.QUALITY_SERVICE_API.url}/api/v1/ticket-monitors/get-voice-to-text-with-call-id?callId=${callId}&requestTime=${requestTime}`);
    }

    public export(filter: any): any {
        // return this.postRequest(`${this.SERVICE_URL}/excel`, filter)
        return this.httpClient.post(`${this.SERVICE_URL}/excel`, filter, { responseType: 'blob' })
    }

}
