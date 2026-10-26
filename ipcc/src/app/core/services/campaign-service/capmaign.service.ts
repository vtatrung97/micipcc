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
import {CampaignScript} from "@core/models/campaign/script-campaign.model";

@Injectable({providedIn: 'root'})
export class CampaignService extends AbstractService {
    constructor(private http: HttpClient,
                private authSvc: AuthService,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CAMPAIGN_SERVICE_API.url}/api/v1/campaigns`;
    }

    get CAMPAIGN_URL(): string {
        return `${SERVICES.CAMPAIGN_SERVICE_API.url}/api/v1`;
    }

    public getListMochaAccount() {
        return this.getRequest(`${SERVICES.CHAT_SERVICE_API.url}/api/v1/mocha-accounts`)
    }

    public addCampaign(campaign: any) {
        return this.postRequest(`${this.SERVICE_URL}`, {...campaign})
    }

    public editCampaign(campaignId: string, campaign: any) {
        return this.putRequest(`${this.SERVICE_URL}/${campaignId}`, {...campaign})
    }

    public deleteCampaign(campaignId: string) {
        return this.postRequest(`${this.SERVICE_URL}/delete/${campaignId}`)
    }

    public updateStatus(campaignId: string, status: number) {
        return this.putRequest(`${this.SERVICE_URL}/${campaignId}/status`, {status: status} )
    }

    public runCampaign(campaignId: string) {
        return this.postRequest(`${this.SERVICE_URL}/${campaignId}/run` )
    }

    public runMochaCampaign(campaignId: string) {
        return this.postRequest(`${this.SERVICE_URL}/${campaignId}/run-mocha` )
    }

    public runMyViettelCampaign(campaignId: string) {
        return this.postRequest(`${this.SERVICE_URL}/${campaignId}/run-myviettel` )
    }

    public runFacebookCampaign(campaignId: string) {
        return this.postRequest(`${this.SERVICE_URL}/${campaignId}/run-facebook` )
    }

    public getCampaign(campaignId: string) {
        return this.getRequest(`${this.SERVICE_URL}/${campaignId}`)
    }

    public exportCampaign(dto:any): Observable<any> {
        return this.getRequestFile(`${this.SERVICE_URL}/export`, dto)
    }

    public validateFile(file: File): Observable<ResponseEnvelope<any>> {
        const formData = new FormData();
        formData.append('file', file);
        return this.postRequest(`${this.SERVICE_URL}/validate-file`, formData);
    }


    public addByFile(filePath: string): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/add-file?filePath=${filePath}` )
    }

    public validateFileMocha(file: File): Observable<ResponseEnvelope<any>> {
        const formData = new FormData();
        formData.append('file', file);
        return this.postRequest(`${this.SERVICE_URL}/validate-file-mocha`, formData);
    }


    public addByFileMocha(filePath: string): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/add-file-mocha?filePath=${filePath}` )
    }

    public validateFileMyViettel(file: File): Observable<ResponseEnvelope<any>> {
        const formData = new FormData();
        formData.append('file', file);
        return this.postRequest(`${this.SERVICE_URL}/validate-file-myviettel`, formData);
    }


    public addByFileMyViettel(filePath: string): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/add-file-myviettel?filePath=${filePath}` )
    }


    public validateFileFacebook(file: File): Observable<ResponseEnvelope<any>> {
        const formData = new FormData();
        formData.append('file', file);
        return this.postRequest(`${this.SERVICE_URL}/validate-file-facebook`, formData);
    }


    public addByFileFacebook(filePath: string): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/add-file-facebook?filePath=${filePath}` )
    }


    public getCampaignType() {
        return this.getRequest(`${this.CAMPAIGN_URL}/campaigns-type`)
    }

    public addCustomer(customer: any[], campaignId: string) {
        return this.postRequest(`${this.CAMPAIGN_URL}/campaigns-customer/${campaignId}`, customer)
    }

    public addCustomerMyViettel(customer: any[], campaignId: string) {
        return this.postRequest(`${this.CAMPAIGN_URL}/campaigns-customer/myviettel/${campaignId}`, customer)
    }

    public addCustomerMocha(customer: any[], campaignId: string) {
        return this.postRequest(`${this.CAMPAIGN_URL}/campaigns-customer/mocha/${campaignId}`, customer)
    }

    public deleteCustomer(ids: {campaignCustomerId: string }[], campaignId: string) {
        return this.deleteRequest(`${this.CAMPAIGN_URL}/campaigns-customer/${campaignId}`, ids);
    }

    public sendCampaignEmail(email: CampaignScript) {
        return this.postRequest(`${this.CAMPAIGN_URL}/campaigns-script/script/emails`, email )
    }
    public editCampaignScript(email: CampaignScript, campaignScriptId: string) {
        return this.putRequest(`${this.CAMPAIGN_URL}/campaigns-script/script/emails/${campaignScriptId}`, email )
    }

    public createCampaignMochaScript(email: any) {
        return this.postRequest(`${this.CAMPAIGN_URL}/campaigns-script/script/mocha`, email )
    }
    public editCampaignMochaScript(email: any, campaignScriptId: string) {
        return this.putRequest(`${this.CAMPAIGN_URL}/campaigns-script/script/mocha/${campaignScriptId}`, email )
    }

    public createCampaignFacebookScript(email: any) {
        return this.postRequest(`${this.CAMPAIGN_URL}/campaigns-script/script/facebook`, email )
    }
    public editCampaignFacebookScript(email: any, campaignScriptId: string) {
        return this.putRequest(`${this.CAMPAIGN_URL}/campaigns-script/script/facebook/${campaignScriptId}`, email )
    }

    public validateImportEmail(file: any, campaignId: string) {
        return this.postRequest(`${this.CAMPAIGN_URL}/campaigns-customer/files/import-email/validate/${campaignId}`, file);
    }

    public validateImportMocha(file: any, campaignId: string) {
        return this.postRequest(`${this.CAMPAIGN_URL}/campaigns-customer/files/import-mocha/validate/${campaignId}`, file);
    }

    public validateImportMyViettel(file: any, campaignId: string) {
        return this.postRequest(`${this.CAMPAIGN_URL}/campaigns-customer/files/import-myviettel/validate/${campaignId}`, file);
    }

    public getCountResult(campaignId: string) {
        return this.getRequest(`${this.CAMPAIGN_URL}/campaigns-customer/count-result/campain/${campaignId}`);
    }

    exportResultEmail(campaignId: string, dto: any): Observable<any> {
        return this.getRequestFile(`${this.CAMPAIGN_URL}/campaigns-customer/export/campaign/${campaignId}`, dto)
    }

    exportResultMocha(campaignId: string, dto: any): Observable<any> {
        return this.getRequestFile(`${this.CAMPAIGN_URL}/campaigns-customer/export/campaign-mocha/${campaignId}`, dto)
    }

    exportResultFacebook(campaignId: string, dto: any): Observable<any> {
        return this.getRequestFile(`${this.CAMPAIGN_URL}/campaigns-customer/export/campaign-facebook/${campaignId}`, dto)
    }

    exportCustomerEmail(campaignId: string, dto: any): Observable<any> {
        return this.getRequestFile(`${this.CAMPAIGN_URL}/campaigns-customer/export/campaign/${campaignId}/customer`, dto)
    }
}
