import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {SERVICES} from "@env/environment";
import {Observable} from "rxjs";
import {AbstractService} from "@core/services/abstract.service";

@Injectable({providedIn: 'root'})
export class TicketEndReasonService extends AbstractService {
    constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService) {
        super(http, toastSv, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-end-reasons`;
    }

    public getListTicketEndReasonByParentIds(parentIds: any): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}?parentIds=`);
    }
}
