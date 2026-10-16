import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {Observable} from "rxjs";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";
import {ResponseEnvelope} from "@core/models/response.model";
import { TransactionFilterParams } from "@models/monitor/transaction-monitor.model";
import * as qs from "qs";
import {TokenService} from "../../../init/token.service";
import {SCOPE} from "../../../app.constants";

@Injectable({providedIn: 'root'})
export class TransactionMonitorService extends AbstractService {
  listTicketScopes: string [] = [];
  constructor(private http: HttpClient,
              private authSvc: AuthService,
              private toastSvc: ToastService,
              private translate: TranslateService) {
    super(http, toastSvc, translate);
    this.listTicketScopes = TokenService.getListScopes('ticket-service')
  }

  get SERVICE_URL(): string {
    return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/tickets`;
  }

  public getTicketMonitors(param: TransactionFilterParams): Observable<ResponseEnvelope<any>> {
    let paramsQs: HttpParams;
    paramsQs = new HttpParams({fromString: qs.stringify({...param})})
    return this.getRequest( `${this.SERVICE_URL}/monitor-ticket`,{params: paramsQs});
  }

  ticketMonitorsAjax(): string {
    if (this.listTicketScopes.includes(SCOPE.TICKET.MONITOR_ALL_TICKET))
      return `${this.SERVICE_URL}/monitor-ticket-v2`;
    else if (this.listTicketScopes.includes(SCOPE.TICKET.MONITOR_TICKET_SUPERVISOR))
      return `${this.SERVICE_URL}/monitor-ticket-supervisor`;
    else return '';
  }
}
