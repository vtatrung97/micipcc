import {Injectable, isDevMode} from '@angular/core';
import { map } from 'rxjs/operators';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import {MediaDetail} from '../../models/media/media-detail.model';
import {KazooCbResponse} from '../../models/kazoo/kazoo-cb-response.model';
import {MenuDetail} from '../../models/menu-detail.model';
import {VmboxDetail} from '../../models/vmbox-detail.model';
import {Observable} from 'rxjs';
import {AbstractKazooService} from './abstract-kazoo.service';
import {ToastService} from "@core/services/toast-service";
import {catchError} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";
import {CbAuthService} from "@core/services/auth/cb-auth.service";
import { CcmsService } from '../callflow/ccms.service';

@Injectable({providedIn: 'root'})
export class CallflowsService extends AbstractKazooService {

    constructor(private http: HttpClient,
                private authService: AuthService,
                private cbAuthSvc: CbAuthService,
                private toast: ToastService,
                private translate: TranslateService,
                private ccmsSvc: CcmsService
            ) {
        super(http, authService, toast, translate);
    }

    get SERVICE_URL(): string {
        return `${this.cbAuthSvc.accountURI}/callflows`;
    }

    /**
     * MENU FUNCTION----------------------------------------------------------------------------------------------------
     */
    public getMenus(paginate: boolean = false): Observable<KazooCbResponse> {

        return this.http.get<KazooCbResponse>(this.cbAuthSvc.accountURI + '/menus')
            .pipe(catchError(error => this.handleError(error)));
    }

    public getMenuDetail(id: string): Observable<KazooCbResponse> {
        return this.http.get<KazooCbResponse>(this.cbAuthSvc.accountURI + '/menus/' + id)
            .pipe(catchError(error => this.handleError(error)));
    }

    public saveOrUpdateMenu(obj: MenuDetail): Observable<KazooCbResponse> {
        if (obj.id) {
            return this.http.post<KazooCbResponse>(this.cbAuthSvc.accountURI + '/menus/' + obj.id, JSON.stringify({data: obj}))
                .pipe(catchError(error => this.handleError(error)));
        } else {
            return this.http.put<KazooCbResponse>(this.cbAuthSvc.accountURI + '/menus', JSON.stringify({data: obj}))
                .pipe(catchError(error => this.handleError(error)));
        }
    }

    public deleteMenu(id: string): Observable<KazooCbResponse> {
        return this.http.delete<KazooCbResponse>(this.cbAuthSvc.accountURI + '/menus/' + id)
            .pipe(catchError(error => this.handleError(error)));
    }

    /**
     * VMBOXES FUNCTION-------------------------------------------------------------------------------------------------
     */
    public getVmboxes(paginate: boolean = false): Observable<KazooCbResponse> {
        let params = new HttpParams();
        params = params.append('paginate', paginate + '');
        return this.http.get<KazooCbResponse>(this.cbAuthSvc.accountURI + '/vmboxes', {params: params})
            .pipe(catchError(error => this.handleError(error)));
    }

    public getVmboxDetail(id: string): Observable<KazooCbResponse> {
        return this.http.get<KazooCbResponse>(this.cbAuthSvc.accountURI + '/vmboxes/' + id)
            .pipe(catchError(error => this.handleError(error)));
    }

    public saveOrUpdateVmbox(obj: VmboxDetail): Observable<KazooCbResponse> {
        if (obj.id) {
            return this.http.post<KazooCbResponse>(this.cbAuthSvc.accountURI + '/vmboxes/' + obj.id, JSON.stringify({data: obj}))
                .pipe(catchError(error => this.handleError(error)));
        } else {
            return this.http.put<KazooCbResponse>(this.cbAuthSvc.accountURI + '/vmboxes', JSON.stringify({data: obj}))
                .pipe(catchError(error => this.handleError(error)));
        }
    }

    public deleteVmbox(id: string): Observable<KazooCbResponse> {
        return this.http.delete<KazooCbResponse>(this.cbAuthSvc.accountURI + '/vmboxes/' + id)
            .pipe(catchError(error => this.handleError(error)));
    }

    public getVmboxMessageDetail(vmboxId: string, msgId: string): Observable<KazooCbResponse> {
        return this.http.get<KazooCbResponse>(this.cbAuthSvc.accountURI + '/vmboxes/' + vmboxId + '/messages/' + msgId)
          .pipe(catchError(error => this.handleError(error)));
    }

