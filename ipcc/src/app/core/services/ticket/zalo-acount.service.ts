import { Injectable } from "@angular/core";
import { AbstractService } from "@core/services/abstract.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AuthService } from "@core/services/auth/auth.service";
import { ToastService } from "@core/services/toast-service";
import { Observable } from "rxjs";
import { SERVICES } from "@env/environment";
import { TranslateService } from "@ngx-translate/core";
import { ResponseEnvelope } from "@core/models/response.model";
import { AutoblockRuleModel, ReqInvalidBlockRuleModel } from "@core/models/ticket/autoblock-rule.model";
import * as qs from "qs";
import { FileUpload } from "@core/models/ticket/ticket.type";
import { ChannelUploadType } from "@core/constant/constant";
import { ZaloOAModel } from "@models/zalo/ZaloOA.model";

@Injectable({ providedIn: 'root' })
export class ZaloAcountService extends AbstractService {
    constructor(private http: HttpClient,
        private authSvc: AuthService,
        private toastSvc: ToastService,
        private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CHAT_SERVICE_API.url}/api/v1/zalo-accounts`;
    }

    public loginZaloOa(oaId: string, code: string, state: string, groupId: string): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/login-zalo-oa`, { oaId, code, groupId, state })
    }

    public addOA(zaloAccountId: string): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/add-oa/${zaloAccountId}`)
    }

    public disableOas(zaloAccountIds: string[]): Observable<ResponseEnvelope<any>> {
        return this.putRequest(`${this.SERVICE_URL}/disable`, zaloAccountIds)
    }

    public getCodeChallenge(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/zalo-verify-code`)
    }

    public getOAById(id: string): Observable<ResponseEnvelope<ZaloOAModel>> {
        return this.getRequest(this.SERVICE_URL + "/" + id);
    }

    public updateOA(zaloOa: ZaloOAModel) {
        return this.putRequest(this.SERVICE_URL, zaloOa);
    }

    public getListOA(): Observable<any> {
        return this.getRequest(this.SERVICE_URL);
    }
}
