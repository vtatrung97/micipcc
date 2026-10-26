import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from "rxjs";
import {SERVICES} from "@env/environment";
import {ResponseEnvelope} from "@core/models/response.model";
import {ToastService} from "@core/services/toast-service";
import {AbstractService} from "@core/services/abstract.service";
import {Domain} from "@models/chat/domain.model";
import {catchError} from "rxjs/operators";
import {AuthService} from "@core/services/auth/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {ConversationModel} from "@core/models/ticket/conversation.model";


@Injectable({providedIn: 'root'})
export class ConversationService extends AbstractService {

    constructor(private http: HttpClient,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CHAT_SERVICE_API.url}`;
    }

    public getCxBotTransferReason(conversationId: string): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/api/v1/conversations/${conversationId}/cxbotTransferToAgentReason`);
    }
}
