import {Injectable} from "@angular/core";
import { map } from 'rxjs/operators';
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../auth/auth.service";
import {AbstractKazooService} from "./abstract-kazoo.service";
import {Observable} from 'rxjs';
import {ToastService} from "@core/services/toast-service";
import {KazooCbResponse} from "@core/models/kazoo/kazoo-cb-response.model";
import {TranslateService} from "@ngx-translate/core";
import {CbAuthService} from "@core/services/auth/cb-auth.service";

@Injectable({providedIn: 'root'})
export class KazooUserService extends AbstractKazooService {

    constructor(private http: HttpClient,
                private authService: AuthService,
                private cbAuthSvc: CbAuthService,
                private toast: ToastService,
                private translate: TranslateService) {
        super(http, authService, toast, translate);
    }

    get SERVICE_URL(): string {
        return `${this.cbAuthSvc.accountURI}/users`;
    }

    searchByName(filter: { search_string?: any, start_key?: any, page_size?: any }) {
        return this._searchByName(this.cbAuthSvc.accountURI, 'user', filter);
    }

    createUser(user: any, accountId: string) {
        return this.putRequest(`${this.cbAuthSvc.crossbar}/v2/accounts/${accountId}/users`, JSON.stringify({data: user}))
    }

    listUserDevices(userId: string): Observable<KazooCbResponse> {
        return this.getRequest(`${this.SERVICE_URL}/${userId}/devices?paginate=false`)
    }
}
