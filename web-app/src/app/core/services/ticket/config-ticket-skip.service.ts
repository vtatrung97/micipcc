import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseEnvelope } from '@core/models/response.model';
import { AbstractService } from '@core/services/abstract.service';
import { AuthService } from '@core/services/auth/auth.service';
import { ToastService } from '@core/services/toast-service';
import { SERVICES } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { TicketSkipConfigPageModel } from '@pages/settings/config-ticket-skip-permissions/config-ticket-skip-permissions-list/config-ticket-skip-permissions-list.type';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class ConfigTicketSkipService extends AbstractService {
  constructor(
    private http: HttpClient,
    private authSvc: AuthService,
    private toastSvc: ToastService,
    private translate: TranslateService
  ) {
    super(http, toastSvc, translate);
  }

  get SERVICE_URL(): string {
    return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/skip-ticket-config`;
  }
  public deleteAgent(req: { ids: string[] }): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}/delete`, req);
  }
  public create(req: TicketSkipConfigPageModel ): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}`, req);
  }
}
