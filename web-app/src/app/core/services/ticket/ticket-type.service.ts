import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ToastService} from "@core/services/toast-service";
import {Observable} from "rxjs";
import {SERVICES} from "@env/environment";
import {AbstractService} from "@core/services/abstract.service";
import {TranslateService} from "@ngx-translate/core";
import {ResponseEnvelope} from "@core/models/response.model";


@Injectable({providedIn: 'root'})
export class TicketTypeService extends AbstractService {

    constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService) {
        super(http, toastSv, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-types`;
    }

    get SERVICE_CALL_BOT_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}`;
    }

    public getTicketType(ticketTypeId: string): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/${ticketTypeId}`);
    }

    public getListChildrenTicketType(parentId: string): Observable<any> {
        const params: any = {};
        params.parentId = parentId;
        return this.getRequest(`${this.SERVICE_URL}/children-new`, { params });
    }

    public getAllTicketTypeLevels(): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/levels`);
    }

    public getListParentTicketType(sourceId?: string, channelId?: number): Observable<any> {
        const params: any = {};
        params.groupId = localStorage.getItem('selectedServiceOwner');
        if (sourceId != null) params.sourceId = sourceId;
        if (channelId != null) params.channelId = channelId.toString();
        return this.getRequest(`${this.SERVICE_URL}/parents-new`, { params });
    }

    public getListTicketTypeNew(sourceId?: string, channelId?: number, level?: number): Observable<any> {
        const params: any = {};
         params.groupId = localStorage.getItem('selectedServiceOwner');
         if (sourceId != null) params.sourceId = sourceId;
         if (channelId != null) params.channelId = channelId.toString();
        return this.getRequest(`${this.SERVICE_URL}/new-v2`, { params });
    }

    public getLevelOneTicketTypes(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/level-1`)
    }

    public getLevelTwoTicketTypes(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/level-2`)
    }

    public getLevelThreeTicketTypes(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/level-3`)
    }

    public getLevelFourTicketTypes(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/level-4`)
    }

    public getLevelFiveTicketTypes(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/level-5`)
    }

    public getListTicketTypeByParents(parents: string[]): Observable<any> {
        const params: any = {};
         if (parents != null) params.parents = parents;
        return this.getRequest(`${this.SERVICE_URL}/children-by-parent`, { params });
    }

    public getDataCallBot(ticketId: string): Observable<any> {
        const params: any = {};
         if (ticketId != null) params.ticket_id = ticketId;
        return this.getRequest(`${this.SERVICE_CALL_BOT_URL}/api/v1/call-bot/predict`, { params });
    }

    public isCallBot(ticketId: string): Observable<any> {
        const params: any = {};
         if (ticketId != null) params.ticket_id = ticketId;
        return this.getRequest(`${this.SERVICE_CALL_BOT_URL}/api/v1/is-call-bot`, { params });
    }
}
