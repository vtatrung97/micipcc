import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ToastService} from "@core/services/toast-service";
import {Observable} from "rxjs";
import {SERVICES} from "@env/environment";
import {AbstractService} from "@core/services/abstract.service";
import {TranslateService} from "@ngx-translate/core";
import {ResponseEnvelope} from "@core/models/response.model";


@Injectable({providedIn: 'root'})
export class CallBotService extends AbstractService {
    constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService) {
        super(http, toastSv, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/call-bot`;
    }

    public getPredict(ticketId: string): Observable<any> {
        const params: any = {};
        params.ticket_id = ticketId;
        return this.getRequest(`${this.SERVICE_URL}/predict`, {params});
    }
}
