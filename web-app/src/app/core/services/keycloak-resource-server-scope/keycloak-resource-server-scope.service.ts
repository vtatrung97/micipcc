import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {forkJoin, Observable, of} from "rxjs";
import {KEYCLOAK, SERVICES} from "@env/environment";
import {ResponseEnvelope} from "@core/models/response.model";
import {ToastService} from "@core/services/toast-service";
import {AbstractService} from "@core/services/abstract.service";
import {TranslateService} from "@ngx-translate/core";
import {catchError, map, switchMap} from "rxjs/operators";


@Injectable({providedIn: 'root'})
export class KeycloakResourceServerScopeService extends AbstractService {

    constructor(private http: HttpClient,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }


    get SERVICE_URL(): string {
      return `${SERVICES.ACCOUNT_API.url}/api/v1/keycloak-resource-server-scope`;
    }

    /**
   * get Tên hiển thị (displayName / Mô tả) của Scope
   * GET /api/v1/scopes/{id}
   * @param scopeId UUID của Scope trên Keycloak
   */
  getDetailScope(scopeId: string): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/${scopeId}`);
  }

  /**
   * Cập nhật Tên hiển thị (displayName / Mô tả) của Scope (Mục 3.1.4.2)
   * PUT /api/v1/scopes/{id}
   * @param scopeId UUID của Scope trên Keycloak
   * @param payload { clientId: string, displayName: string }
   */
  updateScope(scopeId: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.SERVICE_URL}/${scopeId}`, payload);
  }


}
