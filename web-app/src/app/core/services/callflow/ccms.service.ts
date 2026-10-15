import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {SERVICES} from "@env/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {Signature} from "@core/models/ticket/signature.model";
import {QueueAgent} from "@pages/settings/queue/queue-agent/queue-agent.model";
import {QueueDTO} from "@pages/settings/queue/queue/queue.model";

@Injectable({providedIn: 'root'})
export class CcmsService extends AbstractService {
    get SERVICE_URL(): string {
        return `${SERVICES.CCMS_SERVICE_API.url}/api/v1`;
    }

    constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService) {
        super(http, toastSv, translate);
    }

    getServicePivotByProperties(input?: any): Observable<ResponseEnvelope<any>> {
        let param = new HttpParams()
        param = this.buildHttpParams(param, "groupId", input.groupId)
        param = this.buildHttpParams(param, "kzAccountId", input.kzAccountId)
        return this.getRequest(`${this.SERVICE_URL}/pivots/for-flows`, {params: param})
    }

    getVoiceMailByProperties(input?: any): Observable<ResponseEnvelope<any>> {
        let param = new HttpParams()
        param = this.buildHttpParams(param, "groupId", input.groupId)
        param = this.buildHttpParams(param, "kzAccountId", input.kzAccountId)
        param = this.buildHttpParams(param, "name", input.name)
        param = this.buildHttpParams(param, "mailBoxNumber", input.voiceMailNumber)
        return this.getRequest(`${this.SERVICE_URL}/vm-boxes`, {params: param})
    }

    getVoiceMailById(id: String, groupId: string): Observable<ResponseEnvelope<any>> {
        let param = new HttpParams()
        param = this.buildHttpParams(param, "groupId", groupId)
        return this.getRequest(`${this.SERVICE_URL}/vm-boxes/${id}`, {params: param})
    }

    addVoicemailBox(voiceMailBox: { groupId: string; name: string; media: { unavailable: string }; mailBoxNumber: null }): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/vm-boxes`, voiceMailBox, true)
    }

    deleteVoiceMail(body: any, voiceMailId: any): Observable<ResponseEnvelope<any>> {
        return this.deleteRequest(`${this.SERVICE_URL}/vm-boxes/${voiceMailId}`, body)
    }

    updateVoiceMail(voiceMailBox: { groupId: string; name: any; media: { unavailable: any }; mailBoxNumber: any }) {
        return this.putRequest(`${this.SERVICE_URL}/vm-boxes`, voiceMailBox)
    }

    public restartStatus() {
        return this.postRequest(`${this.SERVICE_URL}/agents/monitor-status/restart/self`, null);
    }

    getListQueueByKzUserId(): Observable<ResponseEnvelope<QueueDTO[]>> {
        return this.getRequest(`${this.SERVICE_URL}/queues/list-inbound-by-agent`)
    }

    getVoiceMailMessageById(vmboxId: String, messageId: string): Observable<any> {

        return this.getRequest(`${this.SERVICE_URL}/vm-boxes/${vmboxId}/messages/${messageId}`)
    }

    getListSupervisor(queueId: string, supportType: any): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/queue_supervisor/supports?supportType=${supportType}&queueId=${queueId}`);
    }
}
