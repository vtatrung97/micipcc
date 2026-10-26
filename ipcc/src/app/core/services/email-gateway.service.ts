import {Injectable} from "@angular/core";
import {SERVICES} from "@env/environment";
import {HttpClient} from "@angular/common/http";
import {ToastService} from "@core/services/toast-service";
import {Observable} from "rxjs";
import {EmailModel} from "@models/email/email.model";
import {ResponseEnvelope} from "@core/models/response.model";
import {TranslateService} from "@ngx-translate/core";
import {AbstractService} from "@core/services/abstract.service";

@Injectable({providedIn: 'root'})
export class EmailGatewayService extends AbstractService {
  constructor(private http: HttpClient, private toasService: ToastService, private translate: TranslateService) {
    super(http, toasService, translate);
  }

  get SERVICE_URL(): string {
    return `${SERVICES.EMAIL_GATEWAY_SERVICE_API.url}/api/v1/email-accounts`;
  }

  getEmailList(): Observable<ResponseEnvelope<EmailModel[]>> {
    return this.getRequest(`${this.SERVICE_URL}/email-signatures`)
  }

  getEmailFromCampaign(): Observable<ResponseEnvelope<string[]>> {
    return this.getRequest(`${this.SERVICE_URL}/email-from-campaign`, {params: {groupId: localStorage.getItem('selectedServiceOwner')}})
  }

  getList(options?: any): Observable<ResponseEnvelope<any>> {
    return this.getRequest(`${this.SERVICE_URL}`, options)
  }
}
