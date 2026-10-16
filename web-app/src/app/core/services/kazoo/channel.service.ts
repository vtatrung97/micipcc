import {Injectable} from '@angular/core';
import { map } from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import {AbstractKazooService} from './abstract-kazoo.service';
import {KazooCbResponse} from "../../models/kazoo/kazoo-cb-response.model";
import {Observable} from "rxjs";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {CbAuthService} from "@core/services/auth/cb-auth.service";

@Injectable({providedIn: 'root'})
export class KazooChannelService extends AbstractKazooService {
    constructor(private http: HttpClient,
                private authService: AuthService,
                private cbAuthSvc: CbAuthService,
                private toast: ToastService,
                private translate: TranslateService) {
        super(http, authService, toast, translate);
    }

    get SERVICE_URL(): string {
        return `${this.cbAuthSvc.accountURI}/channels`;
    }

    hangup(callId: string): Observable<KazooCbResponse> {
        const object = {'action': 'hangup'};
        return this.postRequest(`${this.SERVICE_URL}/${callId}`, JSON.stringify({data: object}));
    }

    transfer(callId: string, target?: string | null) {
        const object = {'action': 'transfer', 'target': target, 'takeback_dtmf': '*1'};
        return this.postRequest(`${this.SERVICE_URL}/${callId}`, JSON.stringify({data: object}));
    }
}
