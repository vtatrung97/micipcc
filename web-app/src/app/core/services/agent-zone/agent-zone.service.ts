import { Injectable } from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import { Observable } from "rxjs";
import { SERVICES } from "@env/environment";
import { TranslateService } from "@ngx-translate/core";
import { ResponseEnvelope } from "@core/models/response.model";
import { AbstractService } from "@core/services/abstract.service";
import { ToastService } from "@core/services/toast-service";

@Injectable({ providedIn: 'root' })
export class AgentConfigByZoneService extends AbstractService {
    constructor(
        private http: HttpClient,
        private toastSvc: ToastService,
        private translate: TranslateService
    ) {
        super(http, toastSvc, translate);
    }

    private convertToHttpParams(obj: any): HttpParams {
        let params = new HttpParams();
        Object.keys(obj || {}).forEach(key => {
            const value = obj[key];
            if (value !== null && value !== undefined && value !== '') {
                if (Array.isArray(value)) {
                    value.forEach((v: any) => {
                        params = params.append(key, v);
                    });
                } else {
                    params = params.set(key, value);
                }
            }
        });
        return params;
    }

    get BUSINESS_URL(): string {
         return `${SERVICES.ACCOUNT_API.url}/api/v1/business-restrict-zone`;
    }

    get SERVICE_URL(): string {
        return `${SERVICES.ACD_SERVICE_API.url}/api/v1/agents`;
    }
    get ACCOUNT_SERVER(): string {
        return `${SERVICES.ACCOUNT_API.url}/api/v1/agent-zone`;
    }

    public getAgentConfigByZone(paramsObj?: any): Observable<ResponseEnvelope<any>> {
        const params = this.convertToHttpParams(paramsObj);
        console.log(params.toString());
        return this.getRequest(this.ACCOUNT_SERVER, {params});
    }


    public updateAgentZone(data: { agentId: string, zoneId: string | null }): Observable<ResponseEnvelope<any>> {
        return this.putRequest(this.SERVICE_URL, data);
    }


    public deleteAgentConfig(agentId: string): Observable<ResponseEnvelope<any>> {
        return this.deleteRequest(this.ACCOUNT_SERVER, [agentId]);
    }


    public getAgents(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}`);
    }
    public getBusiness(paramsObj?: any): Observable<ResponseEnvelope<any>>{
        const params = this.convertToHttpParams(paramsObj);
        return this.getRequest(`${this.BUSINESS_URL}`, {params})
    }
    public updateBusiness(data: {name: string; restrictZone: boolean | null}[]): Observable<ResponseEnvelope<any>> {
        return this.putRequest(this.BUSINESS_URL, data);
    }
    public updateAgentConfig(
        data: { id: string; zoneId: string | null }[]
    ): Observable<ResponseEnvelope<any>> {
        return this.putRequest(this.ACCOUNT_SERVER, data);
    }

    getImportTemplate(): Observable<any> {
        return this.getRequestFile(`${this.ACCOUNT_SERVER}/template-import`)
    }

    validateFile(requestFile: any, actionId?: string): Observable<any> {
        return this.postRequest(`${this.ACCOUNT_SERVER}/validate`, requestFile);
    }

    actionImportExcel(request: any, param?: string): Observable<any> {
        return this.postRequest(`${this.ACCOUNT_SERVER}/import?filePath=${request.filePath}`, null);
  }
}
