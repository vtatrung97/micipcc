import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {SERVICES} from "@env/environment";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {VoiceChannel} from "@core/models/voice/voice-channel/voice-channel.model";

@Injectable({providedIn: 'root'})
export class VoiceChannelService extends AbstractService {

    constructor(private http: HttpClient,
                private authSvc: AuthService,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/voice-channels`;
    }

    public getVoiceChannelByType(groupId: any, type: any): Observable<ResponseEnvelope<VoiceChannel[]>> {
        return this.getRequest(`${this.SERVICE_URL}/get-by-type/${groupId}/${type}`);
    }

    public getListVoiceChannel(): Observable<ResponseEnvelope<VoiceChannel[]>> {
        return this.getRequest(`${this.SERVICE_URL}/subscriber-get-for-dropdown`)
    }

    public getListVoiceChannelInRealm(): Observable<ResponseEnvelope<VoiceChannel[]>> {
        return this.getRequest(`${this.SERVICE_URL}/get-vc-in-realm`)
    }
}
