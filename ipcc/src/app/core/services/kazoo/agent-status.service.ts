import { map } from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import {AbstractKazooService} from './abstract-kazoo.service';
import {Observable} from 'rxjs';
import {KazooCbResponse} from '../../models/kazoo/kazoo-cb-response.model';
import {ToastService} from "@core/services/toast-service";
import {catchError} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";
import {CbAuthService} from "@core/services/auth/cb-auth.service";

@Injectable({providedIn: 'root'})
export class KazooAgentStatusService extends AbstractKazooService {

    constructor(private http: HttpClient,
                private authService: AuthService,
                private cbAuthSvc: CbAuthService,
                private toast: ToastService,
                private translate: TranslateService) {
        super(http, authService, toast, translate);
    }

    get SERVICE_URL(): string {
        return `${this.cbAuthSvc.crossbar}/v2/accounts/${this.authService.kzAccountId}/agents/${this.authService.userId}/status`;
    }

    public getAccountUsers(): Observable<KazooCbResponse> {
        return this.http.get<KazooCbResponse>(`${this.cbAuthSvc.crossbar}/v2/accounts/${this.authService.kzAccountId}/users`)
            .pipe(catchError(error => this.handleError(error)));
    }

    public getAgents(): Observable<KazooCbResponse> {
        return this.http.get<KazooCbResponse>(`${this.cbAuthSvc.crossbar}/v2/accounts/${this.authService.kzAccountId}/agents?paginate=false`)
            .pipe(catchError(error => this.handleError(error)));
    }

    public getAgentStatus(kzuid: string): Observable<KazooCbResponse> {
        return this.getRequest(`${this.cbAuthSvc.crossbar}/v2/accounts/${this.authService.kzAccountId}/agents/${kzuid}/status?full=true`, {}, true);
    }

    public _getAgentStatus(kzuid: string): Observable<KazooCbResponse> {
        return this.getRequest(`${this.cbAuthSvc.crossbar}/v2/accounts/${this.authService.kzAccountId}/agents/${kzuid}/status`);
    }

    public getAgentsStatus(): Observable<KazooCbResponse> {
        return this.http.get<KazooCbResponse>(`${this.cbAuthSvc.crossbar}/v2/accounts/${this.authService.kzAccountId}/agents/status?paginate=false`)
            .pipe(catchError(error => this.handleError(error)));
    }

    public login(agentId?: any): Observable<KazooCbResponse> {
        return this.changeStatus({status: 'login'}, agentId);
    }

    public logout(agentId?: any): Observable<KazooCbResponse> {
        return this.changeStatus({status: 'logout'}, agentId);
    }

    public pause(agentId?: any): Observable<KazooCbResponse> {
        return this.changeStatus({status: 'pause', timeout: 300}, agentId);
    }

    public resume(agentId?: any): Observable<KazooCbResponse> {
        return this.changeStatus({status: 'resume'}, agentId);
    }

    public changeStatus(object: any, agentId?: any): Observable<KazooCbResponse> {
        if (!agentId) {
            return this.http.post<KazooCbResponse>(`${this.SERVICE_URL}`, JSON.stringify({data: object}))
                .pipe(catchError(error => this.handleError(error)));
        } else {
            return this.http.post<KazooCbResponse>(`${this.cbAuthSvc.crossbar}/v2/accounts/${this.authService.kzAccountId}/agents/${agentId}/status`
                , JSON.stringify({data: object})).pipe(catchError(error => this.handleError(error)));
        }
    }

    public loginToQueue(queueId: any) {
        const obj = {'action': 'login', 'queue_id': queueId};
        return this.http.post(`${this.cbAuthSvc.crossbar}/v2/accounts/${this.authService.kzAccountId}/agents/${this.authService.userId}/queue_status`,
            JSON.stringify({data: obj})).pipe(catchError(error => this.handleError(error)));
    }
}
