import {Customer} from "../../../models/ticket/customer.model";
import {TicketAttachModel} from "@core/models/ticket/ticket-attach.model";

export class TicketCommentDetailModel {
    customerId?: string;
    createTime?: number;
    contentType?: number;
    messageType?: number;
    ticketId: string;
    ticketDetailId: string;

    confId?: string;
    parentId?: string;

    externalConfId: string;
    externalParentId?: string;
    subject?: string;
    content: string;
    requestTime?: number;
    messageTime?: number;
    agentId?: string;
    agentName?: string;
    agentType?: number;
    customerUsername?: string;
    objectId: string;
    status?: number;
    updateTime?: number;
    sourceId?: string;
    realmName?: string;
    socialStatus?: number;
    socialLink?: string;
    socialTime?: number;
    canHide?: number;
    canRemove?: number;
    channelId?: number;
    level?: number;
    lastComment?: boolean;
    canLike?: number;
    sendStatus?: number;
    updateBy?: string;
    socialStatusReasonId?: string;
    customer: Customer;
    storeFilePath: string;
    fileContentType: string;
}
