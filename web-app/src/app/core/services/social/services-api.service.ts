import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from "rxjs";
import {SERVICES} from "@env/environment";
import {ResponseEnvelope} from "@core/models/response.model";
import {ToastService} from "@core/services/toast-service";
import {AbstractService} from "@core/services/abstract.service";
import {Service} from "@models/chat/service.model";
import {catchError} from "rxjs/operators";
import {AuthService} from "@core/services/auth/auth.service";
import {TranslateService} from "@ngx-translate/core";


@Injectable({ providedIn: 'root' })
export class ServicesApiService extends AbstractService {

  constructor(private http: HttpClient,
              private authService: AuthService,
              private toastSvc: ToastService,
              private translate: TranslateService) {
    super(http, toastSvc, translate);
  }

  get SERVICE_URL(): string {
    return `${SERVICES.CHAT_SERVICE_API.url}/api/v1/services`;
  }

  listServicesAjax(domainId: string): string {
    return `${this.SERVICE_URL}?domainId=${domainId}`;
  }

  getAllService(): Observable<ResponseEnvelope<any>> {
    return this.getRequest(`${this.SERVICE_URL}/all`)
  }

  createService(object: Service): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}`, object)
  }

  updateService(serviceId: string, service: any): Observable<ResponseEnvelope<any>> {
    return this.putRequest(`${this.SERVICE_URL}/${serviceId}`, service)
  }

  deleteServices(object: any): Observable<ResponseEnvelope<any>> {
    return this.putRequest(`${this.SERVICE_URL}`, object)
  }
  getChannelSource(channelId?: number, serviceCode?: string): Observable<ResponseEnvelope<any>> {
    return this.getRequest(`${this.SERVICE_URL}/socials/${channelId}?serviceCode=${serviceCode}`)
  }
}
