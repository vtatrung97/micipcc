import { HttpClient, HttpHeaders, HttpParameterCodec, HttpParams } from '@angular/common/http';
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { ToastService } from "./toast-service";
import { HTTP_STATUS_CODE } from "@core/constant/system.constants";
import { TranslateService } from "@ngx-translate/core";


export abstract class AbstractService {

    URL_SEPARATOR = '/';

    protected constructor(
        protected httpClient: HttpClient,
        private toastService: ToastService,
        private translateService: TranslateService) {
    }

    abstract get SERVICE_URL(): string;

    public list(): Observable<any> {
        return this.getRequest(this.SERVICE_URL);
    }

    public get(id: string): Observable<any> {
        return this.getRequest(`${this.SERVICE_URL}/${id}`)
    }

    public update(id: string, object: any): Observable<any> {
        return this.postRequest(`${this.SERVICE_URL}/${id}`, JSON.stringify({ data: object }))
    }

    public saveOrUpdate(object: any): Observable<any> {
        if (object.id) {
            return this.postRequest(`${this.SERVICE_URL}/${object.id}`, JSON.stringify({ data: object }))
        } else {
            return this.putRequest(`${this.SERVICE_URL}`, JSON.stringify({ data: object }));
        }
    }

    public delete(id: string): Observable<any> {
        return this.httpClient.delete(`${this.SERVICE_URL}/${id}`);
    }

    public getRequest(url: string, options?: any, showOnlyDefaultError = false): Observable<any> {
        return this.httpClient.get(url, options).pipe(catchError(error => this.handleError(error, showOnlyDefaultError)));
    }

    /**
     * make post request
     */
    public postRequest(url: string, data?: any, showOnlyDefaultError = false): Observable<any> {
        return this.httpClient.post(url, data).pipe(catchError(error => this.handleError(error, showOnlyDefaultError)
        )
    );
    }

    /**
     * make post request
     */
    public postRequestWithHeader(url: string, data?: any, headers?: HttpHeaders,  showOnlyDefaultError = false): Observable<any> {
            return this.httpClient.post(url, data, { headers: headers ?? new HttpHeaders()}).pipe(catchError(error => this.handleError(error, showOnlyDefaultError)
            )
        );
    }


    /**
     * make put request
     */
    public putRequest(url: string, data?: any, showOnlyDefaultError = false): Observable<any> {
        return this.httpClient.put(url, data).pipe(catchError(error => this.handleError(error, showOnlyDefaultError)));
    }

    /**
     * make get request for file
     */
    public getRequestFile(url: string, params?: HttpParams): Observable<any> {
        const headers = new HttpHeaders({
            'Cache-Control': 'no-cache'
        });
        return this.httpClient.get(url, {
            responseType: 'blob',
            observe: 'response',
            params: params,
            headers: headers
        }).pipe(catchError(error => this.handleError(error)));
    }

    /**
     * make get request for file add new headers
     */
    public getRequestFileAddHeaders(url: string, params?: HttpParams): Observable<any> {
        let lang = localStorage.getItem('language');
        const headers = new HttpHeaders({
            'Cache-Control': 'no-cache',
            'Locale': lang == 'vn' ? 'vi' : 'en'
        });
        return this.httpClient.get(url, {
            responseType: 'blob',
            observe: 'response',
            params: params,
            headers: headers
        }).pipe(catchError(error => this.handleError(error)));
    }

    /**
     * make get request for file
     */
    public getRequestFileConvertMessage(url: string, params?: HttpParams): Observable<any> {
        const headers = new HttpHeaders({
            'Cache-Control': 'no-cache'
        });
        return this.httpClient.get(url, {
            responseType: 'blob',
            observe: 'response',
            params: params,
            headers: headers
        }).pipe(catchError(async (error) => {
            const mess = JSON.parse(await error.error.text()).message;
            return this.handleErrorMessageFile(mess || error)
        }));
    }

    /**
     * make post request for file
     */
    public postRequestFile(url: string, data?: any): Observable<any> {
        return this.httpClient.post(url, data, { responseType: 'blob' }).pipe(catchError(error => this.handleError(error)));
    }

    /**
     * make post request for file
     */
    public postRequestFile2(url: string, data?: any): Observable<any> {
        return this.httpClient.post(url, data, {
            responseType: 'blob',
            observe: 'response'
        }).pipe(catchError(error => this.handleError(error)));
    }

