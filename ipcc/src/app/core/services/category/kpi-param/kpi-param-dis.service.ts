import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AbstractService } from "@core/services/abstract.service";
import { AuthService } from "@core/services/auth/auth.service";
import { ToastService } from "@core/services/toast-service";
import { SERVICES } from "@env/environment";
import { TranslateService } from "@ngx-translate/core";

@Injectable({ providedIn: 'root' })
export class KpiParamDisService extends AbstractService {

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
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/kpi-param-dis`;
        // @ts-ignore
    }

    getListKpiParamDis() {
        return this.getRequest(`${this.SERVICE_URL}`)
    }
}
