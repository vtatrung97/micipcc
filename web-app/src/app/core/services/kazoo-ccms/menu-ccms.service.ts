import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {Observable} from "rxjs";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";
import {ResponseEnvelope} from "@core/models/response.model";
import {AutoblockRuleModel, ReqInvalidBlockRuleModel} from "@core/models/ticket/autoblock-rule.model";
import * as qs from "qs";
import {KazooCbResponse} from "@core/models/kazoo/kazoo-cb-response.model";

@Injectable({providedIn: 'root'})
export class MenuCcmsService extends AbstractService {
    constructor(private http: HttpClient,
                private authSvc: AuthService,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/kazoo/menus`;
    }

    public override list(filter?: {
        start_key?: any, paginate?: boolean, has_key?: any, has_value?: any, key_missing?: any,
        filter_owner_id?: any, filter_type?: any, filter_name?: any, page_size?: any,
        realmName?: any, groupId?: any
    }): Observable<KazooCbResponse> {
        let params = new HttpParams();
        if (filter) {
            params = this.buildHttpParams(params, 'start_key', filter.start_key);
            params = this.buildHttpParams(params, 'has_key', filter.has_key);
            params = this.buildHttpParams(params, 'has_value', filter.has_value);
            params = this.buildHttpParams(params, 'key_missing', filter.key_missing);
            params = this.buildHttpParams(params, 'filter_owner_id', filter.filter_owner_id);
            params = this.buildHttpParams(params, 'filter_type', filter.filter_type);
            params = this.buildHttpParams(params, 'filter_name', filter.filter_name);
            params = this.buildHttpParams(params, 'paginate', filter.paginate);
            params = this.buildHttpParams(params, 'page_size', filter.page_size);
        }
        return this.getRequest(this.SERVICE_URL, {params: params});
    }

    public listByType(type: string): Observable<KazooCbResponse> {
        return this.getRequest(`${this.SERVICE_URL}/type/${type}`);
    }

    public override get(id: string): Observable<KazooCbResponse> {
        return this.getRequest(`${this.SERVICE_URL}/${id}`, undefined, true);
    }

    public override saveOrUpdate(object: any): Observable<KazooCbResponse> {
        // object.groupId =localStorage.getItem('selectedServiceOwner');
        // object.realmName = this.authSvc.realmName
        if (object.id) {
            return this.putRequest(`${this.SERVICE_URL}`, object, true);
        } else {
            return this.postRequest(`${this.SERVICE_URL}`, object, true);
        }
    }

    public patch(id: string, object: any): Observable<KazooCbResponse> {
        return this.patchRequest(`${this.SERVICE_URL}/${id}`, object);
    }

    public override delete(id: string): Observable<KazooCbResponse> {
        return this.deleteRequest(`${this.SERVICE_URL}/${id}`, undefined, true);
    }
}
