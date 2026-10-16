import {AbstractService} from "@core/services/abstract.service";
import {HttpClient} from "@angular/common/http";
import { Injectable } from "@angular/core";
import {ResponseEnvelope} from "@core/models/response.model";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";
import {SERVICES} from "@env/environment";

@Injectable({providedIn: 'root'})
export class CxbotService extends AbstractService {
    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private toastSvc: ToastService,
        private translate: TranslateService
    ) {
        super(http, toastSvc, translate);
    }

    get CXBOT_CONFIG_SERVICE_URL(): string {
        return `${SERVICES.BOT_SERVER_API.url}/api/v1/cxbot-binding`;
    }

    get SERVICE_URL(): string {
        return `${SERVICES.BOT_SERVER_API.url}/api/v1/cx-bot`
    }

    getBotConfig(fbPageId: String): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.CXBOT_CONFIG_SERVICE_URL}?fbPageId=${fbPageId}`)
    }

    createOrUpdateBotConfig(botBindingId: string, payload: object): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.CXBOT_CONFIG_SERVICE_URL}?botBindingId=${botBindingId}`, payload)
    }

    getListBot(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}`)
    }

    getAllListBot(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/list-all`)
    }

    getBotConfigService(id: String, channelId: number): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.CXBOT_CONFIG_SERVICE_URL}/detail?serviceId=${id}&channelId=${channelId}`)
    }
}
