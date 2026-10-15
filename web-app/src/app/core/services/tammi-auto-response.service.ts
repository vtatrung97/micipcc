import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SERVICES} from '@env/environment';
import {UpdateTammiMessageDefault} from '@models/tammi/tammi-message-default.model';

@Injectable({providedIn: 'root'})
export class TammiAutoResponseService {
    constructor(private http: HttpClient) {
    }

    get ACCOUNTS_URL(): string {
        return `${SERVICES.CHAT_SERVICE_API.url}/api/v1/tammi/accounts`;
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CHAT_SERVICE_API.url}/api/v1/tammi/auto-response`;
    }

    getAutoResponseConfig(domainId: string): Observable<any> {
        return this.http.get<any>(`${this.SERVICE_URL}/${domainId}`);
    }

    updateAutoResponseConfig(domainId: string, data: UpdateTammiMessageDefault): Observable<any> {
        return this.http.put<any>(`${this.SERVICE_URL}/${domainId}`, data);
    }
}
