import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {Observable, of} from "rxjs";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";

@Injectable({providedIn: 'root'})
export class AreaService extends AbstractService {
    constructor(private http: HttpClient,
                private authSvc: AuthService,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/areas`;
    }

    public getAreas() {
        return this.getRequest(`${this.SERVICE_URL}`);
    }

    public getAreasLevel2()  {
        return this.getRequest(`${this.SERVICE_URL}/get-by-level`);
    }

}
