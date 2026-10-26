import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {SERVICES} from "@env/environment";
import {Observable, Subject} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {TicketFilterAgent} from "@models/ticket/ticket-filter-agent.model";
import {TicketFilterAgentDetail} from "@models/ticket/ticket-filter-agent-detail.model";
import {TicketFilter} from "@models/ticket/ticket-filter.model";
import {TicketFilterOption} from "@models/ticket/ticket-filter-option.model";
import {TranslateService} from "@ngx-translate/core";
import { TicketFilterDetail } from "@models/ticket/ticket-filter-detail.model";
import {CookieService} from "ngx-cookie-service";
import {TicketFilterUpdateType} from "@core/constant/ticket.enum";
import {TicketFilterChannel} from "@models/ticket/ticket-filter-channel.model";

@Injectable({providedIn: 'root'})
export class TicketFilterService extends AbstractService {

  private bindFilterSrc = new Subject<{type: string, name: string, value: any, prechecked: boolean ,ignoreBind?:boolean}>();
  bindFilter$ = this.bindFilterSrc.asObservable();
  announceBindFilter(data: {type: string, name: string, value: any, prechecked: boolean, ignoreBind?:boolean}) {
    this.bindFilterSrc.next(data);
  }

  private leftFilterListBarChangedSrc = new Subject<boolean>();
  leftFilterListBarChanged$ = this.leftFilterListBarChangedSrc.asObservable();
  announceLeftFilterListBarChanged(show: boolean) {
    this.leftFilterListBarChangedSrc.next(show);
  }

  private filterHasUpdatedActionsSrc = new Subject<{type: TicketFilterUpdateType, obj: any}>();
  filterHasUpdatedActions$ = this.filterHasUpdatedActionsSrc.asObservable();
  announceFilterHasUpdatedActions(type: TicketFilterUpdateType, obj: any) {
    this.filterHasUpdatedActionsSrc.next({type: type, obj: obj});
  }

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private toast: ToastService,
    private translate: TranslateService,
    private cookieSvc: CookieService) {
    super(http, toast, translate);
  }

  get BASE_SERVICE_URL(): string {
    return `${SERVICES.TICKET_SERVICE_API.url}/api/v1`
  }

  get SERVICE_URL(): string {
    return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-filters`;
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

  get FILTER_CHANNEL_SERVICE_URL(): string {
    return `${this.SERVICE_URL}/filter-channels`
  }

  public listAllFilter(tableName: string): Observable<ResponseEnvelope<TicketFilter[]>> {
    return this.getRequest(`${this.SERVICE_URL}/default?tableName=${tableName}`);
  }

  public listFilter(tableName: string, channelIds?: number[]): Observable<ResponseEnvelope<TicketFilter[]>> {
    return this.getRequest(`${this.SERVICE_URL}?tableName=${tableName}` + (channelIds ? `&channelIds=${channelIds}` : ''));
  }

  public listFilterById(ids: string[], channelIds?: number[]): Observable<ResponseEnvelope<TicketFilter[]>> {
    if (!channelIds) {
      return this.postRequest(`${this.SERVICE_URL}/by-ids`, ids);
    } else {
      return this.postRequest(`${this.SERVICE_URL}/by-ids-with-channels?channelIds=${channelIds}`, ids);
    }
  }

  public listFilterAgent(): Observable<ResponseEnvelope<TicketFilterAgent[]>> {
    return this.getRequest(`${this.FILTER_AGENT_SERVICE_URL}`);
  }

  public createFilterAgent(obj: TicketFilterAgent): Observable<any> {
    return this.postRequest(this.FILTER_AGENT_SERVICE_URL, obj);
  }

  public updateFilterAgent(obj: TicketFilterAgent): Observable<ResponseEnvelope<TicketFilterAgent>> {
    return this.putRequest(this.FILTER_AGENT_SERVICE_URL, obj);
  }

  public copyFilterAgent(obj: TicketFilterAgent): Observable<ResponseEnvelope<TicketFilterAgent>> {
    return this.postRequest(`${this.FILTER_AGENT_SERVICE_URL}/copy`, obj);
  }

  public listFilterDetails(ticketFilterAgentId?: string): Observable<ResponseEnvelope<TicketFilterAgentDetail[]>> {
    return this.getRequest(`${this.FILTER_DETAIL_SERVICE_URL}?ticketFilterAgentId=${ticketFilterAgentId}`);
  }

  public listFilterDetailsWithFields(ticketFilterAgentId?: string): Observable<ResponseEnvelope<TicketFilterDetail[]>> {
    return this.getRequest(`${this.FILTER_DETAIL_SERVICE_URL}/with-fields?ticketFilterAgentId=${ticketFilterAgentId}`)
  }

  public createOrUpdateFilterDetails(obj: TicketFilterAgentDetail[], isUpdate: boolean): Observable<any> {
    return this.postRequest(`${this.FILTER_DETAIL_SERVICE_URL}?isUpdate=${isUpdate}`, obj);
  }

  public getFilterOption(ticketFilterId: string): Observable<ResponseEnvelope<TicketFilterOption[]>> {
    return this.getRequest(`${this.FILTER_OPTION_SERVICE_URL}?ticketFilterId=${ticketFilterId}`);
  }

  public listFilterOptions(tableName: string, parentIds?: string[]): Observable<ResponseEnvelope<any>> {
    return this.getRequest(`${this.BASE_SERVICE_URL}/${tableName}`);
  }

  public listCustomFilterOptions(ticketFilterOptionId: string): Observable<ResponseEnvelope<any>> {
    return this.getRequest(`${this.FILTER_OPTION_SERVICE_URL}/custom?ticketFilterOptionId=${ticketFilterOptionId}&locale=${this.cookieSvc.get('lang')}`);
  }

  public listFilterChannels(channelIds?: number): Observable<ResponseEnvelope<TicketFilterChannel[]>> {
    return this.getRequest(`${this.FILTER_CHANNEL_SERVICE_URL}?channelIds=${channelIds ?? ''}`);
  }

  public listFilterTicketTag(): Observable<any> {
      return this.getRequest(`${this.BASE_SERVICE_URL}/ticket-tags/filters`);
  }

  public getRangeTimeByType(type:any,current?:any): Observable<ResponseEnvelope<any>> {
    return this.getRequest(`${this.BASE_SERVICE_URL}/time-range?type=${type}&current=${current?current:''}`)
  }

  public checkIsAgent(): Observable<any> {
    return this.getRequest(this.BASE_SERVICE_URL + '/tickets/is-agent');
  }
}
