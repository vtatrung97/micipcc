import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import {AbstractKazooService} from './abstract-kazoo.service';
import {Observable} from 'rxjs';
import {ToastService} from "@core/services/toast-service";
import {NotificationService} from "@shared/util/notification.service";
import {MenuDetail} from "@core/models/menu-detail.model";
import {TranslateService} from "@ngx-translate/core";
import {CbAuthService} from "@core/services/auth/cb-auth.service";

@Injectable({providedIn: 'root'})
export class MenuService extends AbstractKazooService {

    constructor(private http: HttpClient,
                private authService: AuthService,
                private cbAuthSvc: CbAuthService,
                private toast: ToastService,
                private translate: TranslateService) {
        super(http, authService, toast, translate);
    }

    get SERVICE_URL(): string {
        return `${this.cbAuthSvc.accountURI}/menus`;
    }

    searchByName(filter?: { search_string?: any, start_key?: any, page_size?: any }) {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 't', 'menu');
        params = this.buildHttpParams(params, 'q', 'name');
        params = this.buildHttpParams(params, 'v', filter?.search_string);
        params = this.buildHttpParams(params, 'start_key', filter?.start_key);
        params = this.buildHttpParams(params, 'page_size', filter?.page_size);
        const url = `${this.cbAuthSvc.accountURI}/search`;
        return this.getRequest(url, {params: params});
    }

    public listMainMenus() {
        return this.list({filter_type: 'main', paginate: false});
    }

    public createMainMenu(name: string): Observable<any> {
        const menu = new MenuDetail({name: name, type: 'main'});
        return this.saveOrUpdate(menu);
    }

    public saveOrUpdateMenu(menu: any): Observable<any> {
        return this.saveOrUpdate(menu);
    }
}
