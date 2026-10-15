import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {SERVICES} from "@env/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {Threshold} from "@models/threshold/threshold.model";

@Injectable({providedIn: 'root'})
export class ThresholdService extends AbstractService {
    constructor(private http: HttpClient,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/threshold`;
    }

    getThresholdAjax(): string {
        return `${this.SERVICE_URL}`;
    }

    getThreshold(payload: string | undefined): Observable<ResponseEnvelope<any>> {
        let params = new HttpParams();
        params = this.buildHttpParams(params, "thresholdName", payload);
        return this.getRequest(`${this.SERVICE_URL}/findByProperties`, {params: params});
    }

    createThreshold(object: Threshold): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}`, object)
    }

    updateThreshold(object: Threshold): Observable<ResponseEnvelope<any>> {
        return this.putRequest(`${this.SERVICE_URL}`, object)
    }

    deleteThreshold(ids: string[]): Observable<ResponseEnvelope<any>> {
        return this.deleteRequest(`${this.SERVICE_URL}`, ids);
    }

    validateFile(groupId: string | null, formData: any) {
        return this.postRequest(`${this.SERVICE_URL}/validate-file?groupId=${groupId}`, formData);
    }

    importFile(filePath: string, threshold: Threshold[] | undefined) {
        return this.postRequest(`${this.SERVICE_URL}/import?filePath=${filePath}`, threshold);
    }

    exportFile(payload: any): Observable<any> {
        return this.postRequestFile2(`${this.SERVICE_URL}/export`, payload);
    }
}
