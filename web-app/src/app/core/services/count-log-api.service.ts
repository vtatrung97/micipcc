import { Injectable } from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {SERVICES} from "@env/environment";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import { Observable } from "rxjs";
import { finalize, shareReplay } from "rxjs/operators";

@Injectable({
    providedIn: "root",
})
export class CountLogApiService extends AbstractService {
    constructor(
        private http: HttpClient,
        private authSvc: AuthService,
        private toastSvc: ToastService,
        private translateSvc: TranslateService
    ) {
        super(http, toastSvc, translateSvc);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CHAT_SERVICE_API.url}/public/api/v1/count-log-api`;
    }
    private logFeature$?: Observable<any>;

    public logFeature(featureName: string, body?: any) {
      if (!this.logFeature$) {
        this.logFeature$ = this.postRequest(
          `${this.SERVICE_URL}/${featureName}`,
          body ?? null
        ).pipe(
          shareReplay(1),
          finalize(() => this.logFeature$ = undefined)
        );
      }

      return this.logFeature$;
    }
}
