import {Injectable} from "@angular/core";
import { map } from 'rxjs/operators';
import {AbstractService} from "../abstract.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "../auth/auth.service";
import {TemporalRuleDetail, TemporalRulesSetDetail} from "@core/models/kazoo/temporal.model";
import {KazooCbResponse} from "@core/models/kazoo/kazoo-cb-response.model";
import {ToastService} from "@core/services/toast-service";
import {Observable} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {CbAuthService} from "@core/services/auth/cb-auth.service";

@Injectable({providedIn: 'root'})
export class TemporalService extends AbstractService {

    constructor(private http: HttpClient,
                private authService: AuthService,
                private cbAuthSvc: CbAuthService,
                private toast: ToastService,
                private translate: TranslateService) {
        super(http, authService, toast, translate);
    }

    get SERVICE_URL(): string {
        return `${this.cbAuthSvc.accountURI}`;
    }

    get TEMPORAL_RULES() {
        return this.SERVICE_URL + '/temporal_rules';
    }

    get TEMPORAL_RULES_SETS() {
        return this.SERVICE_URL + '/temporal_rules_sets';
    }

    public listRules(filter?: { paginate?: boolean, filter_cycle?: any, has_key?: any, has_value?: any, key_missing?: any, filter_owner_id?: any, filter_type?: any, filter_name?: any }): Observable<KazooCbResponse> {
        let params = new HttpParams();
        if (filter) {
            params = this.buildHttpParams(params, 'filter_cycle', filter.filter_cycle);
            params = this.buildHttpParams(params, 'has_key', filter.has_key);
            params = this.buildHttpParams(params, 'has_value', filter.has_value);
            params = this.buildHttpParams(params, 'key_missing', filter.key_missing);
            params = this.buildHttpParams(params, 'filter_owner_id', filter.filter_owner_id);
            params = this.buildHttpParams(params, 'filter_type', filter.filter_type);
            params = this.buildHttpParams(params, 'filter_name', filter.filter_name);
            params = this.buildHttpParams(params, 'paginate', filter.paginate);
        }
        return this.getRequest(this.TEMPORAL_RULES, {params: params});
    }

    public getRules(hasKeyFilter?: any, typeFilter?: any): Observable<KazooCbResponse> {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'has_key', hasKeyFilter);
        params = this.buildHttpParams(params, 'filter_type', typeFilter);
        return this.getRequest(this.TEMPORAL_RULES, {params: params});
    }

    public getRuleDetail(id: string): Observable<KazooCbResponse> {
        return this.getRequest(this.TEMPORAL_RULES + this.URL_SEPARATOR + id);
    }

    public saveOrUpdateRule(rule: TemporalRuleDetail): Observable<KazooCbResponse> {
        if (rule.id) {
            return this.postRequest(this.TEMPORAL_RULES + this.URL_SEPARATOR + rule.id, JSON.stringify({data: rule}));
        } else {
            return this.putRequest(this.TEMPORAL_RULES, JSON.stringify({data: rule}));
        }
    }

    public deleteRule(id: string): Observable<KazooCbResponse> {
        return this.deleteRequest(this.TEMPORAL_RULES + this.URL_SEPARATOR + id);
    }

    public getRulesSets(hasKeyFilter?: any, typeFilter?: any): Observable<KazooCbResponse> {
        let params = new HttpParams();
        params = this.buildHttpParams(params, 'has_key', hasKeyFilter);
        params = this.buildHttpParams(params, 'filter_type', typeFilter);
        return this.getRequest(this.TEMPORAL_RULES_SETS, {params: params});
    }

    public getRulesSetDetail(id: string): Observable<KazooCbResponse> {
        return this.getRequest(this.TEMPORAL_RULES_SETS + this.URL_SEPARATOR + id);
    }

    public saveRulesSet(rulesSet: TemporalRulesSetDetail): Observable<KazooCbResponse> {
        return this.putRequest(this.TEMPORAL_RULES_SETS, JSON.stringify({data: rulesSet}));
    }

    public deleteRulesSet(id: string): Observable<KazooCbResponse> {
        return this.deleteRequest(this.TEMPORAL_RULES_SETS + this.URL_SEPARATOR + id);
    }
}
