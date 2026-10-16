import {Ticket} from "@core/models/ticket/ticket.model";
import {Customer} from "@models/ticket/customer.model";

export class CreateTicketEmailModel {
    ticketDTO?: Ticket;
    lstCustomer?: Customer[];
}

export class CreateEmailValidationResponse {
    lstEmailTo: string[] = [];
    lstEmailCC: string[] = [];
    lstEmailBCC: string[] = [];
    invalidCount: number;
    linkUrl: string;
    linkUrlPublic: string;
    filePath: string;
    fileName: string;
    fileSize: number;
    validCount: number;
}
