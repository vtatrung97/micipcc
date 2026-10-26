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
export class StatusAlertService extends AbstractService {
  constructor(
    private http: HttpClient,
    private authSvc: AuthService,
    private toastSvc: ToastService,
    private translateSvc: TranslateService,
    private stomp: AgentServerStompService
  ) {
    super(http, toastSvc, translateSvc);
  }

  public publishAlert(data: AlertAnnouncement) {
      this.stomp.send(`/app/alert.agent-status`, data);
  }

  public publishConfig(kzAccountId: string) {
    this.stomp.send(`/app/alert.agent-status.config-updated`, {kzAccountId: kzAccountId});
  }

  get SERVICE_URL(): string {
    return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/status-alert`;
  }

  public ajax(): string {
    return this.SERVICE_URL;
  }

  public getGlobalConfigs(): Observable<ResponseEnvelope<StatusAlert[]>> {
    return this.getRequest(`${this.SERVICE_URL}/global`);
  }

  public addAlert(object: any) {
    return this.postRequest(this.SERVICE_URL, object);
  }

  public editAlert(id: string, object: any) {
    return this.putRequest(`${this.SERVICE_URL}/${id}`, object);
  }

  public deleteAlerts(object: any): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}/delete`, object);
  }
}
