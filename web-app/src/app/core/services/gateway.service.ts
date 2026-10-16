import {AbstractService} from "@core/services/abstract.service";
import {Injectable} from "@angular/core";
import {SERVICES} from "@env/environment";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {Ticket} from "@core/models/ticket/ticket.model";
import {catchError} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {FacebookStatusModel} from "@models/facebook/facebook-status.model";
import {TranslateService} from "@ngx-translate/core";
import { CbResponse } from "@pages/settings/chat/chat-model/chat-response.model";
import { ZaloCallResponse } from "@core/models/zalo-account/zalo-call-response.model";

@Injectable({ providedIn: 'root' })
export class GatewayService extends AbstractService {

    constructor(private http: HttpClient, private authSvc: AuthService, private toastSvc: ToastService, private translateSvc: TranslateService) {
        super(http, toastSvc, translateSvc);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.SOCIAL_GATEWAY_SERVICE_API.url}/api/v1`;
    }

    get SERVICE_PRIVATE_URL(): string {
        return `${SERVICES.SOCIAL_GATEWAY_SERVICE_API.url}/private/api/v1`;
    }

    public getStatisticObjectInfo(objectId: string, pageId: string, isPost: number): Observable<any> {
        return this.http.get<ResponseEnvelope<Ticket>>(`${this.SERVICE_URL}/statistic?objectId=${objectId}&pageId=${pageId}&isPost=${isPost}`)
            .pipe(catchError((error) => this.handleError(error)));
    }

    public changeLike(status: FacebookStatusModel, isLike: Boolean): Observable<any> {
        return this.http.post<ResponseEnvelope<Ticket>>(`${this.SERVICE_URL}/change-like-status?isLike=${isLike}`, status)
            .pipe(catchError((error) => this.handleError(error)));
    }

    public checkConsent(phone: string, oaId: string): Observable<any> {
        return this.http.get<ResponseEnvelope<ZaloCallResponse>>(`${this.SERVICE_PRIVATE_URL}/check/${phone}/${oaId}`)
            .pipe(catchError((error) => this.handleError(error)));
    }

     public requestConsent(phone: string, oaId: string): Observable<any> {
        return this.http.get<ResponseEnvelope<ZaloCallResponse>>(`${this.SERVICE_PRIVATE_URL}/requestconsent/${phone}/${oaId}`)
            .pipe(catchError((error) => this.handleError(error)));
    }
}
