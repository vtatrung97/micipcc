import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {SERVICES} from "@env/environment";
import {Observable} from "rxjs";
import {catchError} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";
import {ResponseEnvelope} from "@core/models/response.model";

@Injectable({providedIn: 'root'})
export class QueueService extends AbstractService {

    constructor(
        private http: HttpClient,
        private authSvc: AuthService,
        private toastSvc: ToastService,
        private translate: TranslateService
    ) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.ACD_SERVICE_API.url}/api/v1`;
    }

    public getQueueOmimap(agentId: string, sourceCode: string, channelOriginal: number, channelTarget: number): Observable<any> {
        return this.http.get(`${this.SERVICE_URL}/queue-omimap?agentId=${agentId}&sourceCode=${sourceCode}&channelOriginal=${channelOriginal}&channelTarget=${channelTarget}`)
            .pipe(catchError((error) => this.handleError(error)))
    }

    public getQueueOmimapForTransferToVoiceOrVideoChannel(agentId: string, queueId: string, channelSource: number, channelTarget: number, kzUserId: String) {
        return this.getRequest(`${this.SERVICE_URL}/queue-omimap/for-transfer-voicevideoCall?agentId=${agentId}&sourceQueueId=${queueId}&channelSource=${channelSource}&channelTarget=${channelTarget}&kzUserId=${kzUserId}`)
    }

    public getQueueOmimapToCallout(queueId: string): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/queue-omimap/callout?queueId=${queueId}`);
    }

    getQueueIdByCode(sourceCode: string) {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'sourceCode', sourceCode);
        return this.getRequest(`${this.SERVICE_URL}/queue/by-source-code`, {params: params});
    }
}
