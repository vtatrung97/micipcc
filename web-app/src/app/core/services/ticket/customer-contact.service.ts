import { Injectable } from "@angular/core";
import { AbstractService } from "@core/services/abstract.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AuthService } from "@core/services/auth/auth.service";
import { ToastService } from "@core/services/toast-service";
import { Observable } from "rxjs";
import { SERVICES } from "@env/environment";
import { TranslateService } from "@ngx-translate/core";
import { ResponseEnvelope } from "@core/models/response.model";
import { CustomerContact } from "@models/ticket/customer-contact.model";
import * as qs from "qs";
import { catchError } from "rxjs/operators";

@Injectable({ providedIn: 'root' })
export class CustomerContactService extends AbstractService {
    constructor(private http: HttpClient, private authSvc: AuthService, private toastSvc: ToastService, private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/customer-contacts`;
    }

    public getCustomerContactELK(customerId: string): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/by-customer/${customerId}`);
    }

    public getCustomerContact(customerId: string, contactType: string): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}`, { params: { customerId, contactType } });
    }

    updateContacts(listDataEdit: any, customerId: string) {
        return this.putRequest(`${this.SERVICE_URL}/${customerId}`, listDataEdit)
    }

    createCustomerContactDemo(data: object): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}`, data);
    }
    saveOrUpdateConatact(object: any): Observable<any> {
        return this.postRequest(`${this.SERVICE_URL}`, object);
    }

    createCustomerContact(contact: CustomerContact): Observable<any> {
        return this.postRequest(`${this.SERVICE_URL}`, contact);
    }

    updateCustomerContact(contact: CustomerContact): Observable<any> {
        return this.putRequest(`${this.SERVICE_URL}`, contact);
    }

    deleteCustomerContact(customerContactId: CustomerContact): Observable<any> {
        return this.deleteRequest(`${this.SERVICE_URL}/${customerContactId}`);
    }

    getCustomerWithoutLock(params: any): Observable<ResponseEnvelope<any>> {
        const paramsQs = new HttpParams({ fromString: qs.stringify({ ...params, }) });
        return this.getRequest(`${this.SERVICE_URL}/without-lock`, { params: paramsQs })
    }

    getCustomerWithLock(params: any): Observable<ResponseEnvelope<any>> {
        const paramsQs = new HttpParams({ fromString: qs.stringify({ ...params, }) });
        return this.getRequest(`${this.SERVICE_URL}/with-lock`, { params: paramsQs })
    }

    getCustomerContactTypes(): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/contact-types`);
    }

    public getCustomerContactByCustomerContactId(customerContactId: string): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/${customerContactId}`);
    }

    getCustomerContactByCustomerId(customerId: string): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/by-customerid/${customerId}`);
    }

    getEmail(textSearch?: string): Observable<any> {
        return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/group-email/search-for-send-mail/${textSearch}`);
    }

    getEmails(textSearch?: string): Observable<any> {
        return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/group-email/search-for-send-mails?${textSearch}`);
    }

    getGroupEmail(groupEmailId?: string): Observable<any> {
        return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/group-email-detail/search-for-send-mail/${groupEmailId}`);
    }

    getGroupEmailId(groupEmailIds: string[]): Observable<any> {
        return this.postRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/group-email-detail/search-list-for-send-mail`, groupEmailIds);
    }
}
