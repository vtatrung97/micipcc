import {HttpClient, HttpParams} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ResponseEnvelope } from "@core/models/response.model";
import { AbstractService } from "@core/services/abstract.service";
import { AuthService } from "@core/services/auth/auth.service";
import { ToastService } from "@core/services/toast-service";
import { Observable } from "rxjs";
import { SERVICES } from "@env/environment";
import { TranslateService } from "@ngx-translate/core";
import { ServiceKpiConFigParam } from "@core/models/category/kpi-param/kpi.model";
import {ChannelId} from "@core/constant/ticket.enum";
import {KpiConfigParamModel2} from "@core/models/ticket/kpi-config-param.model";

@Injectable({ providedIn: 'root' })
export class KpiConfigParamService extends AbstractService {

    credentials: any = {};

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private toastSvc: ToastService,
        private translate: TranslateService
    ) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/kpi-config-params`;
    }

    getAllKpiConfigParamByChannelIdAndSourceId(channelId: number | undefined, sourceId: string | undefined): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/all-by-channel-source`, {params: {channelId, sourceId}});
    }

    getAllKpiConfigParamByChannelId(channelId: number | undefined, realmName: string, groupId?: string): Observable<ResponseEnvelope<any>> {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'channel', channelId);
        params = this.buildHttpParams(params, 'realmName', realmName);
        params = this.buildHttpParams(params, 'groupId', groupId);
        return this.getRequest(`${this.SERVICE_URL}/all-by-channel`, {params: params});
    }

    getAllKpiConfigParam(): Observable<ResponseEnvelope<{sourceId: string, kpiParams: KpiConfigParamModel2[]}[]>> {
        return this.getRequest(`${this.SERVICE_URL}/ticket-source`);
    }

    getKpiParamConfigByChannelIdAndSourceId(channelId: ChannelId, sourceId: string, isId: number):  Observable<ResponseEnvelope<Map<string,any>>>{
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'isId', isId);
        params = this.buildHttpParams(params, 'channelId', channelId);
        params = this.buildHttpParams(params, 'sourceObject', sourceId);
        return this.getRequest(this.SERVICE_URL + "/by-channel-source", {params: params} )
    }

    createKpiConfigParam(object: ServiceKpiConFigParam): Observable<ResponseEnvelope<any>> {
        return this.postRequest(this.SERVICE_URL, object);
    }

    exportConfigParam(paramNames: string, channelIds: string, sourceIds: any): Observable<any> {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'paramNames', paramNames);
        params = this.buildHttpParams(params, 'channelIds', channelIds);
        params = this.buildHttpParams(params, 'sourceIds', sourceIds);
        return this.getRequestFile(`${this.SERVICE_URL}/export`, params);
    }

    updateKpiConfigParam(object: ServiceKpiConFigParam): Observable<ResponseEnvelope<any>> {
        return this.putRequest(`${this.SERVICE_URL}/${object.kpiCfpId}`, object)
    }

    deleteKpiConfigParam(id: any) {
        return this.postRequest(`${this.SERVICE_URL}/delete/${id}`);
    }

    deleteListKpiConfigParam(object: any): Observable<ResponseEnvelope<any>> {
        return this.putRequest(this.SERVICE_URL, object);
    }

    getAllKpiParamConfigByChannelParamCode(chanel: ChannelId, code: string) {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'channelId', chanel);
        params = this.buildHttpParams(params, 'paramCode', code);
        return this.getRequest(`${this.SERVICE_URL}/by-channel-code`, {params: params});
    }
}
