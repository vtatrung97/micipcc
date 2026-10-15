import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {TicketNotify, TicketWarningSla, TimeLeftTicketNotify} from "@models/notification/notification.model";
import { TicketTransactionMonitor } from '@models/monitor/transaction-monitor.model';
import {AgentStatusDTO} from "@models/acd/agent.model";
import {TicketTransfer} from "@core/models/ticket/ticket-transfer.model";
import {WebPhoneStatus} from "@core/models/agent/webphone-status";
import {UserLogout} from "@core/models/agent/user-logout.model";
import {AgentStatusStat} from "@core/models/monitor/voice/voice-agent-monitor.model";

@Injectable({
    providedIn: 'root'
})
export class NotificationEventService {
    private newWarningTimeLeftTicketSrc = new Subject<TimeLeftTicketNotify>();
    private newTicketSrc = new Subject<TicketNotify>();
    private transferQueueSrc = new Subject<string>();
    private ticketWarningSrc = new Subject<TicketNotify>();
    private slaWarningSrc = new Subject<TicketWarningSla>();
    private agentStatusUpdatedSrc = new Subject<AgentStatusDTO>();
    private newNotificationIsReadSrc = new Subject();
    private newAgentStatusStatSrc =  new Subject<AgentStatusStat>()
    private selectServiceOwnerSrc = new Subject<string>();
    private newTicketMonitorEventSrc = new Subject<TicketTransactionMonitor>();
    private ticketTransferredSrc = new Subject<TicketTransfer>();
    private callbarLoginCheckResponseSrc = new Subject<WebPhoneStatus>();
    private userCallSrc = new Subject();
    private userChannelSrc = new Subject();
    private supervisorHangupActionSrc = new Subject<string>();
    private supervisorInterceptActionSrc = new Subject<string>();
    private supervisorConferenceActionSrc = new Subject<string>();
    private callOnlineEventSrc = new Subject()
    private keywordWarningEventSrc = new Subject()
    private systemWarningEventSrc = new Subject<TicketNotify>();

    newWarningTimeLeftTicket$ = this.newWarningTimeLeftTicketSrc.asObservable();
    newTicket$ = this.newTicketSrc.asObservable();
    transferQueue$ = this.transferQueueSrc.asObservable();
    ticketWarning$ = this.ticketWarningSrc.asObservable();
    slaWarning$ = this.slaWarningSrc.asObservable();
    agentStatusUpdated$ = this.agentStatusUpdatedSrc.asObservable();
    newNotificationIsRead$ = this.newNotificationIsReadSrc.asObservable();
    newAgentStatusStat$ = this.newAgentStatusStatSrc.asObservable();
    selectServiceOwner$ = this.selectServiceOwnerSrc.asObservable();
    newTicketMonitorEvent$ = this.newTicketMonitorEventSrc.asObservable();
    ticketTransferred$ = this.ticketTransferredSrc.asObservable();
    callbarLoginCheckResponse$ = this.callbarLoginCheckResponseSrc.asObservable();
    userCall$ = this.userCallSrc.asObservable();
    userChannel$ = this.userChannelSrc.asObservable();
    supervisorHangupAction$ = this.supervisorHangupActionSrc.asObservable();
    supervisorInterceptAction$ = this.supervisorInterceptActionSrc.asObservable();
    supervisorConferenceAction$ = this.supervisorConferenceActionSrc.asObservable();
    callOnlineEventSrc$ = this.callOnlineEventSrc.asObservable();
    keywordWarningEventSrc$ = this.keywordWarningEventSrc.asObservable()
    systemWarningEvent$ = this.systemWarningEventSrc.asObservable();

    announceNewCall(data: any) {
        this.callOnlineEventSrc.next(data)
    }

    announceNewWarningTimeLeftTicket(notification: TimeLeftTicketNotify) {
        this.newWarningTimeLeftTicketSrc.next(notification);
    }

    announceNewTicket(notification: TicketNotify) {
        this.newTicketSrc.next(notification);
    }

    announceTransferQueue(ticketId: string) {
        this.transferQueueSrc.next(ticketId);
    }

    announceTicketWarning(notification: TicketNotify) {
        this.ticketWarningSrc.next(notification);
    }

    announceSlaWarning(notification: TicketWarningSla) {
        this.slaWarningSrc.next(notification);
    }

    announceAgentStatusUpdated(status: AgentStatusDTO) {
        this.agentStatusUpdatedSrc.next(status);
    }

    announceNewNotificationIsRead(notificationId: string){
        this.newNotificationIsReadSrc.next(notificationId)
    }

    announceNewAgentStatusStat(agentStatusStat: AgentStatusStat){
        this.newAgentStatusStatSrc.next(agentStatusStat);
    }

    announceSelectServiceOwner(selectedServiceOwner: string){
        this.selectServiceOwnerSrc.next(selectedServiceOwner);
    }

    announceNewTicketMonitorEvent(ticketMonitorEvent: TicketTransactionMonitor){
        this.newTicketMonitorEventSrc.next(ticketMonitorEvent);
    }

    announceTicketTransferred(ticketTransfer: TicketTransfer) {
        this.ticketTransferredSrc.next(ticketTransfer);
    }

    announceUseWebPhoneHere(webPhoneStatus: WebPhoneStatus) {
        this.callbarLoginCheckResponseSrc.next(webPhoneStatus);
    }

    announceUserCall(userCall: any) {
        this.userCallSrc.next(userCall);
    }

    announceUserChannel(userChannel: any) {
        this.userChannelSrc.next(userChannel);
    }

    announceSupervisorHangupAction(agent: string) {
        this.supervisorHangupActionSrc.next(agent);
    }

    announceSupervisorInterceptAction(agent: string) {
        this.supervisorInterceptActionSrc.next(agent);
    }

    announceSupervisorConferenceAction(agent: string) {
        this.supervisorConferenceActionSrc.next(agent);
    }

    announceSystemWarning(notification: TicketNotify) {
        this.systemWarningEventSrc.next(notification);
    }

    private logoutByMonitorSrc = new Subject<UserLogout>();
    logoutByMonitor$ = this.logoutByMonitorSrc.asObservable();
    announceLogoutByMonitor(userLogout: UserLogout) {
        this.logoutByMonitorSrc.next(userLogout);
    }

    announceKeywordChecking(warning: any) {
        this.keywordWarningEventSrc.next(warning)
    }
}
