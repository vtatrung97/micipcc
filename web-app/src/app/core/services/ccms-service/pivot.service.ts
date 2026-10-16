import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {Observable} from "rxjs";
import {SERVICES} from "@env/environment";
import {TranslateService} from "@ngx-translate/core";
import {ResponseEnvelope} from "@core/models/response.model";

@Injectable({providedIn: 'root'})
export class PivotService extends AbstractService {
  constructor(private http: HttpClient,
              private authSvc: AuthService,
              private toastSvc: ToastService,
              private translate: TranslateService) {
    super(http, toastSvc, translate);
  }

  get SERVICE_URL(): string {
    return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/pivots`;
  }

  get SERVICE_MEDIA_URL(): string {
    return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/pivot-routing`;
  }

  public getPivot(servicePivotId: any) {
    return this.getRequest(`${this.SERVICE_URL}/${servicePivotId}`);
  }

  public exportMediaPivot(servicePivotId: string): Observable<any> {
    return this.getRequestFile(`${this.SERVICE_URL}/media-pivot/excels?servicePivotId=${servicePivotId}`);
  }

  public createMediaByCustomerGroup(data: any): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}/media-by-customer-group-pivot`, data)
  }

  public updateMediaByCustomerGroup(id: any, data: any): Observable<ResponseEnvelope<any>> {
    return this.putRequest(`${this.SERVICE_URL}/media-by-customer-group-pivot`, data)
  }

  public deleteMediaByCustomerGroup(listId: any): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}/media-by-customer-group-pivot/delete`, listId)
  }

  public createMediaByProvincePivot(data: any): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}/media-by-province-pivot`, data);
  }

  public updateMediaByProvincePivot(id: any, data: any): Observable<ResponseEnvelope<any>> {
    return this.putRequest(`${this.SERVICE_URL}/media-by-province-pivot`, data);
  }

  public deleteMediaByProvincePivot(listId: any): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}/media-by-province-pivot/delete`, listId);
  }

  public createMultiMediaPivot(data: any): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}/media-pivot`, data);
  }

  public createPhoneFormatPivot(data: any): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}/phone-format-pivot`, data)
  }

  public updatePhoneFormatPivot(data: any): Observable<ResponseEnvelope<any>> {
    return this.putRequest(`${this.SERVICE_URL}/phone-format-pivot`, data)
  }

  public deletePhoneFormatPivot(listId: any): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}/phone-format-pivot/delete`, listId)
  }

  public createCustomerGroupPivot(data: any): Observable<ResponseEnvelope<any>> {
    return this.putRequest(`${this.SERVICE_URL}/customer-group-pivot`, data);
  }

  public updateCustomerGroupPivot(data: any): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}/customer-group-pivot`, data);
  }

  public getCustomerGroupPivot(servicePivotId: string): Observable<ResponseEnvelope<any>> {
    return this.getRequest(`${this.SERVICE_URL}/customer-group-pivot/${servicePivotId}`);
  }

  public deleteCustomerGroupPivot(listId: any): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}/customer-group-pivot/delete`, listId);
  }

  public updateMultiMediaPivot(id: any, data: any): Observable<ResponseEnvelope<any>> {
    return this.putRequest(`${this.SERVICE_URL}/media-pivot`, data);
  }

  public createMediaByRankPivot(data: any): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}/media-by-rank-pivot`, data);
  }

  public updateMediaByRankPivot(id: any, data: any): Observable<ResponseEnvelope<any>> {
    return this.putRequest(`${this.SERVICE_URL}/media-by-rank-pivot`, data);
  }

  public getPivotRoutingByPivotId(id: any) {
    return this.getRequest(`${this.SERVICE_MEDIA_URL}/by-pivot-id/${id}`);
  }

  public updateCheckRankPivot(data: any): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}/customer-check-pivot`, data);
  }

  public createCheckRankPivot(data: any): Observable<ResponseEnvelope<any>> {
    return this.putRequest(`${this.SERVICE_URL}/customer-check-pivot`, data);
  }

  public deleteCheckRankPivot(listId: any): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}/customer-check-pivot/delete`, listId);
  }

  public getRoutingByPivotId(pivotId: any): Observable<ResponseEnvelope<any>> {
    return this.getRequest(`${this.SERVICE_URL}/${pivotId}/routing`);
  }

  public createServicePivotGeneral(data: any): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}/pivot-general`, data);
  }

  public updateServicePivotGeneral(data: any): Observable<ResponseEnvelope<any>> {
    return this.putRequest(`${this.SERVICE_URL}/pivot-general`, data);
  }

  public deleteServicePivotGeneral(data: any): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}/pivot-general/delete`, data);
  }

  public createServicePivot(data: any): Observable<ResponseEnvelope<any>> {
    return this.postRequest(`${this.SERVICE_URL}`, data);
  }

  public updateServicePivot(data: any): Observable<ResponseEnvelope<any>> {
    return this.putRequest(`${this.SERVICE_URL}`, data);
  }
}
