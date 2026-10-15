import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { CallInfo } from "./call-info.model";

@Injectable({
  providedIn: "root",
})
export class CallEventService {
  private toggleCameraSrc = new Subject<boolean>();
  private toggleMicroSrc = new Subject<boolean>();
  private callingSrc = new Subject<CallInfo>();
  private increaseCountCallOnlineSrc = new Subject<string>();
  private endCallSrc = new BehaviorSubject<CallInfo | undefined>(undefined);
  private acceptedSrc = new BehaviorSubject<CallInfo | undefined>(undefined);
  private onACallSrc = new Subject<CallInfo>();
  private onSupervisorRejectOrEndJoinSrc = new Subject<string>();
  private ticketIdSelectedSrc = new Subject<string>();
  private callEavesdroppedSrc = new Subject<{ kzUserId: string, cidName: string, mode: string }>();
  private callSupportSrc = new Subject<{ support: number }>();
  private customerEndCallSrc = new BehaviorSubject<CallInfo | undefined>(undefined);
  private customerStartCallSrc = new BehaviorSubject<CallInfo | undefined>(undefined);

  toggleCamera$ = this.toggleCameraSrc.asObservable();
  toggleMicro$ = this.toggleMicroSrc.asObservable();
  calling$ = this.callingSrc.asObservable();
  increaseCountCallOnline$ = this.increaseCountCallOnlineSrc.asObservable();
  endCall$ = this.endCallSrc.asObservable();
  accepted$ = this.acceptedSrc.asObservable();
  onACall$ = this.onACallSrc.asObservable();
  onSupervisorRejectOrEndJoinCall$ = this.onSupervisorRejectOrEndJoinSrc.asObservable();
  ticketIdSelected$ = this.ticketIdSelectedSrc.asObservable();
  callEavesdropped$ = this.callEavesdroppedSrc.asObservable();
  callSupportSrc$ = this.callSupportSrc.asObservable();
  customerEndCall$ = this.customerEndCallSrc.asObservable(); // khi khách hàng tắt cuộc gọi
  customerStartCall$ = this.customerStartCallSrc.asObservable(); // khi khách hàng tắt cuộc gọi

  announceToggleCamera(dest: boolean) {
    this.toggleCameraSrc.next(dest);
  }
  announceToggleMicro(dest: boolean) {
    this.toggleMicroSrc.next(dest);
  }
  announceIncreaseCountCallOnline(agentKzId?: string) {
    this.increaseCountCallOnlineSrc.next(agentKzId);
  }
  announceCalling(callInfo: CallInfo) {
    this.callingSrc.next(callInfo);
  }
  announceEndCall(callInfo: CallInfo) {
    this.endCallSrc.next(callInfo);
  }
  announceAccepted(callInfo: CallInfo) {
    this.acceptedSrc.next(callInfo)
  }
  announceOnACall(callInfo: CallInfo) {
    this.onACallSrc.next(callInfo)
  }
  announceSupervisorRejectOrEndJoinCall(agentId: string) {
    this.onSupervisorRejectOrEndJoinSrc.next(agentId)
  }
  announceTicketIdToCallSelected(ticketId: string) {
    this.ticketIdSelectedSrc.next(ticketId)
  }
  announceCallEavesdropped(kzUserId: string, cidName: string, mode: string) {
    this.callEavesdroppedSrc.next({ kzUserId: kzUserId, cidName: cidName, mode: mode });
  }
  announceCallSupport(support : number) {
    this.callSupportSrc.next({support: support });
  }

  announceCustomerEndCall(callInfo: CallInfo) {
    this.customerEndCallSrc.next(callInfo);
  }
}