    /**
     * make post request for report file
     */
    public postRequestFileForReport(url: string, data?: any): Observable<any> {
        const headers = new HttpHeaders({
            'Cache-Control': 'no-cache'
        });
        return this.httpClient.post(url, data, {
            responseType: 'blob',
            observe: 'response',
            headers: headers
        }).pipe(catchError(async (error) => {
            const mess = JSON.parse(await error.error.text()).message;
            return this.handleErrorMessageFile(mess || error)
        }));
    }

    /**
     * make get request
     */
    public deleteRequest(url: string, data?: any, showOnlyDefaultError = false): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }), body: data,
        };

        return this.httpClient.delete(url, httpOptions).pipe(catchError(error => this.handleError(error, showOnlyDefaultError)));
    }

    public deleteRequestNotHandleError(url: string, data?: any): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({'Content-Type': 'application/json'}), body: data,
        };

        return this.httpClient.delete(url, httpOptions).pipe(catchError(error => throwError(error)));
    }

    /**
     * make patch request
     */
    public patchRequest(url: string, data?: any, showOnlyDefaultError = false): Observable<any> {
        return this.httpClient.patch(url, data).pipe(catchError(error => this.handleError(error, showOnlyDefaultError)));
    }

    /**
     * handleError
     */
    protected handleError(error: any, showOnlyDefaultError: boolean = false) {
        if (!this.checkUrl(error.url) && !this.checkErrorCode(error.error?.error)) {
            if (error.error?.message) {
                if (error.error?.message?.length > 250) {
                    console.log(error.error?.message)
                    this.toastService.showDanger(this.translateService.instant("common.error.400"));
                } else {
                    !showOnlyDefaultError && this.toastService.showDanger(error.error?.message);
                }
            } else {
                switch (error.status) {
                    case HTTP_STATUS_CODE.BAD_REQUEST:
                        this.toastService.showDanger(this.translateService.instant("common.error.400"));
                        break;
                    case HTTP_STATUS_CODE.UNAUTHORIZED:
                        localStorage.removeItem('access_token');
                        this.toastService.showDanger(this.translateService.instant("common.error.401"));
                        break;
                    case HTTP_STATUS_CODE.FORBIDDEN:
                        this.toastService.showDanger(this.translateService.instant("common.error.403"));
                        break;
                    case HTTP_STATUS_CODE.NOT_FOUND:
                        this.toastService.showDanger(this.translateService.instant("common.error.404"));
                        break;
                    case HTTP_STATUS_CODE.METHOD_NOT_ALLOWED:
                        this.toastService.showDanger(this.translateService.instant("common.error.405"));
                        break;
                    case HTTP_STATUS_CODE.NOT_ACCEPTABLE:
                        this.toastService.showDanger(this.translateService.instant("common.error.406"));
                        break;
                    case HTTP_STATUS_CODE.REQUEST_TIMEOUT:
                        this.toastService.showDanger(this.translateService.instant("common.error.408"));
                        break;
                    case HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR:
                        this.toastService.showDanger(this.translateService.instant("common.error.500"));
                        break;
                    case HTTP_STATUS_CODE.BAD_GATEWAY:
                        this.toastService.showDanger(this.translateService.instant("common.error.502"));
                        break;
                    case HTTP_STATUS_CODE.SERVICE_UNAVAILABLE:
                        this.toastService.showDanger(this.translateService.instant("common.error.503"));
                        break;
                    case HTTP_STATUS_CODE.GATEWAY_TIMEOUT:
                        this.toastService.showDanger(this.translateService.instant("common.error.504"));
                        break;
                    case HTTP_STATUS_CODE.DIS_CONNECT:
                        if (window.navigator.onLine)
                            this.toastService.showDanger(this.translateService.instant("common.error.0"));
                        else
                            this.toastService.showDanger(this.translateService.instant("common.error.no-internet"));
                        break;
                }
            }
        }
        return throwError(error);
    }

    /**
     * handleError for export file - toast message
     */
    protected handleErrorMessageFile(mes: any) {
        if (typeof mes == 'string') {
            this.toastService.showDanger(mes);
        } else {
            if (!this.checkUrl(mes.url) && !this.checkErrorCode(mes.error?.error)) {
                switch (mes.status) {
                    case HTTP_STATUS_CODE.BAD_REQUEST:
                        this.toastService.showDanger(this.translateService.instant("common.error.400"));
                        break;
                    case HTTP_STATUS_CODE.UNAUTHORIZED:
                        localStorage.removeItem('access_token');
                        this.toastService.showDanger(this.translateService.instant("common.error.401"));
                        break;
                    case HTTP_STATUS_CODE.FORBIDDEN:
                        this.toastService.showDanger(this.translateService.instant("common.error.403"));
                        break;
                    case HTTP_STATUS_CODE.NOT_FOUND:
                        this.toastService.showDanger(this.translateService.instant("common.error.404"));
                        break;
                    case HTTP_STATUS_CODE.METHOD_NOT_ALLOWED:
                        this.toastService.showDanger(this.translateService.instant("common.error.405"));
                        break;
                    case HTTP_STATUS_CODE.NOT_ACCEPTABLE:
                        this.toastService.showDanger(this.translateService.instant("common.error.406"));
                        break;
                    case HTTP_STATUS_CODE.REQUEST_TIMEOUT:
                        this.toastService.showDanger(this.translateService.instant("common.error.408"));
                        break;
                    case HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR:
                        this.toastService.showDanger(this.translateService.instant("common.error.500"));
                        break;
                    case HTTP_STATUS_CODE.BAD_GATEWAY:
                        this.toastService.showDanger(this.translateService.instant("common.error.502"));
                        break;
                    case HTTP_STATUS_CODE.SERVICE_UNAVAILABLE:
                        this.toastService.showDanger(this.translateService.instant("common.error.503"));
                        break;
                    case HTTP_STATUS_CODE.GATEWAY_TIMEOUT:
                        this.toastService.showDanger(this.translateService.instant("common.error.504"));
                        break;
                    case HTTP_STATUS_CODE.DIS_CONNECT:
                        if (window.navigator.onLine)
                            this.toastService.showDanger(this.translateService.instant("common.error.0"));
                        else
                            this.toastService.showDanger(this.translateService.instant("common.error.no-internet"));
                        break;
                }
            }
        }

        return throwError(mes);
    }

    private noNotifyError: string[] = ['/api/v1/chat', 'api/v1/agents/status'];

    private checkUrl(url: string): boolean {
        for (let bypassUrl of this.noNotifyError) {
            let byPass = url.indexOf(bypassUrl)
            if (byPass >= 0 && !url.indexOf('api/v1/chat-groups')) return true;
        }
        return false;
    }

    private noNotifyErrorCode: number[] = [40320, 40020];

    private checkErrorCode(errorCode: number): boolean {
        return this.noNotifyErrorCode.indexOf(errorCode) >= 0;
    }

    buildHttpParams(params: HttpParams, paramName: string, paramValues: any): HttpParams {
        if (!paramValues && paramValues !== false) {
            return params;
        }
        if (paramValues instanceof Array) {
            for (const item of paramValues) {
                params = params.append(paramName, item);
            }
        } else if (paramValues instanceof Object) {
            for (const key in paramValues) {
                let childParamValues = paramValues[key];
                if (childParamValues instanceof Object) {
                    for (let childKey in childParamValues) {
                        params = params.append(`${key}[${childKey}]`, childParamValues[childKey] ?? '');
                    }
                } else {
                    params = params.append(key, paramValues[key] ?? '');
                }

            }
        } else {
            params = params.append(paramName, paramValues + '');
        }
        return params;
    }

    public buildParams(obj: any): HttpParams {
        return Object.entries(obj || {})
            .reduce((params, [key, value]) => {
                if (value === null) {
                    return params.set(key, String(''));
                } else if (typeof value === typeof {}) {
                    return params.set(key, JSON.stringify(value));
                } else {
                    return params.set(key, String(value));
                }
            }, new HttpParams({ encoder: new CustomEncoder() }));
    }
}

class CustomEncoder implements HttpParameterCodec {
    encodeKey(key: string): string {
        return encodeURIComponent(key);
    }

    encodeValue(value: string): string {
        return encodeURIComponent(value);
    }

    decodeKey(key: string): string {
        return decodeURIComponent(key);
    }

    decodeValue(value: string): string {
        return decodeURIComponent(value);
    }
}
