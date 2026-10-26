import { Injectable } from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import { ToastService } from "@core/services/toast-service";
import { Observable } from "rxjs";
import { SERVICES } from "@env/environment";
import { AbstractService } from "@core/services/abstract.service";
import { TranslateService } from "@ngx-translate/core";
import { ResponseEnvelope } from "@core/models/response.model";
import { AuthService } from "../auth/auth.service";
import {SourceModel} from "@core/models/block-rule/source.model";
import {ServiceModel} from "@core/models/block-rule/service.model";


@Injectable({ providedIn: 'root' })
export class TicketSourceService extends AbstractService {

    constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService, private authService: AuthService,) {
        super(http, toastSv, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-sources`;
    }

    getListTicketSource() {
        return this.getRequest(`${this.SERVICE_URL}`);
    }

    public getTicketSourceBySourceId(sourceId: any): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/by-sourceId?sourceId=${sourceId}`);
    }

    getTicketSource(channelId?: number): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/${channelId}`)
    }

    getTicketSourceByChannelIdAndSourceCode(channelId?: number, sourceCode?: string | null): Observable<any> {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'channelId', channelId);
        params = this.buildHttpParams(params, 'sourceCode', sourceCode);
        return this.getRequest(`${this.SERVICE_URL}`, {params: params});
    }

    getTicketSourceByChannelIdsAndGroupId(groupId?: string | null, channelIds?: number[] | null | undefined): Observable<any> {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'channelId', channelIds);
        params = this.buildHttpParams(params, 'groupId', groupId);
        return this.getRequest(`${this.SERVICE_URL}/by-channelIds`, {params: params});
    }

    getSourceListFromTicketSource(groupId: string | null): Observable<ResponseEnvelope<SourceModel[]>> {
        return this.getRequest(`${this.SERVICE_URL}/source/block-rule`, {params: {groupId}});
    }

    getServiceListFromTicketSource(groupId?: string | null): Observable<ResponseEnvelope<ServiceModel[]>> {
        return this.getRequest(`${this.SERVICE_URL}/service/block-rule`, {params: {groupId}});
    }

    getListSourcesInReport(request: {groupId: string, channelIds: string[]}): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/reports/ticket-source`, request);
    }
}
