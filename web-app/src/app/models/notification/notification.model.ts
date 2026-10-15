import {ChannelId, NotiCode, NotiType} from "@core/constant/ticket.enum";

export type TicketNotify = {
    notificationId: string;
    agentId: string;
    ticketId: string;
    ticketChannelId: ChannelId;
    customerName: string;
    customerImg: string;
    ticketSubject: string;
    requestTime: number;
    createTime: number;
    sourceId: string;
    customerId: string;
    referId: string;
    notiType: NotiType;
    notiCode: NotiCode;
    timeLeft: number;
    slaTime: number;
    firstResponseSla: number;
    warningSlaKpiTime: Date;
    assignerId?: string;
    assignerName?: string;
    agentNotifyName?: string;
    assigneeName?: string;
    description?: string;
    ticketTagList?: string;
    newAgentName?: string;
    queueName?: string;
    agentAssignerName?: string;
    keyword?: string // cảnh báo từ khóa
    callWaitingCount?: number // cảnh báo cuộc gọi chờ trong queue
    title?: string;
    content?: string;
    from?: string;
    socialType?: string;
}

export type TimeLeftTicketNotify = {
    notificationId: string;
    agentId: string;
    ticketId: string;
    ticketChannelId: ChannelId;
    customerName: string;
    customerImg: string;
    ticketSubject: string;
    requestTime: number
    sourceId: string;
    customerId: string;
    timeLeft: number;

}

export type TicketWarningSla = {
    lstNotificationDTO: TicketNotify[];
    agentId: string;
    notificationId: string;
}

export type CallWaitingWarningNotify = {
    queueId?: string;
    warningPercentage?: number;
    availableAgents?: string[];
    callWaitingCount?: number;
    queueName?: string
    realmName?: string
    timestamp?: number
}
