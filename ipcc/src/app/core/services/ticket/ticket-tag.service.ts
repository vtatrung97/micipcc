import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ToastService } from "@core/services/toast-service";
import { Observable, of } from "rxjs";
import { SERVICES } from "@env/environment";
import { AbstractService } from "@core/services/abstract.service";
import { TranslateService } from "@ngx-translate/core";
import { DatatablesResponse, ResponseEnvelope } from "@core/models/response.model";
import { TicketTag } from "@models/ticket/ticket-tag.model";


@Injectable({ providedIn: 'root' })
export class TicketTagService extends AbstractService {

  constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService) {
    super(http, toastSv, translate);
  }

  get SERVICE_URL(): string {
    return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-tags`;
  }

  public getListTicketTag(): Observable<ResponseEnvelope<TicketTag[]>> {
    return this.getRequest(this.SERVICE_URL);
  }

  public createOrUpdateTicketTags(tag: TicketTag): Observable<any> {
    return this.postRequest(this.SERVICE_URL + '/ticket', tag);
  }

  public getListTicketTagByChannel(params: any): Observable<any> {
      return this.getRequest(this.SERVICE_URL + '/by-channel-id', {params: params});
  }

  public getTicketRole(): Observable<any> {
    return this.getRequest(this.SERVICE_URL + '/role');
  }

  public getListTicketTagBySource(params: any): Observable<any> {
    return this.getRequest(this.SERVICE_URL + '/by-source', {params: params});
  }

  public checkTicketTagRole(): Observable<any> {
    return this.getRequest(this.SERVICE_URL + '/is-supervisor');
  }
}
