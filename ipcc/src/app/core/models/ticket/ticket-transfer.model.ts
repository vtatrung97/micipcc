export class TicketTransfer {
    ticketId?: string;

    oldStatusType?: number;
    newStatusType?: number;

    agentHandleId?: string;
    agentHandleName?: string;
    oldAgentId?: string;
    oldAgentName?: string;
    newAgentId?: string;
    newAgentName?: string;

    oldGroupId?: string;
    newGroupId?: string;

    oldQueueId?: string;
    newQueueId?: string;

    ticketChannelId?: number;
    requestTime?: number;
    realmName?: string;
    transferTime?: number;
    refId?: string;
    sourceId?: string;
    sourceCode?: string;
    customerId?: string;

    checkSetStatus?: number;
    assignError?: number;
}
