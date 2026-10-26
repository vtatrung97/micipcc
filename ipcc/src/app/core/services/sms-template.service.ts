import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {SERVICES} from "@env/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {SmsTemplate} from "@models/sms-template/sms-template.model";

@Injectable({providedIn: 'root'})
export class SmsTemplateService extends AbstractService {
    constructor(private http: HttpClient,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/message`;
    }

    getSmsTemplate(object: SmsTemplate): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/findByProperties`, object);
    }

    createSmsTemplate(object: SmsTemplate): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}`, object)
    }

    updateSmsTemplate(object: SmsTemplate): Observable<ResponseEnvelope<any>> {
        return this.putRequest(`${this.SERVICE_URL}`, object)
    }

    deleteSmsTemplate(ids: string[]): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/delete`, ids);
    }

    validateFile(groupId: string | null, formData: any) {
        return this.postRequest(`${this.SERVICE_URL}/validate-file?groupId=${groupId}`, formData);
    }

    importFile(filePath: string, smsTemplate: SmsTemplate[] | undefined) {
        return this.postRequest(`${this.SERVICE_URL}/import?filePath=${filePath}`, smsTemplate);
    }

    exportFile(payload: any): Observable<any> {
        return this.postRequestFile2(`${this.SERVICE_URL}/export`, payload);
    }

    getByType(type: number): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/for-warning-routing/${type}`);
    }
}
