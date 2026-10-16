import { Injectable } from "@angular/core";
import {HttpClient} from "@angular/common/http";
import { ToastService } from "@core/services/toast-service";
import { Observable } from "rxjs";
import { SERVICES } from "@env/environment";
import { AbstractService } from "@core/services/abstract.service";
import { TranslateService } from "@ngx-translate/core";
import { ResponseEnvelope } from "@core/models/response.model";
import { AuthService } from "../auth/auth.service";
import {TicketQueue} from "@models/ticket/ticket-queue.model";


@Injectable({ providedIn: 'root' })
export class TicketQueueService extends AbstractService {

  constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService, private authService: AuthService,) {
    super(http, toastSv, translate);
  }

  get SERVICE_URL(): string {
    return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-queues`;
  }

  public getByProps(ticketId: string, channelId: number, realmName: string): Observable<ResponseEnvelope<TicketQueue[]>> {
    return this.getRequest(`${this.SERVICE_URL}?ticketId=${ticketId}&channelId=${channelId}&realmName=${realmName}`)
  }
}
