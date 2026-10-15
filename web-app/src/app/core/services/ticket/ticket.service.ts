import {Injectable} from "@angular/core";
import {AbstractService} from "../abstract.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "../auth/auth.service";
import {Observable} from "rxjs";
import {ChatServerRequest, DatatablesResponse, ResponseEnvelope} from "@core/models/response.model";
import {ToastService} from "../toast-service";
import {Ticket, TicketFilterForm} from "@core/models/ticket/ticket.model";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";
import {TicketHistoryForm} from "@core/models/ticket/ticket-history-dto.model";
import * as qs from "qs";
import {AgentTicketEvent, TicketMonitorFilterForm} from "@core/models/monitor/agent-monitor.model";
import {TicketUpdate} from "@models/ticket/ticket-update.model";
import {
    QueueTicketEvent,
    QueueTicketMissEvent,
    TicketQueueMonitorFilterForm
} from "@core/models/monitor/queue-monitor.model";
import {CloseTicketResponse} from "@models/ticket/close-ticket-response.model";
import {TokenService} from "../../../init/token.service";
import {SCOPE} from "../../../app.constants";
import { TicketSourceModel } from "@core/models/ticket/ticket-source.model";
import {CreateTicketEmailModel} from "@core/models/ticket/create-ticket-email.model";
import {TicketBccsInfo} from "@models/ticket/ticket-bccs-info.model";

@Injectable({ providedIn: 'root' })
export class TicketService extends AbstractService {
    listTicketScopes: string [] = [];
    constructor(private http: HttpClient, private authSvc: AuthService, private toastSvc: ToastService, private translate: TranslateService, private tokenService: TokenService) {
        super(http, toastSvc, translate);
        this.listTicketScopes = TokenService.getListScopes('ticket-service');
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/tickets`;
    }

    get GET_TICKET_SEARCH_BY_CUSTOMER_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/tickets/history/ticket-search-by-customer`;
    }

