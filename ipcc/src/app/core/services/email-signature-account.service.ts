import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {ToastService} from "@core/services/toast-service";
import {AbstractService} from "@core/services/abstract.service";
import {SERVICES} from "@env/environment";
import {ResponseEnvelope} from "@core/models/response.model";
import {EmailModel} from "@models/email/email.model";

@Injectable({providedIn: 'root'})
export class EmailSignatureAccountService extends AbstractService {
    constructor(private http: HttpClient, private toasService: ToastService, private translate: TranslateService) {
        super(http, toasService, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.EMAIL_GATEWAY_SERVICE_API.url}/api/v1/email-accounts`;
    }

    getEmailList(): Observable<ResponseEnvelope<EmailModel[]>> {
        return this.getRequest(`${this.SERVICE_URL}/email-signatures`)
    }
}
