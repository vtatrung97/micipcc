import {Injectable} from "@angular/core";
import {Subject} from "rxjs";

@Injectable({ providedIn: 'root' })
export class TranferCallService {
    private tranferCallSwitcher = new Subject<boolean>();
    public publishEvent(event: boolean) {
        this.tranferCallSwitcher.next(event)
    }
    public getEvents() {
        return this.tranferCallSwitcher.asObservable();
    }
}
