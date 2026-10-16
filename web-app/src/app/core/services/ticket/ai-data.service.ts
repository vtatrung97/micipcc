import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {SERVICES} from "@env/environment";
import {AbstractService} from "../abstract.service";
import {AuthService} from "../auth/auth.service";
import {ToastService} from "../toast-service";
import {TranslateService} from "@ngx-translate/core";
import {AiTranscript} from "@core/models/ticket/ai-transcript.model";
import {ResponseEnvelope} from "@core/models/response.model";

@Injectable({providedIn: 'root'})
export class AiDataService extends AbstractService {

    constructor(private http: HttpClient,
                private authSvc: AuthService,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/ai-data`;
    }

    /**
     * Lấy transcript voice-to-text của voicemail theo Call-ID.
     */
    public getVoicemailTranscript(callId: string): Observable<ResponseEnvelope<AiTranscript>> {
        return this.getRequest(`${this.SERVICE_URL}/voicemail-transcript`, {params: {callId}}, true);
    }

    /**
     * Tải file Excel AI trích xuất từ voicemail (backend proxy sang AI server).
     */
    public downloadVoicemailFile(callId: string): Observable<Blob> {
        return this.http.get(`${this.SERVICE_URL}/voicemail-file`, {params: {callId}, responseType: 'blob'});
    }
}
