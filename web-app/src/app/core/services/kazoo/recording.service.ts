import {Injectable} from '@angular/core';
import { map } from 'rxjs/operators';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import {AbstractKazooService} from './abstract-kazoo.service';
import {ToastService} from "@core/services/toast-service";
import {Observable} from "rxjs";
import {catchError} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";
import {CbAuthService} from "@core/services/auth/cb-auth.service";

@Injectable({providedIn: 'root'})
export class RecordingService extends AbstractKazooService {

    constructor(private http: HttpClient,
                private authService: AuthService,
                private cbAuthSvc: CbAuthService,
                private toast: ToastService,
                private translate: TranslateService) {
        super(http, authService, toast, translate);
    }

    get SERVICE_URL(): string {
        return `${this.cbAuthSvc.accountURI}/recordings`;
    }

    download(id: any, searchObject: any): Observable<Blob> {
        const headers = new HttpHeaders({
            'Accept': 'audio/mpeg'
        });
        return this.http.get(`${this.SERVICE_URL}/${id}?accept=audio/mpeg`, {
            headers: headers,
            responseType: "blob"
        }).pipe(catchError((error: any) => {
            if (error instanceof HttpErrorResponse) {
                let errorStatus = (<HttpErrorResponse>error).status;
                if (errorStatus === 404) {
                    return this.downloadFromServicesTicket(id, searchObject);
                } else {
                    return this.handleError(error);
                }
            }
            return this.handleError(error);
        }));
    }

    downloadFromServicesTicket(id: any, searchObject: any): Observable<Blob> {
        const headers = new HttpHeaders({
            'Accept': 'audio/mpeg'
        });
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'fromTime', searchObject.fromTime);
        params = this.buildHttpParams(params, 'toTime', searchObject.toTime);

        return this.http.get(`${this.SERVICE_URL}/${id}?accept=audio/mpeg`, {
            headers: headers,
            responseType: "blob",
            params: params
        }).pipe(catchError(error => this.handleError(error)));
    }
}
