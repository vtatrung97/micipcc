import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";
import {ResponseEnvelope} from "@core/models/response.model";
import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {Observable} from "rxjs";
import {
    ZaloTemplateModel
} from "@pages/ticket/ticket-detail/frame-body/frame-chat/form-mess/share/template-zalo/dynamic-zns-form/field-base.model";

@Injectable({providedIn: 'root'})
export class ZaloTemplateService extends AbstractService {
    constructor(private http: HttpClient,
                private authSvc: AuthService,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/zalo-templates`;
    }

    public getZaloTemplates(): Observable<ResponseEnvelope<ZaloTemplateModel[]>> {
        return this.getRequest(`${this.SERVICE_URL}`);
    }

    public getZaloTemplateByTemplateId(templateId: number): Observable<ResponseEnvelope<ZaloTemplateModel>> {
        return this.getRequest(`${this.SERVICE_URL}/${templateId}`);
    }

}

