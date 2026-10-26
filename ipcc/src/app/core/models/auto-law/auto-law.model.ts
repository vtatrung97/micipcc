export class AutoLaw {
    assignLawId?: string;
    lawName: string;
    lawCode: string;
    channelId: number;
    startTime: number;
    endTime: number;
    content: string;
    durationFrom: number;
}

export class AutoLawSearchForm {
    lawName?: string | null;
    lawCode?: string | null;
    startTimeRange?: object | null;
    endTimeRange?: object | null;
    content?: string;
    durationFrom?: number | null;
    durationTo?: number | null;
    listAgentIds?: [];
    totalPerAgent?: number | null;
    status?: number | null;
    ticketTypeLevel1Ids?: [];
    ticketTypeLevel2Ids?: [];
    ticketTypeLevel3Ids?: [];
    ticketTypeLevel4Ids?: [];
    ticketTypeLevel5Ids?: [];
    markType?: number | null;
    toPartnerIds?: [];
    callLabel?: number | null;
    listWarningLevel?: [];
    cycleType?: number | null;
    listChannelIds?: []
}

export enum LawStatus {
    doing = 1,
    done = 2,
    to_do = 3
}

export enum MarkType {
    quality = 1,
    exchange_quality = 2
}

export enum CallLabel {
    nok = 0,
    ok = 1
}

export enum CycleType {
    current = 1,
    next_month = 2
}

export enum WarningLevel {
    normal = 1,
    high = 2
}

