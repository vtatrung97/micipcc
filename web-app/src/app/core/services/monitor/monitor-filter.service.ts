import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {SERVICES} from "@env/environment";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {TranslateService} from "@ngx-translate/core";
import {MonitorFilter} from "@models/monitor/monitor-filter.model";
import {MonitorFilterAgent} from "@models/monitor/monitor-filter-agent.model";
import {MonitorFilterOption} from "@models/monitor/monitor-filter-option.model";
import {MonitorFilterAgentDetail} from "@models/monitor/monitor-filter-agent-detail.model";
import {MonitorFilterDetail} from "@models/monitor/monitor-filter-detail.model";

@Injectable({providedIn: 'root'})
export class MonitorFilterService extends AbstractService {

  private monitorFilterAgentSavedSrc = new Subject<{filterAgent: MonitorFilterAgent, isDelete: boolean}>();
  monitorFilterAgentSaved$ = this.monitorFilterAgentSavedSrc.asObservable();
  announceFilterAgentSaved(monitorFilterAgent: MonitorFilterAgent, isDelete: boolean) {
    this.monitorFilterAgentSavedSrc.next({filterAgent: monitorFilterAgent, isDelete: isDelete});
  }

  private bindFilterSrc = new BehaviorSubject<{type: string, name: string, value: any, prechecked: boolean, formName: string}>({
    name: "",
    type: "",
    value: undefined,
    prechecked: false,
    formName: ""
  });
  bindFilter$ = this.bindFilterSrc.asObservable();
  announceBindFilter(data: {type: string, name: string, value: any, prechecked: boolean, formName: string}) {
    this.bindFilterSrc.next(data);
  }

  private leftFilterListBarChangedSrc = new Subject<boolean>();
  leftFilterListBarChanged$ = this.leftFilterListBarChangedSrc.asObservable();
  announceLeftFilterListBarChanged(show: boolean) {
    this.leftFilterListBarChangedSrc.next(show);
  }

  constructor(private http: HttpClient, private auth: AuthService, private toast: ToastService, private translate: TranslateService) {
    super(http, toast, translate);
  }

  get BASE_SERVICE_URL(): string {
    return `${SERVICES.ACD_SERVICE_API.url}/api/v1`
  }

  get TICKET_BASE_SERVICE_URL(): string {
    return `${SERVICES.TICKET_SERVICE_API.url}/api/v1`
  }

  get SERVICE_URL(): string {
    return `${SERVICES.ACD_SERVICE_API.url}/api/v1/monitor-filters`;
  }

  get FILTER_AGENT_SERVICE_URL(): string {
    return `${this.SERVICE_URL}/filter-agents`
  }

  get FILTER_DETAIL_SERVICE_URL(): string {
    return `${this.SERVICE_URL}/filter-details`
  }

  get FILTER_OPTION_SERVICE_URL(): string {
    return `${this.SERVICE_URL}/filter-options`
  }

  public listFilter(tableName: string, optionalList?: number[]): Observable<ResponseEnvelope<MonitorFilter[]>> {
    if (optionalList) {
      return this.getRequest(`${this.SERVICE_URL}?tableName=${tableName}&optionalList=${optionalList}`);
    } else {
      return this.getRequest(`${this.SERVICE_URL}?tableName=${tableName}`);
    }
  }

  public listFilterById(ids: string[]): Observable<ResponseEnvelope<MonitorFilter[]>> {
    return this.postRequest(`${this.SERVICE_URL}/by-ids`, ids);
  }

  public listFilterAgent(): Observable<ResponseEnvelope<MonitorFilterAgent[]>> {
    return this.getRequest(`${this.FILTER_AGENT_SERVICE_URL}`);
  }

  public createFilterAgent(obj: MonitorFilterAgent): Observable<any> {
    return this.postRequest(this.FILTER_AGENT_SERVICE_URL, obj);
  }

  public updateFilterAgent(obj: MonitorFilterAgent): Observable<ResponseEnvelope<MonitorFilterAgent>> {
    return this.putRequest(this.FILTER_AGENT_SERVICE_URL, obj);
  }

  public copyFilterAgent(obj: MonitorFilterAgent): Observable<ResponseEnvelope<MonitorFilterAgent>> {
    return this.postRequest(`${this.FILTER_AGENT_SERVICE_URL}/copy`, obj);
  }

  public listFilterDetails(monitorFilterAgentId?: string): Observable<ResponseEnvelope<MonitorFilterAgentDetail[]>> {
    return this.getRequest(`${this.FILTER_DETAIL_SERVICE_URL}?monitorFilterAgentId=${monitorFilterAgentId}`);
  }

  public listFilterDetailsWithFields(monitorFilterAgentId?: string): Observable<ResponseEnvelope<MonitorFilterDetail[]>> {
    return this.getRequest(`${this.FILTER_DETAIL_SERVICE_URL}/with-fields?monitorFilterAgentId=${monitorFilterAgentId}`)
  }

  public createOrUpdateFilterDetails(obj: MonitorFilterAgentDetail[], isUpdate: boolean): Observable<any> {
    return this.postRequest(`${this.FILTER_DETAIL_SERVICE_URL}?isUpdate=${isUpdate}`, obj);
  }

  public getFilterOption(monitorFilterId: string): Observable<ResponseEnvelope<MonitorFilterOption[]>> {
    return this.getRequest(`${this.FILTER_OPTION_SERVICE_URL}?monitorFilterId=${monitorFilterId}`);
  }

  public listFilterOptions(tableName: string): Observable<ResponseEnvelope<any>> {
    return this.getRequest(`${this.BASE_SERVICE_URL}/${tableName}`)
  }

  public listTicketFilterOptions(tableName: string): Observable<ResponseEnvelope<any>> {
    return this.getRequest(`${this.TICKET_BASE_SERVICE_URL}/${tableName}`)
  }
}
