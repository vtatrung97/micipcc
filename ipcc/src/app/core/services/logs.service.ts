import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {LogsModule} from "@models/logs/logsModule";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {HttpClient, HttpParams} from "@angular/common/http";
import {SERVICES} from "@env/environment";

@Injectable({providedIn: 'root'})
export class LogsService extends AbstractService {

    constructor(
        private http: HttpClient,
        private toastSvc: ToastService,
        private translate: TranslateService

    ) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1`
    }

    public searchLogs(data: LogsModule): Observable<ResponseEnvelope<any>> {
        // let params = new HttpParams();
        return this.getRequest(`${this.SERVICE_URL}/logs`, {params: data})
    }

    public getAgents() {
        return this.getRequest(`${this.SERVICE_URL}/agents/list`);
    }
}
