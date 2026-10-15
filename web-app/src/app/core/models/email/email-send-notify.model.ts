import { SendStatus } from "@core/constant/ticket.enum";

export class EmailSendNotify {
    ticketId: string;
    ticketDetailId?: string;
    requestTime?: number;
    content?: string;
    sendStatus?: SendStatus
    agentId?: string;
    agentName?: string;
    emailSubject?: string;
    error?: string;
}
