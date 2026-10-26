import {AbstractService} from "@core/services/abstract.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {SERVICES} from "@env/environment";
import {Observable, Subject} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {AlertAnnouncement, StatusAlert} from "@core/models/status-alert/status-alert.model";
import {Injectable} from "@angular/core";
import {AgentServerStompService} from "@core/services/rx-stomp/agent-server/agent-server-stomp.service";
@Injectable({ providedIn: 'root' })
export class SourceBotService extends AbstractService {
  constructor(
    private http: HttpClient,
    private authSvc: AuthService,
    private toastSvc: ToastService,
    private translateSvc: TranslateService,
    private stomp: AgentServerStompService
  ) {
    super(http, toastSvc, translateSvc);
  }


  get SERVICE_URL(): string {
    return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/source-bot`;
  }

  public ajax(): string {
    return this.SERVICE_URL;
  }

  public getSourceBot(): Observable<ResponseEnvelope<StatusAlert[]>> {
    return this.getRequest(`${this.SERVICE_URL}`);
  }

  public addSourceBot(object: any) {
    return this.postRequest(this.SERVICE_URL, object);
  }

  public deleteSourceBot(object: any): Observable<ResponseEnvelope<any>> {
    return this.deleteRequest(`${this.SERVICE_URL}`, object);
  }
}
