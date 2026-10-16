import {AbstractService} from "@core/services/abstract.service";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {SERVICES} from "@env/environment";

@Injectable({ providedIn: 'root' })
export class CxBotService extends AbstractService {
    constructor(
        private http: HttpClient,
        private authSvc: AuthService,
        private toastSvc: ToastService,
        private translate: TranslateService
    ) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.BOT_SERVER_API.url}/api/v1/cx-bot`;
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

    public deleteBot(req: { ids: string[] }){
        return this.deleteRequest(`${this.SERVICE_URL}`, req)
    }

    public getById(botId: string){
        return this.getRequest(`${this.SERVICE_URL}/${botId}`)
    }
}
