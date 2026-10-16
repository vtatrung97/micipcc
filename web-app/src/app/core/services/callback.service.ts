import {AbstractService} from "@core/services/abstract.service";
import {Injectable} from "@angular/core";
import {SERVICES} from "@env/environment";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {catchError} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {CallbackSession} from "@core/models/callback/callback.model";

@Injectable({providedIn: 'root'})
export class CallbackService extends AbstractService {

    constructor(private http: HttpClient, private authSvc: AuthService, private toastSvc: ToastService, private translateSvc: TranslateService) {
        super(http, toastSvc, translateSvc);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CALL_BACK_SERVICE_API.url}/api/v1/public`;
    }

    public getCallbackSession(callbackSessionId: string): Observable<any> {
        return this.http.get<ResponseEnvelope<CallbackSession>>(`${this.SERVICE_URL}/callback/get-by-session-id?callbackSessionId=${callbackSessionId}`)
            .pipe(catchError((error) => this.handleError(error)));
    }
}
