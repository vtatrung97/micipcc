import {Subject} from "rxjs";
import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class QueueDigitalEventService {
    private queueMonitorEvent: Subject<any> = new Subject()
    queueMonitorEvent$ = this.queueMonitorEvent.asObservable()

    constructor() {
    }

    public publicQueueMonitorEvent(event: any) {
        this.queueMonitorEvent.next(event)
    }

}
