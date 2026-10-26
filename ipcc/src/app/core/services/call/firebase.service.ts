import {Injectable} from "@angular/core";
import {AbstractService} from "../abstract.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../auth/auth.service";
import {ToastService} from "../toast-service";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";

@Injectable({ providedIn: 'root' })
export class FirebaseService extends AbstractService {
    constructor(private http: HttpClient, private authSvc: AuthService, private toastSvc: ToastService, private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.FIREBASE_API.url}`;
    }

    public getIOSPlayer(firebase: any): Promise<any> {
        return this.http.post(`${this.SERVICE_URL}/players`, firebase).toPromise();
    }

    public notifyOutboundCall(firebase: any): Promise<any> {
        let header = '';
        let headers = new HttpHeaders();
        headers = headers.set('Authorization', header).set('Content-Type', 'application/json; charset=utf-8')
        return this.http.post(`${this.SERVICE_URL}/notifications`, firebase, {headers: headers}).toPromise();
    }
}

