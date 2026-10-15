import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ToastService} from "@core/services/toast-service";
import {EmailSignature} from "@models/email/signature";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {SERVICES} from "@env/environment";
import {Signature} from "@core/models/ticket/signature.model";
import {AbstractService} from "@core/services/abstract.service";
import {TranslateService} from "@ngx-translate/core";
import {SIGNATURE_ACTION} from "../../../app.constants";


@Injectable({providedIn: 'root'})
export class SignatureService extends AbstractService {

    constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService) {
        super(http, toastSv, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/signatures`;
    }

    public getEmailSignatureAndVarValue(emailAddress?: any): Observable<ResponseEnvelope<Signature[]>> {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'isGetSigVar', SIGNATURE_ACTION.TRUE);
        params = this.buildHttpParams(params, 'emailAddress', emailAddress);
        return this.getRequest(this.SERVICE_URL, {params: params});
    }

    public getPrivateSignatureAndVarValue(): Observable<ResponseEnvelope<Signature[]>> {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'isGetSigVar', SIGNATURE_ACTION.TRUE);
        return this.getRequest(this.SERVICE_URL + "/private", {params: params});
    }

    public addSignature(emailSignature: EmailSignature): Observable<EmailSignature> {
        return this.postRequest(this.SERVICE_URL, emailSignature);
    }

    public updateSignature(data: EmailSignature) {
        return this.putRequest(this.SERVICE_URL, data);
    }

    public deleteSignatureId(signatureId: string): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/delete/${signatureId}`);
    }

    public deleteSignatures(object: any): Observable<ResponseEnvelope<any>> {
        return this.deleteRequest(this.SERVICE_URL, object);
    }

    public getVarCodes(language: string): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/var-codes?lang=${language}`);
    }

    public checkDuplicateSignatureNamePrivate(inputSignatureName: any): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/private/check?name=${inputSignatureName}`);
    }

    public checkDuplicateSignatureName(inputSignatureName: any): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/check?name=${inputSignatureName}`);
    }

    public checkHasDefaultSignatureType(type: string, email?: string): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/check-default?type=${type}&email=${email}`)
    }

    getActorsCreateBy(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/actors-createby`)
    }

    getActorsUpdateBy(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/actors-updateby`)
    }

    getEmailListForSearch(): Observable<ResponseEnvelope<any>>{
        return this.getRequest(`${this.SERVICE_URL}/email-addresses`)
    }
}
