import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {SERVICES} from "@env/environment";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {VoiceChannel} from "@core/models/voice/voice-channel/voice-channel.model";
import {TokenService} from "../../../init/token.service";
import {SCOPE} from "../../../app.constants";

@Injectable({providedIn: 'root'})
export class GroupService extends AbstractService {
    listScopes: string [] = [];
    constructor(private http: HttpClient,
                private authSvc: AuthService,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
        this.listScopes = TokenService.getListScopes('ccms-service');
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/keycloak-groups`;
    }
    public getGroups(): Observable<ResponseEnvelope<any>> {
        if (this.listScopes.includes(SCOPE.AGENT.MONITOR_AGENT_ALL_GROUP))
            return this.getRequest(`${this.SERVICE_URL}/agent-owner`);
        return this.getRequest(`${this.SERVICE_URL}/list`);
    }

    public getTopLevelGroups(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/top-level-list`);
    }

    getAllGroups(): Observable<any> {
        return this.getRequest(`${SERVICES.ACCOUNT_API.url}/api/v1/groups/all`);
    }
}
