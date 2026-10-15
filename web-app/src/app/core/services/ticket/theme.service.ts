import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {AbstractService} from "@core/services/abstract.service";
import {ToastService} from "@core/services/toast-service";
import {SERVICES} from "@env/environment";
import {ThemeModule} from "@models/email/themeModule";
import {ResponseEnvelope} from "@core/models/response.model";


@Injectable({providedIn: 'root'})
export class ThemeService extends AbstractService {

    constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService) {
        super(http, toastSv, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1`;
    }

    public getPrivateSignatureAndVarValue(type: number): Observable<ResponseEnvelope<ThemeModule[]>> {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'type', type);
        return this.getRequest(this.SERVICE_URL + '/themes', {params: params});
    }

    public addTheme(theme: ThemeModule): Observable<ThemeModule> {
        return this.postRequest(this.SERVICE_URL + "/themes", theme);
    }

    public updateTheme(data: ThemeModule) {
        return this.putRequest(this.SERVICE_URL+ "/themes", data);
    }


    public deleteThemes(object: any): Observable<ResponseEnvelope<any>> {
        return this.postRequest(this.SERVICE_URL+ "/themes/delete", object);
    }

    public checkHasDefaultThemeType(type: string): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/themes/check-default?type=${type}`)
    }
}
