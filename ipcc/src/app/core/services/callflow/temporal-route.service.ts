import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {SERVICES} from "@env/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {ResponseEnvelope} from "@core/models/response.model";
import {Observable} from "rxjs";

@Injectable({providedIn: 'root'})
export class TemporalRouteService extends AbstractService {
    get SERVICE_URL(): string {
        return `${SERVICES.CCMS_SERVICE_API.url}/api/v1`;
    }

    constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService) {
        super(http, toastSv, translate);
    }

    getRoute(groupId: string | null): Observable<ResponseEnvelope<any>> {
        let param = new HttpParams();
        param = this.buildHttpParams(param, "groupId", groupId)
        return this.getRequest(`${this.SERVICE_URL}/temporal-rules/temporal-routes`, {params: param})
    }
}
