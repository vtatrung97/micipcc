import {AbstractService} from "@core/services/abstract.service";
import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {SERVICES} from "@env/environment";
import {CxbotbindingModel} from "@core/models/ticket/cxbotbinding.model";

@Injectable({ providedIn: 'root' })
export class CxBotbindingService extends AbstractService {
    constructor(
        private http: HttpClient,
        private authSvc: AuthService,
        private toastSvc: ToastService,
        private translate: TranslateService
    ) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.BOT_SERVER_API.url}/api/v1/cxbot-binding`;
    }

    public getListServiceOwner(){
        return this.getRequest(`${this.SERVICE_URL}/list-service-owner`)
    }

    public addBot(addForm: any){
        return this.postRequest(`${this.SERVICE_URL}`, addForm)
    }

    public editBot(botId: string | null, addForm: any){
        return this.putRequest(`${this.SERVICE_URL}/${botId}`, addForm)
    }

    public deleteBot(botId: string){
        return this.deleteRequest(`${this.SERVICE_URL}/${botId}`)
    }

    public getById(botId: string){
        return this.getRequest(`${this.SERVICE_URL}/${botId}`)
    }

    getBotTimeoutConfig(ticketInfos: CxbotbindingModel[]) {
        return this.postRequest(`${this.SERVICE_URL}/by-botid-sourceid`, ticketInfos)
    }
}
