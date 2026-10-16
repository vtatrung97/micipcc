import {Injectable} from "@angular/core";
import { map } from 'rxjs/operators';
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../auth/auth.service";
import {AbstractKazooService} from "./abstract-kazoo.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {CbAuthService} from "@core/services/auth/cb-auth.service";

@Injectable({providedIn: 'root'})
export class KazooMetaflowService extends AbstractKazooService {

    constructor(private http: HttpClient,
                private authService: AuthService,
                private cbAuthSvc: CbAuthService,
                private toast: ToastService,
                private translate: TranslateService) {
        super(http, authService, toast, translate);
    }

    get SERVICE_URL(): string {
        return `${this.cbAuthSvc.accountURI}/metaflows`;
    }
}
