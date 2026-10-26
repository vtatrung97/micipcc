import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ToastService} from "@core/services/toast-service";
import {Observable} from "rxjs";
import {SERVICES} from "@env/environment";
import {AbstractService} from "@core/services/abstract.service";
import {TranslateService} from "@ngx-translate/core";
import {ResponseEnvelope} from "@core/models/response.model";
import {TicketMissedModel} from "@core/models/ticket/ticket-missed.model";


@Injectable({providedIn: 'root'})
export class TicketMissedService extends AbstractService {

    constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService) {
        super(http, toastSv, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-missed`;
    }

    public getOldestTicketMissedByCustomerId(customerId: string, requestTime: number, channelId: number): Observable<ResponseEnvelope<TicketMissedModel>> {
        return this.getRequest(`${this.SERVICE_URL}/oldest/customer/${customerId}`, {params: {requestTime, channelId}});
    }
}
