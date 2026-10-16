import {Injectable} from '@angular/core';
import { map } from 'rxjs/operators';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import {AbstractKazooService} from './abstract-kazoo.service';
import {Observable} from "rxjs";
import {ToastService} from "@core/services/toast-service";
import {KazooCbResponse} from "@core/models/kazoo/kazoo-cb-response.model";
import {TranslateService} from "@ngx-translate/core";
import {CbAuthService} from "@core/services/auth/cb-auth.service";

@Injectable({providedIn: 'root'})
export class CdrService extends AbstractKazooService {

    constructor(private http: HttpClient,
                private authService: AuthService,
                private cbAuthSvc: CbAuthService,
                private toast: ToastService,
                private translate: TranslateService) {
        super(http, authService, toast, translate);
    }

    get SERVICE_URL(): string {
        return `${this.cbAuthSvc.accountURI}/cdrs`;
    }

    listInteraction(filter?: { created_from?: any, created_to?: any, page_size?: any, start_key?: any, paginate?: any }): Observable<KazooCbResponse> {
        let params = new HttpParams();
        if (filter) {
            params = this.buildHttpParams(params, 'created_from', filter.created_from);
            params = this.buildHttpParams(params, 'created_to', filter.created_to);
            params = this.buildHttpParams(params, 'page_size', filter.page_size);
            params = this.buildHttpParams(params, 'start_key', filter.start_key);
            params = this.buildHttpParams(params, 'paginate', filter.paginate);
        }
        return this.getRequest(`${this.SERVICE_URL}/interaction`, {params: params});
    }

    interactionLegs(interactionId: string): Observable<KazooCbResponse> {
        return this.getRequest(`${this.SERVICE_URL}/legs/${interactionId}`);
    }
}
