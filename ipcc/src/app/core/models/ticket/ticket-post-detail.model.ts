import { ChannelId } from "@core/constant/ticket.enum";
import {TicketAttachModel} from "@core/models/ticket/ticket-attach.model";

export class TicketPostDetailModel {
    ticketDetailId: string;
    externalConfId: string;
    externalParentId: string;
    subject: string;
    content: string;
    contentExtra: string;
    requestTime: number;
    messageTime: number;
    createTime: number;
    agentId: string;
    agentName: string;
    agentType: number;
    customerUsername: string;
    customerId: string;
    contentType: number;
    objectId: string;
    sessionId: string;
    status: number;
    updateTime: number;
    sendStatus: number;
    messageType: number;
    messageDirection: number;
    sourceId: string;
    realmName: string;
    socialStatus: number;
    socialLink: string;
    socialTime: number;
    canHide: number;
    canRemove: number;
    ticketId: string;
    pageId: string;
    channelId?: ChannelId
    attachments: TicketAttachModel[];
}
