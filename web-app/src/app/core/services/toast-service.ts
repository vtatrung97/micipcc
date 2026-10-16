import {Injectable, TemplateRef} from '@angular/core';
import {AudioService} from "@core/services/audio.service";
import {NotiCode} from "@core/constant/ticket.enum";

export type notificationType = 'info' | 'success' | 'danger' | 'warning' | 'NEW_TICKET' | 'TICKET_WARNING' |
    'ticket_expire_soon' | 'SLA_WARNING' | 'DISCONNECT_CHAT' | 'RECONNECT_CHAT' | 'TICKET_TRANSFER' | 'OTHER_AGENT_UPDATE_TICKET' |
    'INCOMING_CALL' | 'END_CALL' | 'DISCONNECT_AGENT_SRV' | 'RECONNECT_AGENT_SRV' | 'VOICE_CALL' | 'UNIT_STATUS' | 'SEAT_NUMBER' | 'CHAT_NOTIFI' | 'TICKET_CLOSE_BY_FIELDREPORTSYSTEM' | 'MISSED_CALL'
    | 'ALERT_TICKET_WARNING' | 'SOCIAL_ALERT_WARNING' | 'ALERT_ACCOUNT_WARNING';

export type Toast = {
    textOrTpl: string | TemplateRef<any>,
    delay?: number,
    type: notificationType,
    extraData?: any,
    createTime: number
}

type NotificationOption = {
    delay?: number,
    type: notificationType,
    extraData?: any
}

@Injectable({providedIn: 'root'})
export class ToastService {
    toasts: Toast[] = [];

    constructor(private audioService: AudioService) {
    }

    show(textOrTpl: string | TemplateRef<any>, options: NotificationOption = {type: "info"}) {
        let toast: Toast = {textOrTpl, ...options, createTime: new Date().getTime()};
        for (let i = 0; i < this.toasts.length; i ++) {
            if (this.checkDuplicateToast(this.toasts[i], toast)) {
                this.toasts.splice(i, 1);
            }
        }
        this.toasts.push(toast);
        if (options.type == 'NEW_TICKET'
            || (options.type == 'TICKET_TRANSFER' && toast.extraData.notiCode == NotiCode.TICKET_TRANSFERRED_TO)
           ) {
            // this.audioService.playAudioNewTicket()
        }

        return toast;
    }

    checkDuplicateToast(toast1: Toast, toast2: Toast) {
        let a = JSON.stringify({...toast1, createTime: null});
        let b = JSON.stringify({...toast2, createTime: null});
        let c = a == b
        return c;
        // return c && (Math.abs(toast2.createTime - toast1.createTime) <= 1000)
    }

    /**
     * Standard message
     */
    showInfo(content: string, delay : number = 20000) {
        this.show(content, {delay: delay, type: 'info'});
    }

    /**
     * Standard message
     */
    showInfoToNavigateToTicketDetail(content: string, ticket: any, delay : number = 20000) {
        this.show(content, {delay: delay, type: 'info', extraData: ticket});
    }

    /**
     * Success message
     */
    showSuccess(content: string, delay: number = 20000) {
        this.show(content, {delay, type: 'success'});
    }

    /**
     * Danger message
     */
    showDanger(content: string) {
        this.show(content, {delay: 20000, type: 'danger'});
    }

    /**
     * Warning message
     */
    showWarning(content: string) {
        this.show(content, {delay: 20000, type: 'warning'});
    }

    remove(toast: any) {
        this.toasts = this.toasts.filter(t => t !== toast);
    }

    swipe() {
        this.toasts = [];
    }

    swipeIf(types: notificationType[]) {
        this.toasts = this.toasts.filter(t => !types.includes(t.type));
    }
}
