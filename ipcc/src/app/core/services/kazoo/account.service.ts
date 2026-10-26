import {Injectable} from "@angular/core";
import { map } from 'rxjs/operators';
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "../auth/auth.service";
import {AbstractKazooService} from "./abstract-kazoo.service";
import {KazooCbResponse} from "../../models/kazoo/kazoo-cb-response.model";
import {Observable} from "rxjs";
import {Observer} from "rxjs";
import {CALLFLOW, DEFAULT_ACCOUNT_LIMITS, DEFAULT_ACCOUNT_TOKEN_RESTRICTIONS, MENU, USER} from "../../../app.constants";
import {CallflowDetail} from "../../models/kazoo/callflow.model";
import {LimitModel} from "../../models/account/limit.model";
import {MenuSummary} from "../../models/menu-summary.model";
import {MenuService} from "./menu.service";
import {CallflowSummary} from "../../models/callflow-summary.model";
import {Callflows2Service} from "./callflows2.service";
import {ToastService} from "@core/services/toast-service";
import {catchError} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";
import {CbAuthService} from "@core/services/auth/cb-auth.service";

@Injectable({providedIn: 'root'})
export class KazooAccountService extends AbstractKazooService {

    constructor(private http: HttpClient,
                private authService: AuthService,
                private cbAuthSvc: CbAuthService,
                private menuService: MenuService,
                private callflowService: Callflows2Service,
                private toast: ToastService,
                private translate: TranslateService) {
        super(http, authService, toast, translate);
    }

    get SERVICE_URL(): string {
        return `${this.cbAuthSvc.crossbar}/v2/accounts`;
    }

