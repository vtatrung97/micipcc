import {Injectable} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {filter, map} from "rxjs/operators";

interface Message {
    topic: string;
    data: any;
}

@Injectable({providedIn: 'root'})
export class MessagingService {
    private message: Subject<Message>;

    constructor() {
        this.message = new Subject<Message>();
    }

    public publish(message: Message): void {
        this.message.next(message);
    }

    public of(topic: any): Observable<any> {
        return this.message.asObservable().pipe(
            filter((m: any) => m.topic == topic),
            map((m: any) => m.data)
        )
    }
}
