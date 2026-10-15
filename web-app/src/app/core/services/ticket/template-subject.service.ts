import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SERVICES } from "@env/environment";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { AbstractService } from "../abstract.service";
import { ToastService } from "../toast-service";
import { ResponseEnvelope } from "@core/models/response.model";
import { ServiceTemplateSubject } from "@core/models/ticket/template-subject.model";

@Injectable({ providedIn: 'root' })
export class TemplateSubjectService extends AbstractService {

    constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService) {
        super(http, toastSv, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/template-subjects`;
    }

    public getListSubjectTemplate(): Observable<any> {
        return this.getRequest(this.SERVICE_URL);
    }

    createSubjectTemplate(object: ServiceTemplateSubject): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}`, object)
    }

    updateSubjectTemplate(object: ServiceTemplateSubject): Observable<ResponseEnvelope<any>> {
        return this.putRequest(`${this.SERVICE_URL}/${object.templateSubjectId}`, object)
    }

    deleteSubjectTemplate(id: any) {
        return this.deleteRequest(`${this.SERVICE_URL}/${id}`);
    }
}
