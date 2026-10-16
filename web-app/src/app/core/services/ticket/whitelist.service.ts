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
import {FileUpload} from "@core/models/ticket/ticket.type";
import {ChannelUploadType} from "@core/constant/constant";

@Injectable({providedIn: 'root'})
export class WhitelistService extends AbstractService {
    constructor(private http: HttpClient,
                private authSvc: AuthService,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/customer-whitelist`;
    }

    public getAutoblockRuleById(autoblockRuleId: string): Observable<ResponseEnvelope<AutoblockRuleModel>> {
        return this.getRequest(`${this.SERVICE_URL}/${autoblockRuleId}`);
    }

    public getInvalidBlockRulesOfApplyId(req: ReqInvalidBlockRuleModel): Observable<ResponseEnvelope<AutoblockRuleModel[]>> {
        let paramsQs = new HttpParams({fromString: qs.stringify(req)});
        return this.getRequest(`${this.SERVICE_URL}/invalidate`, {params: paramsQs});
    }

    public deactiveBlockRuleApplyDetail(brApplyDetailId: string) {
        return this.putRequest(`${this.SERVICE_URL}/br-apply-detail/${brApplyDetailId}/deactivate`)
    }

    public addBlockRuleException(blockRuleId: string, type: number, applyId: string) {
        return this.postRequest(`${this.SERVICE_URL}/br-apply-detail`, {blockRuleId, type, applyId})
    }

    public createWhiteList(whiteList: any): Observable<ResponseEnvelope<any>> {
        return this.postRequest(this.SERVICE_URL, whiteList);
    }

    public updateAutoblockRule(autoblockRule: any, blockRuleId: string): Observable<ResponseEnvelope<any>> {
        return this.putRequest(`${this.SERVICE_URL}/${blockRuleId}`, autoblockRule);
    }

    public deleteWhiteList(ids: string[]): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/delete`, {customerWhitelistIds: ids});
    }

    public validateFile(file: File, whiteRange: number): Observable<ResponseEnvelope<any>> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('whiteRange', whiteRange + "");
        return this.postRequest(`${this.SERVICE_URL}/validate-file`, formData);
    }

    public addByFile(req: any): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/add-file?filePath=${req.filePath}`,req )
    }

    public deleteByFile(req: any): Observable<ResponseEnvelope<any>> {
        return this.deleteRequest(`${this.SERVICE_URL}/delete-file?filePath=${req.filePath}`,req )
    }
}
