import {Observable} from 'rxjs';
import {AbstractService} from '../abstract.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {KazooCbResponse} from '../../models/kazoo/kazoo-cb-response.model';
import {Observer} from 'rxjs';
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {AuthService} from "@core/services/auth/auth.service";

export abstract class AbstractKazooService extends AbstractService {

    protected constructor(private httpClientKz: HttpClient,
                          private authSvc: AuthService,
                          private toastServiceKz: ToastService,
                          private translateServiceKz: TranslateService) {
        super(httpClientKz, toastServiceKz, translateServiceKz);
    }

    public override list(filter?: {
        start_key?: any, paginate?: boolean, has_key?: any, has_value?: any, key_missing?: any,
        filter_owner_id?: any, filter_type?: any, filter_name?: any, page_size?: any,
        realmName?: any, groupId?: any
    }): Observable<KazooCbResponse> {
        // let groupId =localStorage.getItem('selectedServiceOwner');
        // let realmName = this.authSvc.realmName
        let params = new HttpParams();
        if (filter) {
            params = this.buildHttpParams(params, 'start_key', filter.start_key);
            params = this.buildHttpParams(params, 'has_key', filter.has_key);
            params = this.buildHttpParams(params, 'has_value', filter.has_value);
            params = this.buildHttpParams(params, 'key_missing', filter.key_missing);
            params = this.buildHttpParams(params, 'filter_owner_id', filter.filter_owner_id);
            params = this.buildHttpParams(params, 'filter_type', filter.filter_type);
            params = this.buildHttpParams(params, 'filter_name', filter.filter_name);
            params = this.buildHttpParams(params, 'paginate', filter.paginate);
            params = this.buildHttpParams(params, 'page_size', filter.page_size);
            // params = this.buildHttpParams(params, 'filter_realmName', realmName);
            // params = this.buildHttpParams(params, 'filter_groupId', groupId);
        }
        return this.getRequest(this.SERVICE_URL, {params: params});
    }

    public override get(id: string): Observable<KazooCbResponse> {
        return this.getRequest(`${this.SERVICE_URL}/${id}`);
    }

    public override saveOrUpdate(object: any): Observable<KazooCbResponse> {
        // object.groupId =localStorage.getItem('selectedServiceOwner');
        // object.realmName = this.authSvc.realmName
        if (object.id) {
            return this.postRequest(`${this.SERVICE_URL}/${object.id}`, JSON.stringify({data: object}));
        } else {
            return this.putRequest(`${this.SERVICE_URL}`, JSON.stringify({data: object}));
        }
    }

    public patch(id: string, object: any): Observable<KazooCbResponse> {
        return this.patchRequest(`${this.SERVICE_URL}/${id}`, JSON.stringify({data: object}));
    }

    public override delete(id: string): Observable<KazooCbResponse> {
        return this.deleteRequest(`${this.SERVICE_URL}/${id}`);
    }

    public deleteByOwner(ownerId: string): Observable<any> {
        return Observable.create((observer: Observer<any>) => {
            let count = 0;
            this.list({paginate: false, filter_owner_id: ownerId}).subscribe(
                (res: { data: any[]; }) => {
                    const retValue = {error: 0, successList: [], failList: []};
                    if (res.data.length === 0) {
                        observer.next(retValue);
                        observer.complete();
                    } else {
                        res.data.forEach((obj) =>
                            this.delete(obj.id).subscribe(
                                (res2: any) => {
                                    // @ts-ignore
                                    return retValue.successList.push(obj.id);
                                },
                                (error: any) => {
                                    retValue.error = retValue.error + 1;
                                    // @ts-ignore
                                    retValue.failList.push({id: obj.id, error: error});
                                },
                                () => {
                                    count += 1;
                                    if (count === res.data.length) {
                                        observer.next(retValue);
                                        observer.complete();
                                    }
                                }
                            )
                        );
                    }
                },
                (error: any) => {
                    observer.error(error);
                    observer.complete();
                }
            );
        });
    }

    public unassignOwner(ownerId: string): Observable<any> {
        return Observable.create((observer: Observer<any>) => {
            let count = 0;
            this.list({paginate: false, filter_owner_id: ownerId}).subscribe(
                (res: { data: { id: string; }[]; }) => {
                    const retValue = {error: 0, successList: [], failList: []};
                    if (res.data.length === 0) {
                        observer.next(retValue);
                        observer.complete();
                    } else {
                        res.data.forEach((summary: { id: string; }) => {
                            this.get(summary.id).subscribe(
                                (res2: { data: any; }) => {
                                    const obj = res2.data;
                                    delete obj['owner_id'];
                                    this.saveOrUpdate(obj).subscribe(
                                        () => {
                                            // @ts-ignore
                                            return retValue.successList.push(obj.id);
                                        },
                                        (error: any) => {
                                            retValue.error = retValue.error + 1;
                                            // @ts-ignore
                                            retValue.failList.push({id: obj.id, error: error});
                                        },
                                        () => {
                                            count += 1;
                                            if (count === res.data.length) {
                                                observer.next(retValue);
                                                observer.complete();
                                            }
                                        }
                                    );
                                },
                                (error: any) => {
                                    retValue.error = retValue.error + 1;
                                    // @ts-ignore
                                    retValue.failList.push({id: summary.id, error: error});
                                    count += 1;
                                    if (count === res.data.length) {
                                        observer.next(retValue);
                                        observer.complete();
                                    }
                                }
                            );
                        });
                    }
                },
                (error: any) => {
                    observer.error(error);
                    observer.complete();
                }
            );
        });
    }

    protected _searchByName(accountURI: string, document_type: string, filter: { search_string?: any, start_key?: any, page_size?: any }) {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 't', document_type);
        params = this.buildHttpParams(params, 'q', 'name');
        params = this.buildHttpParams(params, 'v', filter.search_string);
        params = this.buildHttpParams(params, 'start_key', filter.start_key);
        params = this.buildHttpParams(params, 'page_size', filter.page_size);
        return this.getRequest(`${accountURI}/search`, {params: params});
    }

    abstract override get SERVICE_URL(): string;
}
