import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {SERVICES} from "@env/environment";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {ServiceSatisfactionConfig} from "@core/models/category/satisfaction-config/satisfaction-config.model";

@Injectable({providedIn: 'root'})
export class SatisfactionSurveyConfigService extends AbstractService{
    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private toastSvc: ToastService,
        private translate: TranslateService
    ) {
        super(http, toastSvc, translate);
    }
    get SERVICE_URL() : string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/satisfaction-config`;
    }

    getForSurveyDropdown(channelId: string): Observable<ResponseEnvelope<any>> {
        let params = new HttpParams()
        params = this.buildHttpParams(params, "channelId", channelId);
        return this.getRequest(`${this.SERVICE_URL}/get-for-survey-dropdown`, {params: params})
    }

    getScenario(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/dropdown-scenario`)
    }

    getSurveyScenarioByChannelIds(groupId: any, channelIds: (any | undefined)[]): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/scenario`, {params: {channelIds, groupId}})
    }

    getDropSurveyTime(channelId: string): Observable<ResponseEnvelope<any>> {
        let params = new HttpParams()
        params = this.buildHttpParams(params, "channelId", channelId)
        return this.getRequest(`${this.SERVICE_URL}/get-drop-survey-time`, {params: params})
    }

    getSourceByListChannel(channelIds: (string | undefined)[]): Observable<ResponseEnvelope<any>> {
        let params = new HttpParams()
        params = this.buildHttpParams(params, "channelIds", channelIds)
        return this.getRequest(`${this.SERVICE_URL}/sources`, {params: params})
    }

    getSurveyConfigById(channelWebId: string) {
        return this.getRequest(`${this.SERVICE_URL}/${channelWebId}`)
    }

    createSurveyConfig(object: ServiceSatisfactionConfig): Observable<ResponseEnvelope<any>> {
        return this.postRequest(this.SERVICE_URL, object)
    }

    deleteSurveyConfig(id: any) {
        return this.deleteRequest(`${this.SERVICE_URL}/${id}`)
    }

    deleteSurveyConfigList(ids: any) {
        return this.deleteRequest(`${this.SERVICE_URL}`, ids)
    }

    updateSurveyConfig(object: ServiceSatisfactionConfig, id: any): Observable<ResponseEnvelope<any>> {
        return this.putRequest(`${this.SERVICE_URL}/${id}`, object)
    }

    getCreateAndUpdateUserList(groupId: string | null) {
        let param = new HttpParams()
        param = this.buildHttpParams(param, "groupId", groupId)
        return this.getRequest(`${this.SERVICE_URL}/create-update-users`, {params: param})
    }
}
