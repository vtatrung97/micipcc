import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseEnvelope } from '@core/models/response.model';
import { AbstractService } from '@core/services/abstract.service';
import { AuthService } from '@core/services/auth/auth.service';
import { ToastService } from '@core/services/toast-service';
import { SERVICES } from '@env/environment';
import { WhatsappAccountConfig, WhatsappAccUpdateReq } from '@models/whatsapp-account/whatsapp-account-dto.model';
import { TranslateService } from '@ngx-translate/core';
import { WhatsappPageModel } from '@pages/settings/whatsapp-account/whatsapp-account-list/whatsapp-account-list.type';
import { Observable, Subject } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class WhatsappAccountService extends AbstractService {
  private actionTypeChange = new Subject<number>();

  actionTypeChange$ = this.actionTypeChange.asObservable();

  constructor(
    private http: HttpClient,
    private authSvc: AuthService,
    private toastSvc: ToastService,
    private translate: TranslateService
  ) {
    super(http, toastSvc, translate);
  }

  actionTypeChangeEvent(data: number) {
    this.actionTypeChange.next(data)
  }

  get SERVICE_URL(): string {
    return `${SERVICES.CHAT_SERVICE_API.url}/api/v1/whatsapp-account`;
  }

  public deleteAccounts(req: { ids: string[] }): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}/delete`, req);
  }
  public createAccount(req: WhatsappPageModel ): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}`, req);
  }
  public updateAccount(req: WhatsappPageModel ): Observable<ResponseEnvelope<any>> {
    return this.putRequest(`${this.SERVICE_URL}/${req.whatsappAccountId}`, req);
  }

  public callback(body: any): Observable<ResponseEnvelope<any>> {
    return this.getRequest(`${this.SERVICE_URL}/callback?code=${body.code}&redirectUri=${body.redirectUri}&wabaId=${body.wabaId}&phoneNumberId=${body.phoneNumberId}`);
  }

  public getById(businessId: string): Observable<ResponseEnvelope<any>> {
    return this.getRequest(`${this.SERVICE_URL}/${businessId}`);
  }

  public updateById(businessId: string, payload: WhatsappAccUpdateReq): Observable<ResponseEnvelope<any>> {
    return this.putRequest(`${this.SERVICE_URL}/${businessId}`, payload);
  }
}
