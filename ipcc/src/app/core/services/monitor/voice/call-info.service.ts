import {Injectable} from "@angular/core";
import {Subject} from "rxjs";

@Injectable({ providedIn: 'root' })
export class CallInfoService{
    private callInfoSwitcher = new Subject<boolean>();
    public publishEvent(event: boolean) {
        this.callInfoSwitcher.next(event)
    }
    public getEvents() {
        return this.callInfoSwitcher.asObservable();
    }

    private calloutInfoSwitcher = new Subject<boolean>();
    public publishCalloutEvent(event: boolean) {
        this.calloutInfoSwitcher.next(event)
    }
    public getCalloutEvents() {
        return this.calloutInfoSwitcher.asObservable();
    }

    private calloutSwitcher = new Subject<boolean>();
    public publishCalloutDataEvent(event: boolean) {
        this.calloutSwitcher.next(event)
    }
    public getCalloutDataEvents() {
        return this.calloutSwitcher.asObservable();
    }

    private endActionTransferSwitcher = new Subject<boolean>();
    public publishEndActionTransferEvent(event: boolean) {
        this.endActionTransferSwitcher.next(event)
    }
    public getEndActionTransferEvents() {
        return this.endActionTransferSwitcher.asObservable();
    }

    private dataLiveCall = new Subject<any>();
    public publishDataLiveCall(event: any) {
        this.dataLiveCall.next(event)
    }
    public getDataLiveCall() {
        return this.dataLiveCall.asObservable();
    }
}
