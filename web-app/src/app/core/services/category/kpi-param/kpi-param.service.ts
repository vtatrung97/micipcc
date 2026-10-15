import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ResponseEnvelope } from "@core/models/response.model";
import { AbstractService } from "@core/services/abstract.service";
import { AuthService } from "@core/services/auth/auth.service";
import { ToastService } from "@core/services/toast-service";
import { SERVICES } from "@env/environment";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class KpiParamService extends AbstractService {

    credentials: any = {};

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private toastSvc: ToastService,
        private translate: TranslateService
    ) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/kpi-params`;
        // @ts-ignore
    }

    getListKpiParam() {
        return this.getRequest(`${this.SERVICE_URL}`)
    }

    getKpiParam(channelId?: number): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/${channelId}`)
    }
}
