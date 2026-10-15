import {AbstractService} from "@core/services/abstract.service";
import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ToastService} from '@core/services/toast-service';
import {ResponseEnvelope} from "@core/models/response.model";
import {Observable} from "rxjs";
import {FBPageModel, FbPageResponse, FbService} from "@models/facebook/FBPage.model";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";

@Injectable({providedIn: 'root'})
export class PageService extends AbstractService {

    updatePage(fbPageIpccDTO: FBPageModel) {
        return this.putRequest(this.SERVICE_URL, fbPageIpccDTO);
    }
    constructor(private http: HttpClient, toastSvc: ToastService, private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CHAT_SERVICE_API.url}/api/v1/pages`;
    }

    deletePage(pageIds: object): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/delete`, pageIds);
    }

    getPages(token: string): Observable<ResponseEnvelope<FbPageResponse>> {
        return this.postRequest(`${this.SERVICE_URL}/facebook`, token)
    }

    getFacebookPages(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/all`);
    }

    savePage(fbPageIpccDTO: FBPageModel): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}`, fbPageIpccDTO);
    }

    subscribeWebhookForPages(fbPageId: string): Observable<ResponseEnvelope<any>>  {
        return this.getRequest(`${this.SERVICE_URL}/subscribe_app/${fbPageId}`);
    }

    getCreateAndUpdateUserList(groupId: string) {
        let param = new HttpParams();
        param = this.buildHttpParams(param, "groupId", groupId);
        return this.getRequest(`${this.SERVICE_URL}/create-update-users`, {params: param})
    }

    getPageById(id: string): Observable<ResponseEnvelope<FBPageModel>>  {
        return this.getRequest(this.SERVICE_URL + "/" + id);
    }

    addPageService(editingService: FbService | undefined): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/services`, editingService)
    }

    updatePageService(editingService: FbService | undefined): Observable<ResponseEnvelope<any>> {
        return this.putRequest(`${this.SERVICE_URL}/services`, editingService)
    }

    deletePageService(editingService: FbService[] | undefined): Observable<ResponseEnvelope<any>> {
        return this.deleteRequest(`${this.SERVICE_URL}/services`, editingService)
    }
}
