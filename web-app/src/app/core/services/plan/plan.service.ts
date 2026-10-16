import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {SERVICES} from "@env/environment";
import {Observable} from "rxjs";
import { ResponseEnvelope } from "@core/models/response.model";
import { Plan } from "@models/plan/plan.model";

@Injectable({ providedIn: 'root' })
export class PlanService extends AbstractService {
    constructor(
        private http: HttpClient,
        private authSvc: AuthService,
        private toastSvc: ToastService,
        private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.ACCOUNT_API.url}/api/v1`;
    }
    public saveTransactionDraft(transaction: any): Observable<any>{
        return this.postRequest(`${this.SERVICE_URL}/plan/draft-transaction`, transaction);
    }
    public getPlanTypes(): Observable<any>{
        return this.getRequest(`${this.SERVICE_URL}/plan-types`);
    }
    public getPlanDisplayDetail(planDisplayId: string): Observable<any>{
        return this.getRequest(`${this.SERVICE_URL}/plan-display-detail?id=${planDisplayId}`);
    }
    public deleteListPlan(idList: (string | undefined)[]): Observable<any>{
        return this.postRequest(`${this.SERVICE_URL}/plans/delete`, idList);
    }
    getCreatedByList(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/get-all-user-create`)
    }
    getUpdatedByList(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/get-all-user-update`)
    }
    actionExportExcel(params: any): Observable<any> {
        return this.getRequestFile(`${this.SERVICE_URL}/export-plans?`, params)
    }
    actionAddPlan(data: Plan): Observable<any> {
        return this.postRequest(`${this.SERVICE_URL}/plans/add`, data)
    }
}
