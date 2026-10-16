import { Injectable } from "@angular/core";
import { AbstractService } from "@core/services/abstract.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AuthService } from "@core/services/auth/auth.service";
import { ToastService } from "@core/services/toast-service";
import { Observable } from "rxjs";
import { SERVICES } from "@env/environment";
import { TranslateService } from "@ngx-translate/core";
import { ResponseEnvelope } from "@core/models/response.model";

@Injectable({ providedIn: 'root' })
export class ViberAccountService extends AbstractService {
    constructor(private http: HttpClient,
        private authSvc: AuthService,
        private toastSvc: ToastService,
        private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CHAT_SERVICE_API.url}/api/v1/viber-accounts`;
    }


    public addBusiness(business: any): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}`, business)
    }

    public deleteBusiness(ids: string[]): Observable<ResponseEnvelope<any>> {
        return this.deleteRequest(`${this.SERVICE_URL}`, ids)
    }

    public updateBusiness(business: any) {
        return this.putRequest(this.SERVICE_URL, business);
    }

    public getListBusiness(): Observable<any> {
        return this.getRequest(this.SERVICE_URL);
    }
}