    get GET_CUSTOMER_PERIOD_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/tickets/history/by-customer-in-period`;
    }

    get AI_SUGGEST_SETTINGS_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/suggest-ai/settings`;
    }

    public agentLeaveMsg(message: ChatServerRequest): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/agent-leave-cmb-msg`, message);
    }

    public getAiSuggestionSetting(): Observable<any> {
        return this.getRequest(this.AI_SUGGEST_SETTINGS_URL);
    }

    public updateAiSuggestionSetting(enabled: boolean): Observable<any> {
        return this.putRequest(this.AI_SUGGEST_SETTINGS_URL, { enabled });
    }

    get GET_TICKET_URL(): string {
        if (this.listTicketScopes.includes(SCOPE.TICKET.VIEW_ALL_TICKET))
            return `${this.SERVICE_URL}/by-elk`;
        else if (this.listTicketScopes.includes(SCOPE.TICKET.VIEW_TICKET_SUPERVISOR))
            return `${this.SERVICE_URL}/by-elk-queues`;
        else if (this.listTicketScopes.includes(SCOPE.TICKET.VIEW_TICKET_ASSIGNED))
            return `${this.SERVICE_URL}/by-elk-assigned`;
        return '';
    }

    get GET_TICKET_URL_V2(): string {
        return `${this.SERVICE_URL}/by-elk`;
    }

    public getListQueueSupervisor(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/report-by-supervisor`);
    }

    public getTicket(): Observable<ResponseEnvelope<Ticket[]>> {
        return this.getRequest(this.SERVICE_URL);
    }

    public getTicketById(ticketId: string): Observable<ResponseEnvelope<Ticket>> {
        return this.getRequest(`${this.SERVICE_URL}/${ticketId}`);
    }

    public getTicketByIdAndRequestTime(ticketId: string, requestTime: number): Observable<ResponseEnvelope<Ticket>> {
        return this.getRequest(`${this.SERVICE_URL}/${ticketId}/index?requestTime=${requestTime}`);
    }

    public isTicketValidToUpdate(ticketId: string, requestTime: number, version: number): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/${ticketId}/can-update?requestTime=${requestTime}&version=${version}`);
    }

    public createTicketMail(createMail: CreateTicketEmailModel): Observable<any> {
        return this.postRequest(`${this.SERVICE_URL}/email`, createMail);
    }

    public updateTicket(ticket: TicketUpdate): Observable<any> {
        return this.putRequest(`${this.SERVICE_URL}`, ticket);
    }

    public getListHistoryTicketByCustomerId(param: TicketHistoryForm): Observable<ResponseEnvelope<Ticket[]>> {
        return this.getRequest(`${this.SERVICE_URL}/history`, {params: param});
    }

    public getListHistoryTicketByCustomerIdWithoutPaging(param: {requestTimeFrom: number,requestTimeTo: number,customerId: string, userId?: string}): Observable<ResponseEnvelope<Ticket[]>> {
        return this.getRequest(`${this.SERVICE_URL}/history/all`, {params: param});
    }

    public getTotalTicketToMonitorAgent(param: TicketMonitorFilterForm): Observable<ResponseEnvelope<AgentTicketEvent[]>> {
        return this.getRequest(`${this.SERVICE_URL}/monitor-agent-queue`, {params: param});
    }

    public getTotalTicketToMonitorQueue(param: TicketQueueMonitorFilterForm): Observable<ResponseEnvelope<QueueTicketEvent[]>> {
        return this.getRequest(`${this.SERVICE_URL}/monitor-queue`, {params: param});
    }
    public getTotalTicketMissToMonitorQueue(param: TicketQueueMonitorFilterForm): Observable<ResponseEnvelope<QueueTicketMissEvent[]>> {
        return this.getRequest(`${this.SERVICE_URL}/monitor-queue/ticket-missed`, {params: param});
    }

    public getListTicket( start?: number, length?: number, param?: TicketFilterForm): Observable<ResponseEnvelope<DatatablesResponse<Ticket>>> {
        let paramsQs: HttpParams;
        paramsQs = new HttpParams({fromString: qs.stringify({...param, start, length})});

        return this.getRequest(`${this.GET_TICKET_URL}`, {params: paramsQs});
    }

    public getListTicketV2( start?: number, length?: number, param?: TicketFilterForm): Observable<ResponseEnvelope<DatatablesResponse<Ticket>>> {
        let paramsQs: HttpParams;
        paramsQs = new HttpParams({fromString: qs.stringify({...param, start, length})});

        return this.getRequest(`${this.GET_TICKET_URL_V2 + '-v2'}`, {params: paramsQs});
    }

    // public getTicketByIdElk(ticketId: string): Observable<ResponseEnvelope<DatatablesResponse<Ticket>>> {
    //     const paramsQs = new HttpParams({fromString: qs.stringify({ticketId, start: 0, length:1})});
    //     return this.getRequest(`${this.GET_TICKET_URL}`, {params: paramsQs});
    // }

    public getTicketByIdElk(ticketId: string): Observable<ResponseEnvelope<Ticket>> {
        return this.getRequest(`${this.SERVICE_URL}/by-id/${ticketId}`);
    }


    public getTicketByCallId(callId: string): Observable<ResponseEnvelope<Ticket>> {
        return this.getRequest(`${this.SERVICE_URL}/byCallId/${callId}`);
    }

    public getListReplyTemplate(param: TicketMonitorFilterForm): Observable<ResponseEnvelope<AgentTicketEvent[]>> {
        return this.getRequest(`${this.SERVICE_URL}/reply-templates`, {params: param});
    }

    public getListReplyTemplateDetail(param: TicketMonitorFilterForm): Observable<ResponseEnvelope<AgentTicketEvent[]>> {
        return this.getRequest(`${this.SERVICE_URL}/reply-templates-detail`, {params: param});
    }

    public closeTickets(params: any): Observable<ResponseEnvelope<CloseTicketResponse>> {
        return this.putRequest(`${this.SERVICE_URL}/close`, params);
    }

    public getTicketSources(): Observable<ResponseEnvelope<TicketSourceModel[]>> {
        return this.getRequest(`${this.SERVICE_URL}/sources`);
    }

    public getTicketHistoryByCustomer(params: any): Observable<any> {
        const paramsQs = new HttpParams({fromString: qs.stringify({...params,})});
        return this.getRequest(`${this.SERVICE_URL}/history/by-customer-in-period`, {params: paramsQs});
    }

    public readTicket(ticketId: string): Observable<ResponseEnvelope<any>> {
        return this.putRequest(`${this.SERVICE_URL}/${ticketId}/user-reads`)
    }

    // public getTotalNotes(ticketId: string): Observable<any> {
    //     return this.getRequest(`${this.SERVICE_URL}/count-notes/${ticketId}`);
    // }

    public getTotalNotes(ticketId: string): Observable<any> {
        return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-notes/count-notes/${ticketId}`);
    }

    public getTotalAllNotes(ticketId: string): Observable<any> {
        return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-notes/count-notes/for-supervisor/${ticketId}`);
    }

    public getTicketAssignByTicketId(ticketId: string, requestTime: number): Observable<any> {
        return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-assign/${ticketId}/${requestTime}`);
    }

    // #region Create Request Support From Ticket
    actionCreateRequestSupport(request: any): Observable<any> {
        return this.postRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-request-support`, request);
    }

    actionAcceptRequestSupport(ticketSupportId: any, request: any): Observable<any> {
        return this.putRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-request-support/accept`, request);
    }

    actionDeclineRequestSupport(ticketSupportId: any, request: any): Observable<any> {
        return this.putRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-request-support/${ticketSupportId}/accept`, request);
    }
    // #endregion

    ticketSpecialEmail(id: any, requestTime?: any) {
        return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/tickets/${id}/multi-languages/special-emails?RequestTime=${requestTime}`)
    }

    getTicketByMissCall(caller: any, callee: any, cb_session_id: any  ) {
        return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/tickets/ticket-miss-callback?caller=${caller}&callee=${callee}&cb_session_id=${cb_session_id}`)
    }

    actionReplyRequestSupport(request: any): Observable<any> {
        return this.postRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-request-support/reply`, request);
    }

    exportTicket(filter: any): Observable<any> {
        return this.http.get(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/tickets/export/by-elk`, {params: filter, responseType: 'json'})
    }

    getLinkBCCS(customerCode: any, queueId: any) {
        return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/tickets/format-route?customerCode=${encodeURIComponent(customerCode)}&queueId=${encodeURIComponent(queueId)}&routeTo=1`)
    }

    getKeywordAlert(ticket: Ticket): Observable<string[]>{
        return this.postRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-detail/keyword-alert`, ticket);
    }

    getParameterSetByTicket(ticketId: string): Observable<any> {
        return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/param-set/param-ticket?ticket-id=${ticketId}`);
    }

    getConversationByTicket(ticketId: string): Observable<any> {
        return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/tickets/conversation?ticketId=${ticketId}`);
    }

    getReasonTicket(ticketId: string): Observable<any> {
        return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-reason-detail/${ticketId}`);
    }

    checkBotChat(ticketId: string): Observable<any> {
        return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/tickets/${ticketId}/is-bot`);
    }

    getBccsMappingBySourceId(sourceId: string | undefined, customerCode: string) {
        return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/bccs-mapping/by-sourceid/${sourceId}?customerCode=${customerCode}`);
    }

    /** Dữ liệu BCCS của ticket, chỉ gọi khi ticket thuộc nguồn BCCS */
    getTicketBccsInfo(ticketId: string, requestTime: number): Observable<ResponseEnvelope<TicketBccsInfo>> {
        return this.getRequest(`${this.SERVICE_URL}/${ticketId}/bccs-info?requestTime=${requestTime}`);
    }

    getCallBackScheduleCheck(ticketId: string, requestTime: any) {
        return this.getRequest(`${this.SERVICE_URL}/${ticketId}/callback/reschedule/precheck?requestTime=${requestTime}`);
    }

    createScheduleCallBack(ticketId: string,request: any): Observable<any> {
        return this.postRequest(`${this.SERVICE_URL}/${ticketId}/reschedule-callback`, request);
    }

    getCustomerInfo(ticketId: string) {
        return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/customers/synchronized-info/${ticketId}`);
    }
}

