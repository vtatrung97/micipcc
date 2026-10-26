import { Injectable } from "@angular/core";
import { CallflowSidebarMode } from "@core/constant/callflow.enum";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class CallflowEventService {

    private callflowSidebarModeChangeSrc = new Subject<{dest: CallflowSidebarMode | undefined, editorId: string, data: any}>();
    private menuChangeSrc = new Subject();
    private menuDeletedSrc = new Subject();


    callflowSidebarModeChange$ = this.callflowSidebarModeChangeSrc.asObservable();
    menuChange$ = this.menuChangeSrc.asObservable();
    menuDeleted$ = this.menuDeletedSrc.asObservable();

    announceCallflowSidebarModeChangeSrc(dest: CallflowSidebarMode | undefined, editorId: string, data?: any) {
        this.callflowSidebarModeChangeSrc.next({dest, editorId, data});
    }

    announceMenuChange() {
        this.menuChangeSrc.next()
    }

    announceMenuDeleted() {
        this.menuDeletedSrc.next()
    }
}
