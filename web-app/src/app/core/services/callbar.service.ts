import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {ToastService} from "@core/services/toast-service";

@Injectable({providedIn: 'root'})
export class CallbarService {

    private _newCall = new Subject<string>();
    public newCall$ = this._newCall.asObservable();

    public callAnswerEvent$ = new Subject<any>();

    constructor(private toastSvc: ToastService) {
    }

    public newCall(target: string) {
        this._newCall.next(target);
    }

    get SERVICE_URL(): string {
        return "";
    }

}
