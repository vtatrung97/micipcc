import { map } from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import {AbstractKazooService} from './abstract-kazoo.service';
import {Observable} from 'rxjs';
import {ToastService} from "@core/services/toast-service";
import {KazooCbResponse} from "@core/models/kazoo/kazoo-cb-response.model";
import {TranslateService} from "@ngx-translate/core";
import {CbAuthService} from "@core/services/auth/cb-auth.service";

@Injectable({providedIn: 'root'})
export class KazooNumberService extends AbstractKazooService {

    constructor(private http: HttpClient,
                private authService: AuthService,
                private cbAuthSvc: CbAuthService,
                private toast: ToastService,
                private translate: TranslateService) {
        super(http, authService, toast, translate);
    }

    get SERVICE_URL(): string {
        return `${this.cbAuthSvc.accountURI}/phone_numbers`;
    }

    deleteNumber(number: string): Observable<KazooCbResponse> {
        const data = {'data': {'numbers': [number]}};
        return this.deleteRequest(`${this.SERVICE_URL}/collection`, {body: data});
    }

    addNumber(number: string) {
        const data = {'data': {'numbers': [number], 'carrier_name': 'local'}};
        return this.putRequest(`${this.SERVICE_URL}/collection`, JSON.stringify(data));
    }

    getNumberClassifiers(): Observable<KazooCbResponse> {
        return this.getRequest(`${this.SERVICE_URL}/classifiers`);
    }
}
