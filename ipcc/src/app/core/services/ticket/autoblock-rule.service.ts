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

@Injectable({providedIn: 'root'})
export class AutoblockRuleService extends AbstractService {
    constructor(private http: HttpClient,
                private authSvc: AuthService,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/block-rules`;
    }

    public getAutoblockRuleById(autoblockRuleId: string): Observable<ResponseEnvelope<AutoblockRuleModel>> {
        return this.getRequest(`${this.SERVICE_URL}/${autoblockRuleId}`);
    }

    public getInvalidBlockRulesOfApplyId(req: ReqInvalidBlockRuleModel): Observable<ResponseEnvelope<AutoblockRuleModel[]>> {
        let paramsQs = new HttpParams({fromString: qs.stringify(req)});
        return this.getRequest(`${this.SERVICE_URL}/invalidate-rule`, {params: paramsQs});
    }

    public deactiveBlockRuleApplyDetail(brApplyDetailId: string) {
        return this.putRequest(`${this.SERVICE_URL}/br-apply-detail/${brApplyDetailId}/deactivate`)
    }

    public addBlockRuleException(blockRuleId: string, type: number, applyId: string) {
        return this.postRequest(`${this.SERVICE_URL}/br-apply-detail`, {blockRuleId, type, applyId})
    }

    public createAutoblockRule(autoblockRule: any): Observable<ResponseEnvelope<any>> {
        return this.postRequest(this.SERVICE_URL, autoblockRule);
    }

    public updateAutoblockRule(autoblockRule: any, blockRuleId: string): Observable<ResponseEnvelope<any>> {
        return this.putRequest(`${this.SERVICE_URL}/${blockRuleId}`, autoblockRule);
    }

    public deleteAutoblockRules(ids: string[]): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/delete`, ids);
    }

    public checkExistRuleName(ruleName: string, groupId: string | null) {
        return this.getRequest(`${this.SERVICE_URL}/check-exist/rule-name`, {params: {ruleName, groupId}});
    }
}
