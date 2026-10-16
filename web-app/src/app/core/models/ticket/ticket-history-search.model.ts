export class TicketHistorySearchModel {
    requestTimeFrom: number
    requestTimeTo: number
    customerId: string
}

export class TimeRange {
    from?: Date | number;
    to?: Date | number;
}

export class TicketHistorySearchForm {
    ticketTypes?: [];
    ticketStatusIds?: [];
    channels?: [];
    subject?: '';
    description?: '';
    requestTime?: TimeRange | null;
    ticketEmotionId?: [];
    customerNeedLevel1Ids?: [];
    customerNeedLevel2Ids?: [];
    customerNeedLevel3Ids?: [];
    customerNeedLevel4Ids?: [];
    customerNeedLevel5Ids?: [];
    customerContactId?: string | null;
    userId?: string;
    customerId?: string;
    isRelatedType?: number;
}
