import {AbstractService} from "@core/services/abstract.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {SERVICES} from "@env/environment";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {Injectable} from "@angular/core";
import {AgentAlert} from "@core/models/status-alert/agent-alert.model";
@Injectable({ providedIn: 'root' })
export class AgentAlertService extends AbstractService {
  constructor(
    private http: HttpClient,
    private authSvc: AuthService,
    private toastSvc: ToastService,
    private translateSvc: TranslateService
  ) {
    super(http, toastSvc, translateSvc);
  }

  get SERVICE_URL(): string {
    return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/agent-alert`;
  }

  public ajax() {
    return `${this.SERVICE_URL}/ajax`;
  }

  public kpiFail(dto: AgentAlert) {
    return this.postRequest(`${this.SERVICE_URL}/kpi-fail`, dto);
  }

  public insertAlert(alert: AgentAlert): Observable<ResponseEnvelope<AgentAlert>> {
    return this.postRequest(this.SERVICE_URL, alert);
  }
}
