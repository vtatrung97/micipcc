import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {SERVICES} from "@env/environment";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {TiktokPageModel} from "@pages/settings/tiktok-account/tiktok-account-list/tiktok-account-list.type";

@Injectable({ providedIn: 'root' })
export class TiktokAccountService extends AbstractService {
    constructor(
        private http: HttpClient,
        private authSvc: AuthService,
        private toastSvc: ToastService,
        private translate: TranslateService
    ) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CHAT_SERVICE_API.url}/api/v1/tiktok-accounts`;
    }

    public disableOas(tiktokAccountIds: string[]): Observable<ResponseEnvelope<any>> {
        return this.putRequest(`${this.SERVICE_URL}/disable`, tiktokAccountIds)
    }

    public getPageById(id: string): Observable<ResponseEnvelope<any>> {
        return this.getRequest(this.SERVICE_URL + "/" + id)
    }

    public updateAccount(req: TiktokPageModel): Observable<ResponseEnvelope<any>> {
        return this.putRequest(`${this.SERVICE_URL}/${req.tiktokAccountId}`, req);
    }

    public createAccount(req: TiktokPageModel): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}`, req);
    }

    public genAccessLink(): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/access-tiktok`);
    }
}
