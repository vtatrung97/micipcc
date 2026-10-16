import {Injectable} from '@angular/core';
import { map } from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import {AbstractKazooService} from './abstract-kazoo.service';
import {Observable} from "rxjs";
import {ToastService} from "@core/services/toast-service";
import {NotificationService} from "@shared/util/notification.service";
import {KazooCbResponse} from "@core/models/kazoo/kazoo-cb-response.model";
import {TranslateService} from "@ngx-translate/core";
import {CbAuthService} from "@core/services/auth/cb-auth.service";

@Injectable({providedIn: 'root'})
export class QueueService extends AbstractKazooService {

    constructor(private http: HttpClient,
                private authService: AuthService,
                private cbAuthSvc: CbAuthService,
                private toast: ToastService,
                private translate: TranslateService) {
        super(http, authService, toast, translate);
    }

    get SERVICE_URL(): string {
        return `${this.cbAuthSvc.accountURI}/queues`;
    }

    public listQueueRoster(queueId: string): Observable<KazooCbResponse> {
        return this.getRequest(`${this.SERVICE_URL}/${queueId}/roster?paginate=false`);
    }

    public setQueueRoster(queueId: string, agents: string[]): Observable<KazooCbResponse> {
        return this.postRequest(`${this.SERVICE_URL}/${queueId}/roster?paginate=false`, JSON.stringify({data: agents}));
    }

    public eavesdrop(obj: { call_id: string, mode: string, id: string, timeout: number, caller_id_name: string, caller_id_number: string }): Observable<KazooCbResponse> {
        return this.putRequest(`${this.SERVICE_URL}/eavesdrop`, JSON.stringify({data: obj}));
    }
}
