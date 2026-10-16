import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {SERVICES} from "@env/environment";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {Plan} from "@models/plan/plan.model";
import {SIGNATURE_ACTION} from "../../../app.constants";

@Injectable({providedIn: 'root'})
export class KeywordGroupsService extends AbstractService {
  constructor(
    private http: HttpClient,
    private authSvc: AuthService,
    private toastSvc: ToastService,
    private translate: TranslateService) {
    super(http, toastSvc, translate);
  }

  get SERVICE_URL(): string {
    return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/keyword`;
  }

  public listKeywordGroupsByRealmNameAjax(): string {
    return `${this.SERVICE_URL}`
  }

  public getKeywordGroupById(id: string): Observable<any> {
    return this.getRequest(`${this.SERVICE_URL}/${id}`);
  }

  public createKeywordGroup(keywordGroup: any): Observable<any> {
    return this.postRequest(`${this.SERVICE_URL}`, keywordGroup);
  }
  public editKeywordGroup(id: string, keywordGroup: any): Observable<any> {
    return this.putRequest(`${this.SERVICE_URL}/${id}`, keywordGroup);
  }
  public getChannelList(): Observable<any> {
    return this.getRequest(`${this.SERVICE_URL}/channels`);
  }

  public getAllChannelList(): Observable<any> {
    return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/channels`);
  }

  public getAllSourceList(): Observable<any> {
    return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/tickets/sources`);
  }

  public getSourceListByChannelId(channelIds: string[]): Observable<any> {
    let params = new HttpParams({
      fromObject: {
        channelIds: channelIds,
      }
    }) ;
    return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/tickets/sources-by-channel-ids`, {params: params});
  }

  public getSourceList(): Observable<any> {
    return this.getRequest(`${this.SERVICE_URL}/sources`);
  }

  public getCreators(): Observable<any> {
    return this.getRequest(`${this.SERVICE_URL}/creators`);
  }

  public getUpdaters(): Observable<any> {
    return this.getRequest(`${this.SERVICE_URL}/updaters`);
  }

  public saveTransactionDraft(transaction: any): Observable<any> {
    return this.postRequest(`${this.SERVICE_URL}/plan/draft-transaction`, transaction);
  }

  public getPlanTypes(): Observable<any> {
    return this.getRequest(`${this.SERVICE_URL}/plan-types`);
  }

  public getPlanDisplayDetail(planDisplayId: string): Observable<any> {
    return this.getRequest(`${this.SERVICE_URL}/plan-display-detail?id=${planDisplayId}`);
  }

  public deleteListPlan(idList: (string | undefined)[]): Observable<any> {
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

  mergeCustomers(targetId: string, sourceId: string, userId?: string): Observable<ResponseEnvelope<any>> {
    if (!sourceId) return this.getRequest(`${this.SERVICE_URL}/customers/merge?target=${targetId}&userId=${userId}`)
    return this.getRequest(`${this.SERVICE_URL}/customers/merge?target=${targetId}&source=${sourceId}`)
  }

  deleteCustomers(object: any): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}/delete`, object);
  }

  public export(filter: any): Observable<any> {
    return this.getRequestFile(`${this.SERVICE_URL}/export`, filter)
  }
}
