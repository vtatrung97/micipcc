import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from "rxjs";
import {SERVICES} from "@env/environment";
import {ResponseEnvelope} from "@core/models/response.model";
import {ToastService} from "@core/services/toast-service";
import {AbstractService} from "@core/services/abstract.service";
import {TranslateService} from "@ngx-translate/core";
import {SeatNumber} from "../../../layouts/topbar/seat-number/seat-number.model";


@Injectable({providedIn: 'root'})
export class SeatNumberService extends AbstractService {

    constructor(private http: HttpClient,
                private toastSvc: ToastService,
                private translate: TranslateService) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.CCMS_SERVICE_API.url}`;
    }

    getSeatNumberOfCurrentUser(): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/api/v1/seat-number/self`);
    }

    setSeatNumberForCurrentUser(seatNumber: SeatNumber): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/api/v1/seat-number/set`, seatNumber);
    }

    setSeatNumberForAgent(seatNumber: SeatNumber): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/api/v1/seat-number/set`, seatNumber);
    }

}
