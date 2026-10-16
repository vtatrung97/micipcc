import { Injectable } from '@angular/core';
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {SERVICES} from "@env/environment";

@Injectable({
  providedIn: 'root'
})
export class CallbotService extends AbstractService {
  constructor(private http: HttpClient,
              private authSvc: AuthService,
              private toastSvc: ToastService,
              private translate: TranslateService) {
    super(http, toastSvc, translate);
  }

  get SERVICE_URL(): string {
    // return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/customer-rank-vip`;
    return `assets/demo-data/callbot-management.json`
  }

  get CAMPAIGN_URL(): string {
    return `${SERVICES.CAMPAIGN_SERVICE_API.url}/api/v1`;
  }
}
