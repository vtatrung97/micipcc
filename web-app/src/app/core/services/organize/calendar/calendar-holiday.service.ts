import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ResponseEnvelope } from "@core/models/response.model";
import { AbstractService } from "@core/services/abstract.service";
import { AuthService } from "@core/services/auth/auth.service";
import { ToastService } from "@core/services/toast-service";
import { Observable } from "rxjs";
import { SERVICES } from "../../../../../environments/environment";
import { ServiceHoliday } from "@core/models/organize/calendar/calendar.model";
import { TranslateService } from "@ngx-translate/core";

@Injectable({ providedIn: 'root' })
export class CalendarHolidayService extends AbstractService {

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
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/calendar-holidays`;
    }

    getCalendarHoliday() {
        return `${this.SERVICE_URL}`;
    }

    createCalendarHoliday(object: ServiceHoliday): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}`, object)
    }

    updateCalendarHoliday(object: ServiceHoliday): Observable<ResponseEnvelope<any>> {
        return this.postRequest(`${this.SERVICE_URL}/${object.calendarHolidayId}/${object.calendarId}`, object)
    }

    deleteCalendarHoliday(id: any) {
        return this.deleteRequest(`${this.SERVICE_URL}/${id}`);
    }

    deleteListCalendarHoliday(object: any): Observable<ResponseEnvelope<any>> {
        return this.deleteRequest(`${this.SERVICE_URL}`, object)
    }
}
