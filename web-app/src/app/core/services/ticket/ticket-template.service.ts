import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SERVICES } from "@env/environment";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { AbstractService } from "../abstract.service";
import { ToastService } from "../toast-service";
import { ResponseEnvelope } from "@core/models/response.model";
import { ServiceTicketTemplate } from "@core/models/ticket/ticket-template.model";

@Injectable({ providedIn: 'root' })
export class TicketTemplateService extends AbstractService {

    constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService) {
        super(http, toastSv, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-templates`;
    }

    public getListTicketTemplate(): Observable<any> {
        return this.getRequest(this.SERVICE_URL);
    }

    createTicketTemplate(object: ServiceTicketTemplate): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}`, object)
    }

    updateTicketTemplate(object: ServiceTicketTemplate): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/${object.ticketTemplateId}`, object)
    }

    deleteTicketTemplate(id: any) {
        return this.deleteRequest(`${this.SERVICE_URL}/${id}`);
    }

    deleteListTicketTemplate(object: any): Observable<ResponseEnvelope<any>> {
        return this.deleteRequest(`${this.SERVICE_URL}`, object)
    }
}
