import { Injectable } from "@angular/core";
import { AbstractService } from "@core/services/abstract.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AuthService } from "@core/services/auth/auth.service";
import { ToastService } from "@core/services/toast-service";
import { Observable } from "rxjs";
import { SERVICES } from "@env/environment";
import { TranslateService } from "@ngx-translate/core";
import { ResponseEnvelope } from "@core/models/response.model";

export interface DeleteTeleAccountResDTO {
    total: number;
    deletedCnt: number;
    failedCnt: number;
    results: DeleteTeleAccountResDTOItem[];
}

export interface DeleteTeleAccountResDTOItem {
    telegramAccountId: string;
    status: 'DELETED' | 'NOT_FOUND' | 'WEBHOOK_DELETE_FAILED';
}

@Injectable({ providedIn: 'root' })
export class TeleAccountService extends AbstractService {
    constructor(private http: HttpClient,
        private authSvc: AuthService,
        private toastSvc: ToastService,
        private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CHAT_SERVICE_API.url}/api/v1/tele-accounts`;
    }

    public getBot(teleAccountId: string): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/${teleAccountId}`)
    }

    public addBot(bot: any): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}`, bot)
    }

    public deleteBot(ids: string[]): Observable<any> {
        return this.deleteRequest(`${this.SERVICE_URL}`, ids)
    }

    public updateBot(bot: any) {
        return this.putRequest(this.SERVICE_URL, bot);
    }

    public getListBot(): Observable<any> {
        return this.getRequest(this.SERVICE_URL);
    }

    public getTeleMessageDefault(teleAccountId: string): Observable<any> {
        return this.getRequest(
            `${this.SERVICE_URL}/${teleAccountId}/message-default`
        );
    }

    public updateTeleMessageDefault(
        teleAccountId: string,
        bot: any
    ): Observable<any> {
        return this.putRequest(
            `${this.SERVICE_URL}/${teleAccountId}/message-default`,
            bot
        );
    }
}
