import { Injectable } from "@angular/core";
import { AbstractService } from "@core/services/abstract.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AuthService } from "@core/services/auth/auth.service";
import { ToastService } from "@core/services/toast-service";
import { Observable } from "rxjs";
import { SERVICES } from "@env/environment";
import { TranslateService } from "@ngx-translate/core";
import { ResponseEnvelope } from "@core/models/response.model";

@Injectable({ providedIn: 'root' })
export class TelegramAccountService extends AbstractService {
    constructor(private http: HttpClient,
        private authSvc: AuthService,
        private toastSvc: ToastService,
        private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CHAT_SERVICE_API.url}/api/v1/telegram-accounts`;
    }


    public addBot(bot: any): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}`, bot)
    }

    public deleteBot(ids: string[]): Observable<ResponseEnvelope<any>> {
        return this.deleteRequest(`${this.SERVICE_URL}`, ids)
    }

    public updateBot(bot: any) {
        return this.putRequest(this.SERVICE_URL, bot);
    }

    public getListBot(): Observable<any> {
        return this.getRequest(this.SERVICE_URL);
    }
}
