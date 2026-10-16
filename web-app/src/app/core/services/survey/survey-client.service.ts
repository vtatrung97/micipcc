import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {TranslateService} from "@ngx-translate/core";
import {AbstractService} from "@core/services/abstract.service";
import {ToastService} from "@core/services/toast-service";
import {SERVICES} from "@env/environment";
import {TicketDetail} from "@core/models/ticket/ticket-detail.model";

@Injectable({providedIn: 'root'})
export class SurveyClientService extends AbstractService{
    constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService) {
        super(http, toastSv, translate);
    }

    get SERVICE_URL(): string {
        return SERVICES.TICKET_SERVICE_API.url;
    }

    checkSurveyConfigForEmail(channelId: number, sourceId: string, customerId: string, ticketId: string, content: String) {
        let param = new HttpParams();
        param = this.buildHttpParams(param, "channelId", channelId);
        param = this.buildHttpParams(param, "sourceId", sourceId);
        param = this.buildHttpParams(param, "customerId", customerId);
        param = this.buildHttpParams(param, "ticketId", ticketId);
        param = this.buildHttpParams(param, "content", content);
        return this.getRequest(this.SERVICE_URL + "/api/v1/survey-config/for-email", {params: param});
    }
}
