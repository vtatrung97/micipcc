import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { TicketService } from "./ticket.service";

@Injectable({ providedIn: 'root' })
export class AiSuggestionSettingService {
    private readonly enabledSubject = new BehaviorSubject<boolean>(true);
    private loaded = false;

    constructor(private ticketSvc: TicketService) { }

    get enabled$(): Observable<boolean> {
        return this.enabledSubject.asObservable();
    }

    get enabled(): boolean {
        return this.enabledSubject.value;
    }

    load(): void {
        if (this.loaded) return;
        this.loaded = true;
        this.ticketSvc.getAiSuggestionSetting().subscribe({
            next: (res: any) => this.enabledSubject.next(res?.data?.enabled !== false),
            error: () => this.enabledSubject.next(true)
        });
    }

    update(enabled: boolean): Observable<any> {
        return this.ticketSvc.updateAiSuggestionSetting(enabled)
            .pipe(tap(() => this.enabledSubject.next(enabled)));
    }
}
