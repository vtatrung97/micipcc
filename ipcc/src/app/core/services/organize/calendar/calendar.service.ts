import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ResponseEnvelope } from "@core/models/response.model";
import { AbstractService } from "@core/services/abstract.service";
import { AuthService } from "@core/services/auth/auth.service";
import { ToastService } from "@core/services/toast-service";
import { Observable } from "rxjs";
import { SERVICES } from "../../../../../environments/environment";
import { ServiceCalendar } from "@core/models/organize/calendar/calendar.model";
import { TranslateService } from "@ngx-translate/core";

@Injectable({ providedIn: 'root' })
export class CalendarService extends AbstractService {

    credentials: any = {};

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private toastSvc: ToastService,
        private translate: TranslateService
    ) {
        super(http, toastSvc, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/calendars`;
    }

    getCalendar() {
        return `${this.SERVICE_URL}`;
    }

    getCalendarById(calendarId?: string): Observable<ResponseEnvelope<any>> {
        return this.getRequest(`${this.SERVICE_URL}/${calendarId}`)
    }

    createCalendar(object: ServiceCalendar): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}`, object)
    }

    updateCalendar(object: ServiceCalendar): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/${object.calendarId}`, object)
    }

    deleteCalendar(id: any) {
        return this.postRequest(`${this.SERVICE_URL}/delete/${id}`);
    }

    deleteListCalendar(object: any): Observable<ResponseEnvelope<any>> {
        return this.deleteRequest(`${this.SERVICE_URL}`, object)
    }
}
