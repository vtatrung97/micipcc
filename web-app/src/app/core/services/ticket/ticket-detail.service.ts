import { Injectable } from "@angular/core";
import { AbstractService } from "../abstract.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AuthService } from "../auth/auth.service";
import { ToastService } from "../toast-service";
import { SERVICES } from "@env/environment";
import { Observable, of } from "rxjs";
import { TicketDetail, TicketDetailFilter } from "@core/models/ticket/ticket-detail.model";
import { ResponseEnvelope } from "@core/models/response.model";
import { FacebookCommentSendModel } from "@core/models/facebook/facebook-comment-send.model";
import { TranslateService } from "@ngx-translate/core";
import { MessageFetchDirection } from "@core/constant/ticket.enum";
import { TicketNote } from "@core/models/ticket/ticket-note.model";
import { FacebookStatusModel } from "@models/facebook/facebook-status.model";


@Injectable({ providedIn: 'root' })
export class TicketDetailService extends AbstractService {
    constructor(private http: HttpClient, private authSvc: AuthService, private toastSvc: ToastService, private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-details`;
    }

    get DETAIL_SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-detail`;
    }

    public getTicketDetail(ticketDetailId: string, requestTime: number): Observable<ResponseEnvelope<TicketDetail>> {
        return this.getRequest(`${this.DETAIL_SERVICE_URL}`, { params: { ticketDetailId, requestTime } });
    }

    public getTicketDetailElk(
        ticketId: string,
        channelId: number,
        length: number,
        start: number,
        requestTime: number,
        type: MessageFetchDirection,
        isNote?: number,
        supportChat?: boolean,
        databaseSync?: boolean
    ): Observable<ResponseEnvelope<TicketDetail[]>> {
        if (isNote) return this.getRequest(`${this.SERVICE_URL}/history`, {
            params: {
                ticketId,
                channelId,
                length,
                requestTime,
                type,
                start,
                isNote
            }
        });
        else return this.getRequest(`${this.SERVICE_URL}/history`, {
            params: {
                ticketId,
                channelId,
                length,
                requestTime,
                type,
                start,
                supportChat,
                databaseSync
            }
        });
    }

    public getAllTicketNotesElk(
        ticketId: string,
        channelId: number,
        length: number,
        start: number,
        requestTime: number | undefined,
        type: MessageFetchDirection,
        isNote?: number
    ): Observable<ResponseEnvelope<TicketDetail[]>> {
        return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-notes/all-by-supervisor`,
            { params: { ticketId, channelId, length, requestTime, type, start, isNote } });
    }

    public getThreadMail(confId: string): Observable<ResponseEnvelope<TicketDetail[]>> {
        return this.getRequest(`${this.SERVICE_URL}/thread-mail/${confId}`);
    }

    public getTicketDetailByTicketDetailId(ticketDetailId: string): Observable<ResponseEnvelope<TicketDetail[]>> {
        return this.getRequest(`${this.SERVICE_URL}/by-elk`, { params: { ticketDetailId } });
    }

    public getTicketDetailByComment(externalConfId: any, externalParentId: any, objectId: any, ticketDetailId: any, requestTime: any): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/comments`, {
            params: {
                externalConfId,
                externalParentId,
                objectId,
                ticketDetailId,
                requestTime
            }
        });
    }

    public getTicketDetailPostByComment(externalConfId: any): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/comments`, { params: { externalConfId } });
    }

    public getTicketDetailByPost(externalConfId: any): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/posts`, { params: { externalConfId } });
    }

    public getTicketDetailByContent(start: number, length: number, ticketDetail: TicketDetailFilter): Observable<any> {
        ticketDetail.start = start;
        ticketDetail.length = length;
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'ticketDetailFilterDTO', ticketDetail);
        // @ts-ignore
        return this.getRequest(`${this.SERVICE_URL}/by-elk`, { params: params });
    }

    public saveTicketDetailBySendComment(comment: FacebookCommentSendModel): Observable<any> {
        return this.postRequest(`${this.SERVICE_URL}/comments`, comment);
    }

    public saveTicketDetailBySendEmail(ticketDetailForm: TicketDetail): Observable<ResponseEnvelope<TicketDetail>> {
        return this.postRequest(`${this.SERVICE_URL}/emails`, ticketDetailForm);
    }

    public changeStatus(status: FacebookStatusModel): Observable<any> {
        return this.postRequest(`${this.SERVICE_URL}/change-social-status`, status);
    }

    public changeLike(status: FacebookStatusModel, isLike: Boolean): Observable<any> {
        return this.postRequest(`${this.SERVICE_URL}/change-like-status?isLike=${isLike}`, status)
    }

    public getTicketNotes(ticketId: any, agentId: any): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/notes?ticketId=${ticketId}&agentId=${agentId}`);
    }

    public saveTicketNote(ticketNote: TicketNote): Observable<any> {
        return this.postRequest(`${this.SERVICE_URL}/notes`, ticketNote);
    }

    public deleteTicketNote(ticketDetailId: string): Observable<any> {
        return this.deleteRequest(`${this.SERVICE_URL}/notes/${ticketDetailId}`);
    }

    updateTicketNote(ticketNote: any) {
        return this.putRequest(`${this.SERVICE_URL}/notes`, ticketNote)
    }

    ticketNegativeKeyword(id: any) {
        return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/tickets/${id}/multi-language`)
    }

    ticketDetailsFromTime(ticketId: string, channelId: number, requestTime: number) {
        return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-details/from-time`, {
            params: { ticketId, channelId, requestTime }
        });
    }
}
