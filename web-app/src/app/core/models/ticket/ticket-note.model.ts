export class TicketNote {
    agentId?: string;
    agentName?: string;
    realmName?: string;
    ticketId: string;
    sourceId?: string;
    content?: string;
    requestTime?: number;
    realmId: string;
    parentId?: string;
    objectId?: string

    //
    // agentType?: number;
    // messageDirection?: number;
    // messageTime?: number;
    // messageType?: MessageType;
    // sendStatus?: SendStatus;
    // channelId: ChannelId;
    // type: number
    // contentType?: ContentType;
    // updateTime?: number;
}
