import {Injectable} from "@angular/core";
import {Observable, Subject} from "rxjs";

export interface Message {
    action: number;
    callId: string;
}

@Injectable({providedIn: 'root'})
export class WebphoneService {
    private message$: Subject<Message>
    private calloutMessage$: Subject<string>

    constructor() {
        this.message$ = new Subject<Message>();
        this.calloutMessage$ = new Subject<string>();
    }

    public publish(message: Message): void {
        this.message$.next(message);
    }

    public getMessage(): Observable<any> {
        return this.message$.asObservable();
    }

    publishCallout(data: any) {
        this.calloutMessage$.next(data);
    }

    public getCalloutMessage(): Observable<any> {
        return this.calloutMessage$.asObservable();
    }

}
