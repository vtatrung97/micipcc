import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {SERVICES} from "@env/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";

@Injectable({providedIn: 'root'})
export class CallMeBackSvcService extends AbstractService {

    constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService) {
        super(http, toastSv, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/callback`;
    }

    getCmbTicketStatus(ticketId: string, requestTime: number | undefined): Observable<any> {
        let paramsQs = new HttpParams()
        paramsQs = this.buildHttpParams(paramsQs, "requestTime", requestTime)
        return this.getRequest(`${this.SERVICE_URL}/check-cmbticket-ignore/${ticketId}`, {params: paramsQs})
    }
}
