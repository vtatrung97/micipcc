import {Pipe, PipeTransform} from '@angular/core';
import {TicketDetail} from "@core/models/ticket/ticket-detail.model";
import {MessageType} from "@core/constant/ticket.enum";
import {TranslateService} from "@ngx-translate/core";
import { AuthService } from '@core/services/auth/auth.service';

@Pipe({name: 'msgAuthorName'})
export class MsgAuthorNamePipe implements PipeTransform {
    constructor(
        private translateSvc: TranslateService,
        private authService: AuthService) {
    }

    transform(msg?: TicketDetail) {
        if(!msg) return ""
        if(msg.messageType === MessageType.Agent) {
            return msg.agentId === this.authService.userId? this.translateSvc.instant("TICKET_CHAT.YOU") : msg.agentName
        } else if(msg.messageType === MessageType.System) {
            return this.translateSvc.instant("TICKET_CHAT.SYSTEM")
        } else if(msg.messageType === MessageType.Customer) {
            return msg.ticket?.customerName || msg.customerUsername || this.translateSvc.instant("TICKET_CHAT.ANONYMOUS")
        }
    }
}
