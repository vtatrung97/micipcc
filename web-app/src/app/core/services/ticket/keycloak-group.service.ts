import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {SERVICES} from "@env/environment";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {KeycloakGroup} from "@models/ticket/keycloak-group.model";

@Injectable({providedIn: 'root'})
export class KeycloakGroupService extends AbstractService {
  constructor(
    private http: HttpClient,
    private authSvc: AuthService,
    private toastSvc: ToastService,
    private translateSvc: TranslateService
  ) {
    super(http, toastSvc, translateSvc);
  }

  get SERVICE_URL(): string {
    return `${SERVICES.ACCOUNT_API.url}/api/v1/groups`;
  }

  get SERVICE_URL_CCMS(): string {
    return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/keycloak-groups`;
  }

  public getGroups(): Observable<ResponseEnvelope<KeycloakGroup[]>> {
    return this.getRequest(`${this.SERVICE_URL}`);
  }

  public getGroupsForMonitor(selectedGroupId: string): Observable<ResponseEnvelope<KeycloakGroup[]>> {
    let httpParam = new HttpParams()
    httpParam = this.buildHttpParams(httpParam, "groupId", selectedGroupId)
    return this.getRequest(this.SERVICE_URL + "/for-monitor", {params: httpParam});
  }

  public getGroupsInRealm(): Observable<ResponseEnvelope<KeycloakGroup[]>> {
    return this.getRequest(`${this.SERVICE_URL}/all`);
  }

  public getGroupAgentOwner(): Observable<ResponseEnvelope<KeycloakGroup[]>> {
    return this.getRequest(this.SERVICE_URL_CCMS + "/agent-owner");
  }
}
