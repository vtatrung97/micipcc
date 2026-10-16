import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {Observable} from "rxjs";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";
import {ResponseEnvelope} from "@core/models/response.model";
import {KazooCbResponse} from "@core/models/kazoo/kazoo-cb-response.model";
import {CallflowDropdown} from "@core/models/callflow/callflow.model";

@Injectable({providedIn: 'root'})
export class CallflowCcmsService extends AbstractService {
    constructor(private http: HttpClient,
                private authSvc: AuthService,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/callflows`;
    }

    get SERVICE_URL_TABLE(): string {
        return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/callflows/table`;
    }

    public override list(callflowType?: string): Observable<KazooCbResponse> {
        if (callflowType) {
            return this.getRequest(this.SERVICE_URL, {params: {callflowType}});
        } else {
            return this.getRequest(this.SERVICE_URL);
        }

    }

    public override get(id: string): Observable<KazooCbResponse> {
        return this.getRequest(`${this.SERVICE_URL}/${id}`, undefined, true);
    }

    public getCfForPivotCheckCustomerGroup(): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/for-dropdown-pivot-customer-group`);
    }

    public getCallflowsByType(type: any): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/drop-down-by-type?type=${type}`);
    }

    public getDropdownByType(type: 1 | 4 | 5): Observable<ResponseEnvelope<CallflowDropdown[]>> {
        return this.getRequest(`${this.SERVICE_URL}/dropdown-by-type?type=${type}`);
    }

    public override saveOrUpdate(object: any): Observable<ResponseEnvelope<any>> {
        // object.groupId =localStorage.getItem('selectedServiceOwner');
        // object.realmName = this.authSvc.realmName
        if (object.id) {
            return this.putRequest(`${this.SERVICE_URL}`, object);
        } else {
            return this.postRequest(`${this.SERVICE_URL}`, object);
        }
    }

    public patch(id: string, object: any): Observable<KazooCbResponse> {
        return this.patchRequest(`${this.SERVICE_URL}/${id}`, object);
    }

    public override delete(id: string): Observable<KazooCbResponse> {
        return this.postRequest(`${this.SERVICE_URL}/delete/${id}`, undefined, true);
    }


    public deleteCallflowIds(ids: string[]): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/deleteMultiple`, ids);
    }

    public getCallflowTypes(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/callflow-type`);
    }

    public actionExportExcel(params: any): Observable<any> {
        return this.getRequestFile(`${this.SERVICE_URL}/export?`, params)
    }
}
