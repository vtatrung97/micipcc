import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from "rxjs";
import {DatatablesResponse, ResponseEnvelope} from "@core/models/response.model";
import {ToastService} from "@core/services/toast-service";
import {AbstractService} from "@core/services/abstract.service";
import {AuthService} from "@core/services/auth/auth.service";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";


@Injectable({providedIn: 'root'})
export class DeviceTokenService extends AbstractService {

    constructor(private http: HttpClient,
                private authService: AuthService,
                private toastSvc: ToastService,
                private translateSvc: TranslateService) {
        super(http, toastSvc, translateSvc);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.ACD_SERVICE_API.url}/api/v1/devices`;
    }

    getTokenByPhoneNumber(sipUsername: string): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/token?sipUsername=${sipUsername}`);
    }
}