    private initializer = {
        onError: (observer: Observer<any>, error: any) => {
            observer.error(error);
            observer.complete();
        },
        patchAccount: (accountId: string, patchObject: any, observer: Observer<any>, returnObject: any) => {
            this.patch(accountId, patchObject).subscribe(res => {
                console.log('[initializer] patch account object success, patchObject:', patchObject);
                console.log('[initializer] patch account object success, returnObject:', returnObject);
                observer.next(returnObject);
                observer.complete();
            }, error => this.initializer.onError(observer, error));
        },

        step1_CheckAndInitMainMenus: (accountId: string) => {
            return Observable.create((observer: Observer<MenuSummary[]>) => {
                console.log("[initializer - 1] checkAndInit for MAIN_MENUS: ", MENU.MAIN_MENUS);
                const mainMenus: MenuSummary[] = [];
                const callback = (menu: MenuSummary) => {
                    mainMenus.push(menu);
                    (mainMenus.length === MENU.MAIN_MENUS.length) && this.initializer.patchAccount(accountId, {mycc_help: {main_menus: true}}, observer, mainMenus);
                };

                this.menuService.listMainMenus().subscribe(res => {
                    console.log("[initializer - 1] list MAIN_MENUS:", res.data);
                    MENU.MAIN_MENUS.forEach(menuName => {
                        const temp = res.data.filter((menu: { name: string; }) => menu.name === menuName);
                        if (temp.length > 0) {
                            console.log(`[initializer - 1] found one of MAIN_MENUS:`, menuName);
                            callback(temp[0]);
                        } else {
                            console.log(`[initializer - 1] create one of MAIN_MENUS:`, menuName);
                            this.menuService.createMainMenu(menuName).subscribe((res2: { data: any; }) => callback(res2.data), (error: any) => this.initializer.onError(observer, error));
                        }
                    });
                }, error => this.initializer.onError(observer, error));
            });
        },

        step2_CheckAndInitHoursCallflows: (accountId: string, mainMenus: MenuSummary[]) => {

            return Observable.create((observer: Observer<CallflowSummary[]>) => {
                console.log("[initializer - 2] checkAndInit for HOURS_CALLFLOWS: ", CALLFLOW.MAIN_CALLFLOWS);
                const hoursCallflows: CallflowSummary[] = [];
                const callback = (callflow: any) => {
                    hoursCallflows.push(callflow);
                    (hoursCallflows.length === CALLFLOW.MAIN_CALLFLOWS.length) && this.initializer.patchAccount(accountId, {mycc_help: {hours_callflows: true}}, observer, hoursCallflows);
                };

                this.callflowService.listMainCallflows().subscribe(res => {
                    console.log("[initializer - 2] list HOURS_CALLFLOWS:", res.data);
                    CALLFLOW.MAIN_CALLFLOWS.forEach(cfNumber => {
                        const temp = res.data.filter((cf: { numbers: string | string[]; }) => cf.numbers.indexOf(cfNumber) > -1);
                        if (temp.length > 0) {
                            console.log(`[initializer - 2] found one of HOURS_CALLFLOWS:`, cfNumber);
                            callback(temp[0]);
                        } else {
                            console.log(`[initializer - 2] create one of HOURS_CALLFLOWS:`, cfNumber);
                            this.callflowService.createMainCallflow(cfNumber, mainMenus).subscribe((res2: { data: any; }) => callback(res2.data), (error: any) => this.initializer.onError(observer, error));
                        }
                    });
                }, error => this.initializer.onError(observer, error));
            });
        },

        step3_CheckAndInitMainCallflow: (accountId: string, hoursCallflows: CallflowSummary[]) => {
            return Observable.create((observer: Observer<boolean>) => {
                console.log("[initializer - 3] checkAndInit for MAIN_CALLFLOW (callflow with number 0)");
                const callback = () => this.initializer.patchAccount(accountId, {mycc_help: {main_callflow: true}}, observer, true);

                this.callflowService.listMainCallflows().subscribe(res => {
                    console.log("[initializer - 3] list MAIN_CALLFLOWS:", res.data);
                    const temp = res.data.filter((cf: { numbers: string | string[]; }) => cf.numbers.indexOf('0') > -1);
                    if (temp.length > 0) {
                        console.log(`[initializer - 3] found MAIN_CALLFLOW (callflow with number 0):`, temp[0]);
                        callback();
                    } else {
                        console.log(`[initializer - 3] create MAIN_CALLFLOW (callflow with number 0)`);

                        const tempList = hoursCallflows.filter(temp => temp.numbers.indexOf(CALLFLOW.MAIN_OPEN_HOURS) > -1);
                        if (tempList.length > 0) {
                            this.callflowService.createAccountMainCallflow(tempList[0].id).subscribe(res2 => callback(), error => this.initializer.onError(observer, error));
                        } else {
                            console.error(`[initializer - 3] not found MAIN_OPEN_HOURS_CALLFLOW`);
                            observer.error("MAIN_OPEN_HOURS_CALLFLOW_NOT_FOUND");
                            observer.complete();
                        }
                    }
                }, error => this.initializer.onError(observer, error));
            });
        },

        step4_CheckAndInitNoMatchCallflow: (accountId: string) => {
            return Observable.create((observer: Observer<boolean>) => {
                console.log("[initializer - 4] checkAndInit for NO_MATCH_CALLFLOW");
                const callback = () => this.initializer.patchAccount(accountId, {mycc_help: {no_match_callflow: true}}, observer, true);

                this.callflowService.list({paginate: false}).subscribe(res => {
                    console.log("[initializer - 4] list CALLFLOWS:", res.data);
                    const temp = res.data.filter((cf: { numbers: string | string[]; }) => cf.numbers.indexOf('no_match') > -1);
                    if (temp.length > 0) {
                        console.log(`[initializer - 4] found NO_MATCH_CALLFLOW (callflow with number no_match):`, temp[0]);
                        callback();
                    } else {
                        console.log(`[initializer - 4] create NO_MATCH_CALLFLOW (callflow with number no_match)`);
                        const flow = {
                            children: {},
                            data: {},
                            module: 'offnet' // global (or system-wide) resource
                            //module: 'resources' // per-account resource
                        };
                        const nomatchCallflow = new CallflowDetail(['no_match'], flow, null, null, 'no_match');
                        this.http.put(`${this.SERVICE_URL}/${accountId}/callflows`, JSON.stringify({data: nomatchCallflow}))
                            .subscribe(() => callback(), error => this.initializer.onError(observer, error));
                    }
                }, error => this.initializer.onError(observer, error));
            });
        },

        step5_CheckAndInitAccountLimits: (accountId: string) => {
            return Observable.create((observer: Observer<boolean>) => {
                console.log("[initializer - 5] checkAndInit for ACCOUNT_LIMITS");
                const callback = () => this.initializer.patchAccount(accountId, {mycc_help: {account_limits: true}}, observer, true);

                this.http.get(`${this.SERVICE_URL}/${accountId}/limits`).subscribe((res: any) => {
                        console.log("[initializer - 5] list ACCOUNT_LIMITS:", res.data);
                        let currentLimit: LimitModel = res.data;
                        if (currentLimit.version == DEFAULT_ACCOUNT_LIMITS.version) {
                            console.log(`[initializer - 5] found ACCOUNT_LIMITS (with version ${DEFAULT_ACCOUNT_LIMITS.version}):`, currentLimit);
                            callback();
                        } else {
                            console.log(`[initializer - 5] mismatch version, create ACCOUNT_LIMITS: `, DEFAULT_ACCOUNT_LIMITS);
                            this.http.post(`${this.SERVICE_URL}/${accountId}/limits`, JSON.stringify({data: DEFAULT_ACCOUNT_LIMITS}))
                                .subscribe(res2 => callback(), error => this.initializer.onError(observer, error));
                        }
                    }
                    , error => this.initializer.onError(observer, error));
            });
        },

        step6_CheckAndInitTokenRestrictions: (accountId: string) => {
            return Observable.create((observer: Observer<boolean>) => {
                console.log("[initializer - 6] checkAndInit for ACCOUNT_TOKEN_RESTRICTIONS");
                const callback = () => this.initializer.patchAccount(accountId, {mycc_help: {account_token_restrictions: true}}, observer, true);


                const initDefaultRestrictions = () =>
                    this.http.post(`${this.SERVICE_URL}/${accountId}/token_restrictions`, JSON.stringify({data: DEFAULT_ACCOUNT_TOKEN_RESTRICTIONS}))
                        .subscribe(saveRes => callback(), error => this.initializer.onError(observer, error));

                this.http.get(`${this.SERVICE_URL}/${accountId}/token_restrictions`).subscribe((res: any) => {
                        console.log("[initializer - 6] list ACCOUNT_TOKEN_RESTRICTIONS:", res.data);
                        if (res.data && res.data.hasOwnProperty('restrictions')) {
                            const version = res.data.hasOwnProperty('version') ? res.data['version'] : null;
                            if (version == DEFAULT_ACCOUNT_TOKEN_RESTRICTIONS.version) {
                                console.log(`[initializer - 6] found ACCOUNT_TOKEN_RESTRICTIONS (with version ${version}):`, res.data);
                                callback();
                            } else {
                                console.log(`[initializer - 6] mismatch version, create ACCOUNT_TOKEN_RESTRICTIONS`);
                                initDefaultRestrictions();
                            }
                        } else {
                            console.log(`[initializer - 6] not found 'restrictions', create ACCOUNT_TOKEN_RESTRICTIONS`);
                            initDefaultRestrictions();
                        }
                    }
                    , error => initDefaultRestrictions()
                );
            });
        },

        step7_CheckAndInitMetaflows: (accountId: string) => {
            return Observable.create((observer: Observer<boolean>) => {
                console.log("[initializer - 7] checkAndInit for ACCOUNT_METAFLOWS");
                const callback = () => this.initializer.patchAccount(accountId, {mycc_help: {account_metaflows: true}}, observer, true);

                const initDefault = () => {
                    const defaultMetaflow: any = {
                        'cbcc_version': '20181018',
                        'binding_digit': '*',
                        'numbers': {
                            '40': {
                                'data': {},
                                'module': 'hangup'
                            }
                        },
                        'patterns': {
                            '2(\\d+)': {
                                'module': 'transfer'
                                , 'data': {'transfer_type': 'blind', 'takeback_dtmf': '*1*1'}
                            }
                        }
                    };
                    this.http.post(`${this.SERVICE_URL}/${accountId}/metaflows`, JSON.stringify({data: defaultMetaflow}))
                        .subscribe(saveRes => callback(), error => this.initializer.onError(observer, error));
                };

                this.http.get(`${this.SERVICE_URL}/${accountId}/metaflows`).subscribe((res: any) => {
                        console.log("[initializer - 7] list ACCOUNT_METAFLOWS:", res.data);
                        if (res.data && res.data.hasOwnProperty('binding_digit')) {
                            console.log(`[initializer - 7] found ACCOUNT_METAFLOWS:`, res.data);
                            callback();
                        } else {
                            console.log(`[initializer - 7] not found 'binding_digit', create ACCOUNT_METAFLOWS`);
                            initDefault();
                        }
                    }
                    , error => this.initializer.onError(observer, error)
                );
            });
        }
    };

