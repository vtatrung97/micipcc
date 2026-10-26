import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ToastService} from "@core/services/toast-service";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {SERVICES} from "@env/environment";
import {AbstractService} from "@core/services/abstract.service";
import {TranslateService} from "@ngx-translate/core";
import {ThemeModule} from "@models/email/themeModule";


@Injectable({providedIn: 'root'})
export class EmailThemeService extends AbstractService {

    constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService) {
        super(http, toastSv, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/themes`;
    }

    public getEmailTheme(type: string): Observable<ResponseEnvelope<ThemeModule[]>> {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'type', type);
        return this.getRequest(this.SERVICE_URL, {params: params});
    }
}
