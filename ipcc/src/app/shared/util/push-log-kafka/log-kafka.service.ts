import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { LogKafkaActionDTO } from '@shared/util/push-log-kafka/log-kafka-action.dto';
import { SERVICES } from '@env/environment';

@Injectable({
    providedIn: 'root'
})
export class LogKafkaService {

    private readonly SERVICE_URL =
        `${SERVICES.CCMS_SERVICE_API.url}/api/v1/push-log-kafka`;

    constructor(
        private http: HttpClient
    ) {}

    log(payload: LogKafkaActionDTO): Observable<void> {
        return this.http.post<void>(this.SERVICE_URL, payload);
    }

    pushLogKafka(
        callId: string,
        from: string,
        to: string,
        type: string,
        description?: string
    ): void {

        const payload: LogKafkaActionDTO = {
            callId,
            from,
            to,
            type,
            description
        };

        this.log(payload).subscribe({
            next: () => console.debug('LogKafka sent successfully'),
            error: err => console.error('LogKafka error', err)
        });
    }
}
