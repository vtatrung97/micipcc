import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import {AbstractKazooService} from './abstract-kazoo.service';
import {Observable} from 'rxjs';
import {Observer} from "rxjs";
import {ToastService} from "@core/services/toast-service";
import {KazooCbResponse} from "@core/models/kazoo/kazoo-cb-response.model";
import {MenuSummary} from "@core/models/menu-summary.model";
import {CfMenuElement} from "@core/models/kazoo/callflow/cf-menu-element.model";
import {CfUserElement} from "@core/models/kazoo/callflow/cf-user-element.model";
import {CfVoicemailElement} from "@core/models/kazoo/callflow/cf-voicemail-element.model";
import {CallflowDetail} from "@core/models/kazoo/callflow.model";
import {CALLFLOW, MENU} from "../../../app.constants";
import {TranslateService} from "@ngx-translate/core";
import {CbAuthService} from "@core/services/auth/cb-auth.service";

@Injectable({providedIn: 'root'})
export class Callflows2Service extends AbstractKazooService {

    constructor(private http: HttpClient,
                private authService: AuthService,
                private cbAuthSvc: CbAuthService,
                private toast: ToastService,
                private translate: TranslateService) {
        super(http, authService, toast, translate);
    }

    get SERVICE_URL(): string {
        return `${this.cbAuthSvc.accountURI}/callflows`;
    }

    public listMainCallflows() {
        return this.list({filter_type: 'main', paginate: false});
    }

    public getAccountMainCallflow(): Observable<CallflowDetail> {
        return Observable.create((observer: Observer<CallflowDetail>) => {
            this.list({filter_type: 'main', filter_name: CALLFLOW.ACCOUNT_MAIN_CALLFLOW_NAME}).subscribe(
                res => {
                    if (res.data.length === 0) {
                        // @ts-ignore
                        observer.next(null);
                        observer.complete();
                    } else {
                        this.get(res.data[0].id).subscribe(
                            res2 => {
                                observer.next(res2.data);
                                observer.complete();
                            },
                            error => {
                                observer.error(error);
                                observer.complete();
                            }
                        );
                    }
                },
                error => {
                    observer.error(error);
                    observer.complete();
                }
            );
        });
    }

    public createMainCallflow(number: string, mainMenus: MenuSummary[]): Observable<KazooCbResponse> {
        const callflow = new CallflowDetail([number], {module: '', data: null, children: null}, null, null, 'main');
        switch (number) {
            case CALLFLOW.MAIN_OPEN_HOURS:
                callflow.flow = new CfMenuElement(mainMenus.filter(menu => menu.name === MENU.MAIN_OPEN_HOURS_MENU)[0].id);
                break;
            case CALLFLOW.MAIN_LUNCH_HOURS:
                callflow.flow = new CfMenuElement(mainMenus.filter(menu => menu.name === MENU.MAIN_LUNCH_HOURS_MENU)[0].id);
                break;
            case CALLFLOW.MAIN_AFTER_HOURS:
                callflow.flow = new CfMenuElement(mainMenus.filter(menu => menu.name === MENU.MAIN_AFTER_HOURS_MENU)[0].id);
                break;
            case CALLFLOW.MAIN_HOLIDAYS:
                callflow.flow = new CfMenuElement(mainMenus.filter(menu => menu.name === MENU.MAIN_HOLIDAYS_MENU)[0].id);
                break;
        }
        return this.saveOrUpdate(callflow);
    }

    public createAccountMainCallflow(mainOpenHoursCallflowId: string) {
        const callflow = new CallflowDetail(['0'], {module: '', data: null, children: null}, null, null, 'main');
        callflow.name = CALLFLOW.ACCOUNT_MAIN_CALLFLOW_NAME;
        callflow.flow = {
            module: "temporal_route",
            data: {rules: []},
            children: {
                "_": {
                    "module": "callflow",
                    "children": {},
                    "data": {"id": mainOpenHoursCallflowId}
                }
            }
        };
        return this.saveOrUpdate(callflow);
    }

    public createUserCallflow(number: string, userId: string, vmboxId?: string): Observable<KazooCbResponse> {
        const userCallflow = new CallflowDetail([number], {module: '', data: null, children: null}, null, userId, CALLFLOW.USER_CALLFLOW_TYPE);
        userCallflow.flow = new CfUserElement(userId, 20);
        if (vmboxId) {
            userCallflow.flow.children['_'] = new CfVoicemailElement(vmboxId);
        }
        return this.saveOrUpdate(userCallflow);
    }
}
