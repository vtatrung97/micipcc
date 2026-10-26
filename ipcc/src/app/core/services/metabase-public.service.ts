import {Injectable} from "@angular/core";
// @ts-ignore
import * as CryptoJS from 'crypto-js';
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {CookieService} from "ngx-cookie-service";
import {SERVICES} from "@env/environment";
import {Observable, of} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";

@Injectable({ providedIn: 'root' })
export class MetabasePublicService extends AbstractService {
  constructor(
      private http: HttpClient,
      private auth: AuthService,
      private toast: ToastService,
      private translate: TranslateService,
      private cookieSvc: CookieService) {
    super(http, toast, translate);
  }

  get SERVICE_URL(): string {
    return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/reports`;
  }

  get METABASE_EXPORT_URL(): string {
    return `${SERVICES.AGENT_NOTIFY_SERVER_API.url}/public/api/v1/reports`
  }

  public getPermissions(groupId: string | null, reportType: string) : Observable<any> {
    let params = new HttpParams();
    params = this.buildHttpParams(params, 'groupId', groupId);
    params = this.buildHttpParams(params, 'reportType', reportType);
    return this.getRequest(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/report/permissions`, {params:params});
  }

  public exportEmailReport(reportType: string, payload: any): Observable<any> {
    let url: string = `${this.SERVICE_URL}/${reportType}/export`;
    url += `?token=${payload['token']}`;
    for (let key in payload) {
      if (key !== 'token' && payload[key] !== null) {
        url += `&${key}=${payload[key]}`;
      }
    }
    return this.getRequestFile(url);
  }

  base64url(source: any) {
    let encodedSource = CryptoJS.enc.Base64.stringify(source);
    encodedSource = encodedSource.replace(/=+$/, ''); // NOSONAR
    encodedSource = encodedSource.replace(/\+/g, '-');
    encodedSource = encodedSource.replace(/\//g, '_');
    return encodedSource;
  }

  encodeToken(payload:any) {
    let header = {
      "alg": "HS256",
      "typ": "JWT"
    };
    let stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
    let encodedHeader = this.base64url(stringifiedHeader);
    let stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(payload));
    let encodedData = this.base64url(stringifiedData);
    return  encodedHeader + "." + encodedData;
  }

  signToken(payload:any,key:string) {
    let secret = key;
    let token:any = this.encodeToken(payload);
    let signature:any = CryptoJS.HmacSHA256(token, secret);
    signature = this.base64url(signature);
    let signedToken = token + "." + signature;
    return signedToken;
  }
}
