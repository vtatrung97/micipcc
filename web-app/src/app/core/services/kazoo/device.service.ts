import {Injectable} from '@angular/core';
import { map } from 'rxjs/operators';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import {KazooCbResponse} from '../../models/kazoo/kazoo-cb-response.model';
import {Observable} from 'rxjs';
import {AbstractKazooService} from './abstract-kazoo.service';
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {CbAuthService} from "@core/services/auth/cb-auth.service";
import { SERVICES } from '@env/environment';

@Injectable({providedIn: 'root'})
export class DeviceService extends AbstractKazooService {

    constructor(private http: HttpClient,
                private authService: AuthService,
                private cbAuthSvc: CbAuthService,
                private toast: ToastService,
                private translate: TranslateService) {
        super(http, authService, toast, translate);
    }

    get SERVICE_URL(): string {
        return `${this.cbAuthSvc.accountURI}/devices`;
    }

    get SERVICE_DEVICE_URL(): string {
        return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/device`
    }

    searchByName(filter?: { search_string?: any, start_key?: any, page_size?: any }) {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 't', 'device');
        params = this.buildHttpParams(params, 'q', 'name');
        params = this.buildHttpParams(params, 'v', filter?.search_string);
        params = this.buildHttpParams(params, 'start_key', filter?.start_key);
        params = this.buildHttpParams(params, 'page_size', filter?.page_size);
        const url = `${this.cbAuthSvc.accountURI}/search`;
        return this.getRequest(url, {params: params});
    }

    listWebrtcSoftphone() {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'filter_owner_id', this.authService.userId);
        params = this.buildHttpParams(params, 'filter_device_type', 'softphone');
        params = this.buildHttpParams(params, 'filter_media.webrtc', true);
        params = this.buildHttpParams(params, 'paginate', false);
        return this.getRequest(this.SERVICE_URL, {params: params});
    }

    public getStatus(paginate?: boolean): Observable<KazooCbResponse> {
        let params = new HttpParams();
        params = params.append('paginate', paginate + '');
        return this.getRequest(`${this.SERVICE_URL}/status`, {params: params});
    }

    getListDevice(groupId: string, kzAccountId: string): Observable<KazooCbResponse> {
        return this.getRequest(`${this.SERVICE_DEVICE_URL}/for-flows?groupId=${groupId}&kzAccountId=${kzAccountId}`);
    }
}
