import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AbstractService} from "../abstract.service";
import {CbResponse} from "@core/models/response.model";
import {ToastService} from "../toast-service";
import {TranslateService} from "@ngx-translate/core";


export abstract class CbAbstractService extends AbstractService {

    protected constructor(
        private httpClientCb: HttpClient,
        private toastServiceCb: ToastService,
        private translateServiceCb: TranslateService) {
        super(httpClientCb, toastServiceCb, translateServiceCb);
    }

    abstract override get SERVICE_URL(): string;

    public override list(filter?: {
        start_key?: any, paginate?: boolean, has_key?: boolean,
        has_value?: boolean, key_missing?: any, filter_owner_id?: any,
        filter_type?: any, filter_name?: any, page_size?: number
    }): Observable<CbResponse<any>> {
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

    public override get(id: string): Observable<CbResponse<any>> {
        return this.getRequest(`${this.SERVICE_URL}/${id}`);
    }

    public override saveOrUpdate(object: any): Observable<CbResponse<any>> {
        if (object.id) {
            return this.postRequest(`${this.SERVICE_URL}/${object.id}`, JSON.stringify({data: object}));
        } else {
            return this.putRequest(`${this.SERVICE_URL}`, JSON.stringify({data: object}));
        }
    }

    public patch(id: string, object: any): Observable<CbResponse<any>> {
        return this.patchRequest(`${this.SERVICE_URL}/${id}`, JSON.stringify({data: object}));
    }

    public override delete(id: string): Observable<CbResponse<any>> {
        return this.deleteRequest(`${this.SERVICE_URL}/${id}`);
    }
}
