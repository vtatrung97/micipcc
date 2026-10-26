import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ToastService} from "@core/services/toast-service";
import {SERVICES} from "@env/environment";
import {AbstractService} from "@core/services/abstract.service";
import {TranslateService} from "@ngx-translate/core";
import {AuthService} from "@core/services/auth/auth.service";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {EmailKeyword} from "@core/models/ticket/email-keyword.model";

@Injectable({providedIn: 'root'})
export class KeywordCatalogService extends AbstractService {

    constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService, private authSvc: AuthService) {
        super(http, toastSv, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/keyword-catalog`;
    }

    public checkKeywordEmail(ticketDetailId?: string, requestTime?: number): Observable<ResponseEnvelope<EmailKeyword>> {
        return this.getRequest(`${this.SERVICE_URL}/email?ticketDetailId=${ticketDetailId}&requestTime=${requestTime}`);
    }
}
