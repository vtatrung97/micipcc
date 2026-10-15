import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {CbAbstractService} from "./cb-abstract.service";
import {CbAuthService} from "@core/services/auth/cb-auth.service";
import {Observable} from "rxjs";
import {CbResponse} from "@core/models/response.model";
import {DeviceSummary} from "@core/models/kazoo/device.model";
import {ToastService} from "../toast-service";
import {AuthService} from "@core/services/auth/auth.service";
import {TranslateService} from "@ngx-translate/core";


@Injectable({providedIn: 'root'})
export class CbDeviceService extends CbAbstractService {

    constructor(private http: HttpClient,
                private authService: AuthService,
                private cbAuthSvc: CbAuthService,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${this.cbAuthSvc.accountURI}/devices`;
    }

    listDevicesWithoutOwner(): Observable<CbResponse<DeviceSummary[]>> {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'key_missing', 'owner_id');
        params = this.buildHttpParams(params, 'paginate', false);
        return this.getRequest(this.SERVICE_URL, {params: params});
    }

    listWebrtcSoftphone() {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'filter_owner_id', this.authService.kzUserId);
        params = this.buildHttpParams(params, 'filter_device_type', 'softphone');
        params = this.buildHttpParams(params, 'filter_media.webrtc', true);
        params = this.buildHttpParams(params, 'paginate', false);
        return this.getRequest(this.SERVICE_URL, {params: params});
    }

    public getStatus(paginate?: boolean): Observable<CbResponse<any>> {
        let params = new HttpParams();
        params = params.append('paginate', paginate + '');
        return this.getRequest(`${this.SERVICE_URL}/status`, {params: params});
    }
}
