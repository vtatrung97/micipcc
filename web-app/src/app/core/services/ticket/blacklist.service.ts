import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";
import { ResponseEnvelope } from "@core/models/response.model";
import { Observable } from "rxjs";
import * as qs from "qs";

@Injectable({providedIn: 'root'})
export class BlacklistService extends AbstractService {
    constructor(private http: HttpClient,
                private authSvc: AuthService,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/black-list`;
    }

    getBlackListAjax(): string {
        return `${this.SERVICE_URL}`
    }

    public getBlackList(param: any): Observable<ResponseEnvelope<any>> {
        let paramsQs: HttpParams;
        paramsQs = new HttpParams({fromString: qs.stringify({...param})})
        return this.getRequest( `${this.SERVICE_URL}`, {params: paramsQs});
    }

    public getBlockReasons(): Observable<ResponseEnvelope<any>> {
        return this.getRequest( `${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-reasons/4`);
    }

    public addBlockedCustomer(data: any): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/add`, data);
    }

    public editBlockedCustomer(customerBlacklistId: string): Observable<ResponseEnvelope<any>> {
        return this.putRequest(`${this.SERVICE_URL}/edit?customerBlacklistId=${customerBlacklistId}`);
    }
}
