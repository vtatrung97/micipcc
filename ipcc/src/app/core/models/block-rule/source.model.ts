export class SourceModel {
    parentSourceId: string;
    parentSourceName: string;
    channelId: number;
    isReply: number;
    disabled?: boolean;
}

export class TicketSourceModel {
    sourceId: string;
    channelId: number;
    realmName: string;
    sourceCode: string;
    sourceName: string;
    status: number;
    groupId: string;
}
