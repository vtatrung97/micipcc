import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SERVICES} from "@env/environment";
import { CallbackDetailModel } from '@core/models/monitor/missed-call-monitor.model';

@Injectable({ providedIn: 'root' })
export class CallbackSessionService {

    get SERVICE_API_URL(): string {
        return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/callback-session`;
    }

    get SERVICE_API_URL_CALLBACK_DETAIL(): string {
        return `${SERVICES.CCMS_SERVICE_API.url}/api/v1/callback-detail`;
    }

    constructor(private http: HttpClient) {}
}
