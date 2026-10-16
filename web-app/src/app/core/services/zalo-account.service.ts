import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SERVICES } from '@env/environment';

export interface SelectOptionDTO {
    id: string;
    name: string;
}

export interface ZaloOaReminderConfigDTO {
    zaloAccountId: string;
    oaId: string;
    oaName: string;

    isEnabled: number;

    cycleDay?: string | null;
    scheduleDays?: number | null;
    scheduleTime?: number | null;

    title?: string | null;
    content?: string | null;

    smsEnabled: number;
    smsGroupRecipients?: string | null;

    emailEnabled: number;
    emailGroupRecipients?: string | null;

    inappEnabled: number;
    inappUserIds: string[];
}

export interface ZaloOaReminderSaveRequest {
    enabled: boolean;

    cycleDay?: string | null;
    scheduleDays?: number | null;
    scheduleTime?: number | null;

    title?: string | null;
    content?: string | null;

    smsEnabled: boolean;
    smsGroupRecipients?: string | null;

    emailEnabled: boolean;
    emailGroupRecipients?: string | null;

    inappEnabled: boolean;
    inappUserIds: string[];
}

@Injectable({ providedIn: 'root' })
export class ZaloAccountService {
    constructor(private http: HttpClient) {}

    get SERVICE_URL(): string {
        return `${SERVICES.CHAT_SERVICE_API.url}/api/v1/zalo-accounts`;
    }

    getReminderConfig(oaId: string): Observable<any> {
        return this.http.get<any>(
            `${this.SERVICE_URL}/${oaId}/reminder-config`
        );
    }

    saveReminderConfig(oaId: string, body: ZaloOaReminderSaveRequest): Observable<any> {
        return this.http.put<any>(
            `${this.SERVICE_URL}/${oaId}/reminder-config`,
            body
        );
    }

    getSmsGroups(): Observable<any> {
        return this.http.get<any>(
            `${SERVICES.CCMS_SERVICE_API.url}/api/v1/social-alert/options/sms-groups`
        );
    }

    getEmailGroups(): Observable<any> {
        return this.http.get<any>(
            `${SERVICES.TICKET_SERVICE_API.url}/api/v1/social-alert/options/email-groups`
        );
    }

    getAlertAgents(): Observable<any> {
        return this.http.get<any>(
            `${SERVICES.ACD_SERVICE_API.url}/api/v1/agents`
        );
    }

}
