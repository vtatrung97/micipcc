import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {Observable} from "rxjs";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";
import {ResponseEnvelope} from "@core/models/response.model";
import {CustomerModel} from "@core/models/customer/customer.model";

@Injectable({providedIn: 'root'})
export class CustomerService extends AbstractService {
    constructor(private http: HttpClient,
                private authSvc: AuthService,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/customers`;
    }

    public getCustomerByContact(contact: string): Observable<ResponseEnvelope<CustomerModel>> {
        return this.getRequest(`${this.SERVICE_URL}/by-contacts`, {params: {contact: contact}});
    }
}
