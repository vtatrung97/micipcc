import {AbstractService} from "@core/services/abstract.service";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {SERVICES} from "@env/environment";

@Injectable({ providedIn: 'root' })
export class BccsMappingService extends AbstractService {
    constructor(
        private http: HttpClient,
        private toastSvc: ToastService,
        private translate: TranslateService
    ) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/bccs-mapping-management`;
    }

    public addMapping(addForm: any){
        return this.postRequest(`${this.SERVICE_URL}`, addForm)
    }

    public editMapping(bccsMappingId: string | null, addForm: any){
        return this.putRequest(`${this.SERVICE_URL}/${bccsMappingId}`, addForm)
    }

    public deleteMapping(req: { ids: string[] }){
        return this.deleteRequest(`${this.SERVICE_URL}`, req)
    }

    public getById(bccsMappingId: string){
        return this.getRequest(`${this.SERVICE_URL}/${bccsMappingId}`)
    }
}