    public getVmboxMessageRaw(vmboxId: string, msgId: string): Observable<any> {
        const headers = new HttpHeaders({
            'Cache-Control': 'no-cache'
        });
        return this.http.get(
          this.cbAuthSvc.accountURI + '/vmboxes/' + vmboxId + '/messages/' + msgId + '/raw',
          {
            responseType: 'blob',
            observe: 'response',
            headers: headers
        }).pipe(catchError(error => this.handleError(error)));
    }

    public getVmboxMessageRawByCCMS(vmboxId: string, msgId: string): Observable<any> {
        const headers = new HttpHeaders({
            'Cache-Control': 'no-cache'
        });
        return this.http.get(
          this.ccmsSvc.SERVICE_URL + '/vm-boxes/' + vmboxId + '/messages/' + msgId ,
          {
            responseType: 'blob',
            observe: 'response',
            headers: headers
        }).pipe(catchError(error => this.handleError(error)));
    }
    /**
     * DEVICES FUNCTION-------------------------------------------------------------------------------------------------
     */
    public getDevices(): Observable<KazooCbResponse> {
        return this.http.get<KazooCbResponse>(this.cbAuthSvc.accountURI + '/devices')
            .pipe(catchError(error => this.handleError(error)));
    }

    public getUsers(paginate: boolean = false): Observable<KazooCbResponse> {
        let params = new HttpParams();
        params = params.append('paginate', paginate + '');
        return this.http.get<KazooCbResponse>(this.cbAuthSvc.accountURI + '/users', {params: params})
            .pipe(catchError(error => this.handleError(error)));
    }

    /**
     * MEDIA FUNCTION---------------------------------------------------------------------------------------------------
     */
    public getMedia(paginate: boolean = false): Observable<KazooCbResponse> {
        let params = new HttpParams();
        params = params.append('paginate', paginate + '');
        return this.http.get<KazooCbResponse>(this.cbAuthSvc.accountURI + '/media', {params: params})
            .pipe(catchError(error => this.handleError(error)));
    }

    public getMediaDetail(id: string): Observable<KazooCbResponse> {
        if (isDevMode()) {
            console.log('media id:', id);
            console.log('media id after encodeURI:', encodeURIComponent(id));
        }
        return this.http.get<KazooCbResponse>(this.cbAuthSvc.accountURI + '/media/' + encodeURIComponent(id))
            .pipe(catchError(error => this.handleError(error)));
    }

    public saveOrUpdateMedia(obj: MediaDetail): Observable<KazooCbResponse> {
        if (obj.id) {
            return this.http.post<KazooCbResponse>(this.cbAuthSvc.accountURI + '/media/' + encodeURIComponent(obj.id), JSON.stringify({data: obj}))
                .pipe(catchError(error => this.handleError(error)));
        } else {
            return this.http.put<KazooCbResponse>(this.cbAuthSvc.accountURI + '/media', JSON.stringify({data: obj}))
                .pipe(catchError(error => this.handleError(error)));
        }
    }

    public updateMediaRaw(mediaId: string, fileContent: any): Observable<KazooCbResponse> {
        // const httpOptions = {headers: new HttpHeaders({'Content-Type': 'audio/x-wav'})};
        return this.http.post<KazooCbResponse>(this.cbAuthSvc.accountURI + '/media/' + encodeURIComponent(mediaId) + '/raw', fileContent)
            .pipe(catchError(error => this.handleError(error)));
    }

    public deleteMedia(mediaId: string): Observable<KazooCbResponse> {
        return this.http.delete<KazooCbResponse>(this.cbAuthSvc.accountURI + '/media/' + encodeURIComponent(mediaId))
            .pipe(catchError(error => this.handleError(error)));
    }

    public getMediaByCompanyId(companyId: any, paginate: boolean = false): Observable<KazooCbResponse> {
        let params = new HttpParams();
        params = params.append('paginate', paginate + '');
        return this.http.get<KazooCbResponse>(this.cbAuthSvc.crossbar + '/v2/accounts/' + companyId + '/media', {params: params})
            .pipe(catchError(error => this.handleError(error)));
    }
}
