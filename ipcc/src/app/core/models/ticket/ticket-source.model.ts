export class TicketSourceModel {
    sourceId: string;
    channelId: number;
    createTime: number;
    createBy: string;
    updateTime: number;
    updateBy: string;
    realmName: string;
    sourceCode: string;
    sourceName: string;
    status: number;
    groupId: string;
    parentSourceName?: string;
}