    firstLoginCheckAndInit(accountId: string, myccHelp: { main_menus: any; hours_callflows: any; main_callflow: any; no_match_callflow: any; account_limits: any; account_token_restrictions: any; account_metaflows: any; }) {
        return Observable.create((observer: Observer<number>) => {
            const onError = (observer: Observer<any>, error: any) => {
                observer.error(error);
                observer.complete();
            };

            const step1 = () => {
                observer.next(20);
                this.initializer.step1_CheckAndInitMainMenus(accountId).subscribe((res: any) => step2(res), (error: any) => onError(observer, error));
            };
            const step2 = (mainMenus: MenuSummary[]) => {
                observer.next(40);
                this.initializer.step2_CheckAndInitHoursCallflows(accountId, mainMenus).subscribe((res: any) => step3(res), (error: any) => onError(observer, error));
            };
            const step3 = (hoursCallflows: CallflowSummary[]) => {
                observer.next(60);
                this.initializer.step3_CheckAndInitMainCallflow(accountId, hoursCallflows).subscribe((res: any) => step4(), (error: any) => onError(observer, error));
            };
            const step4 = () => {
                observer.next(70);
                this.initializer.step4_CheckAndInitNoMatchCallflow(accountId).subscribe((res: any) => step5(), (error: any) => onError(observer, error));
            };
            const step5 = () => {
                observer.next(80);
                this.initializer.step5_CheckAndInitAccountLimits(accountId).subscribe((res: any) => step6(), (error: any) => onError(observer, error));
            };
            const step6 = () => {
                observer.next(90);
                this.initializer.step6_CheckAndInitTokenRestrictions(accountId).subscribe((res: any) => step7(), (error: any) => onError(observer, error));
            };
            const step7 = () => {
                observer.next(95);
                this.initializer.step7_CheckAndInitMetaflows(accountId).subscribe((res: any) => step8(), (error: any) => onError(observer, error));
            };
            const step8 = () => {
                observer.next(100);
                // observer.complete;
            };

            if (this.authService.privLevel == USER.PRIV_LEVEL.ADMIN
                && (!myccHelp || !(myccHelp.main_menus && myccHelp.hours_callflows && myccHelp.main_callflow && myccHelp.no_match_callflow && myccHelp.account_limits && myccHelp.account_token_restrictions && myccHelp.account_metaflows))) {
                step1();
            } else {
                console.log("no need run initializer for this account");
                observer.next(100);
                // observer.complete;
            }
        });
    }

    getChildren(): Observable<KazooCbResponse> {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'paginate', false);
        return this.http.get<KazooCbResponse>(`${this.SERVICE_URL}/${this.authService.kzAccountId}/children`, {params: params})
            .pipe(catchError(error => this.handleError(error)));
    }

    getStorageSetting(accountId: string): Observable<any> {
        return this.http.get(`${this.SERVICE_URL}/${accountId}/storage`);
    }

    saveOrUpdateStorageSetting(accountId: string, object: any): Observable<KazooCbResponse> {
        if (object.id) {
            return this.http.post<KazooCbResponse>(`${this.SERVICE_URL}/${accountId}/storage`, JSON.stringify({data: object}))
                .pipe(catchError(error => this.handleError(error)));
        } else {
            return this.http.put<KazooCbResponse>(`${this.SERVICE_URL}/${accountId}/storage`, JSON.stringify({data: object}))
                .pipe(catchError(error => this.handleError(error)));
        }
    }
}
