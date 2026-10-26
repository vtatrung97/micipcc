import {HttpClient, HttpParams} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AbstractService } from "@core/services/abstract.service";
import { AuthService } from "@core/services/auth/auth.service";
import { ToastService } from "@core/services/toast-service";
import { SERVICES } from "@env/environment";
import { TranslateService } from "@ngx-translate/core";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {ServiceSurveyConfig} from "@core/models/category/survey-config/survey-config.model";
import {SurveyQuestionModel} from "@models/ticket/survey-question.model";

@Injectable({ providedIn: 'root' })
export class SurveyConfigService extends AbstractService {
    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private toastSvc: ToastService,
        private translate: TranslateService
    ) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/survey-config`;
    }

    getListSurveyConfig() {
        return this.getRequest(`${this.SERVICE_URL}`)
    }

    getSurveyConfig(channelId: number, ticketSourceId: string) {
        let params = new HttpParams()
        params = this.buildHttpParams(params,"channelId", channelId);
        params = this.buildHttpParams(params,"ticketSourceId", ticketSourceId);
        return this.getRequest(`${this.SERVICE_URL}/by-source-channel`, {params: params})
    }

    getSurveyConfigById(surveyConfigId: any): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/${surveyConfigId}`);
    }

    getSurveyTime(channelIds: (number | undefined)[], locale: string): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/time`, {params: {channelIds, locale}});
    }

    getSurveyScenarioByChannelIds(groupId:any, channelIds: (number | undefined)[]): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/scenario`, {params: {channelIds, groupId}});
    }

    getSurveyChannel(): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/channel`);
    }

    getSurveySource(groupId: any, channelIds: number[] | null | undefined, sourceIds?: string[]): Observable<any> {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'groupId', groupId);
        params = this.buildHttpParams(params, 'channelIds', channelIds);
        if (sourceIds) params = this.buildHttpParams(params, 'sourceIds', sourceIds);
        return this.getRequest(`${this.SERVICE_URL}/source`, {params: params});
    }

    getSurveyQuestion(surveyId: any): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/question`, {params: {surveyId}});
    }

    createSurveyConfig(object: ServiceSurveyConfig): Observable<ResponseEnvelope<any>> {
        return this.postRequest(this.SERVICE_URL, object);
    }

    updateSurveyConfig(object: ServiceSurveyConfig): Observable<ResponseEnvelope<any>> {
        return this.putRequest(`${this.SERVICE_URL}/${object.surveyConfigId}`, object)
    }

    deleteSurveyConfig(id: any) {
        return this.postRequest(`${this.SERVICE_URL}/delete/${id}`);
    }

    deleteSurveyConfigList(ids: any) {
        return this.deleteRequest(`${this.SERVICE_URL}`, ids);
    }
}
