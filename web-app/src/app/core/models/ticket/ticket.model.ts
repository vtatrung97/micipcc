import { TicketDetail } from "@core/models/ticket/ticket-detail.model";
import { ChannelId, ContentType, HoldStatus, LoadingState, StatusType } from "@core/constant/ticket.enum";
import { Customer } from "@models/ticket/customer.model";
import { TicketStatus, TicketStatusCode } from "@models/ticket/ticket-status.model";
import { TicketMissedModel } from "@core/models/ticket/ticket-missed.model";
import { CustomerContact } from "@models/ticket/customer-contact.model";

export type channelNameType =
    'private'
    | 'internal'
    | 'call'
    | 'chatPortal'
    | 'viettel'
    | 'zalo'
    | 'mocha'
    | 'messenger'
    | 'facebook'
    | 'mail'
    | 'chatbot'
    | 'sdk'
    | 'voicemail'
    | 'whatsapp'
    | 'telegram'
    | 'viber'
    | 'tammi'
    | 'callbot'
    | 'Chplay'
    | 'Appstore'
    | 'tiktok';

export type channelInfo = {
    channelId: ChannelId;
    channelName: channelNameType,
    tooltip: string,
    badgeSvgUrl: string,
    squareBrandSvgUrl: string,
    chooseBrandSvgUrl: string,
    isSupportTransfer: boolean // có hỗ trợ chuyển sang kênh này không
}

export type MemberTypingData = Map<string,
    {
        name?: string;
        avatar?: string;
        typing: boolean;
    }>
export type MsgCluster = {
    listMsg: TicketDetail[],
    avatar?: string,
    authorName?: string,
    needShowAvatar?: boolean,
    isHold?: boolean;
}

export interface Ticket {
    customerCode?: string;
    externalUserId?: string;
    ticketId: string;
    subject?: string;
    customerId?: string;
    userId?: string;
    customerName?: string;
    customerImg?: string;
    realmName?: string;
    groupId?: string;
    realmId?: number;
    ownerId?: string;
    ownerName?: string;
    requestTime?: number;
    slaCooperateTime?: number;
    slaTime?: number;
    ticketEmotionId?: string;
    ticketPriorityId?: string;
    ticketPriorityName?: string;
    channelId: ChannelId;
    channelImage?: string;
    channelName?: channelNameType;
    assignTime?: number;
    assignerName?: string;
    lastMessage?: string;
    lastMessCreateTime?: number;
    lastUserChatId?: string;
    lastUserChatName?: string;
    ticketStatusId?: string;
    statusType?: StatusType;
    topic?: string;
    description?: string;
    agentProcessId?: string;
    agentProcessName?: string;
    agentHandleId?: string;
    agentHandleName?: string;
    ticketTypeId?: string;
    ticketTypeId2?: string;
    ticketTypeId3?: string;
    ticketTypeId4?: string;
    ticketTypeId5?: string;
    ticketTagList?: string;
    sourceId?: string;
    queueId?: string;
    queueName?: string;
    firstResponseTime?: number;
    firstResponseSla?: number;
    resolveTime?: number;
    ignored?: number;
    ticketIgnoreId?: string;

    customer?: Customer;
    ticketDetails?: TicketDetail[];
    ticketStatus?: TicketStatus;
    refId?: string;
    flagAdminCreate?: boolean;

    // Chỉ dùng cho các BOT được tạo bởi cấu hình cx-bot, không dùng cho bot từ kênh chatbot vtt
    botId?: string;
    botTimeout?: number;
    cxBotTicketTransferToAgentReason?: string;
    botSummary?: string;

    createTime?: number;
    lastTicketDetailContent?: string;
    ticketDetailContentType?: ContentType;
    ticketDetailMessageTime?: number;
    ticketDetailSubject?: string;
    listMsgCluster?: MsgCluster[];
    isMainTicket?: boolean;
    lastTicketDetail?: TicketDetail;
    firstTicketDetail?: TicketDetail;
    endConversation?: boolean;

    holdStatus?: HoldStatus;
    holding?: boolean;
    ticketExtras?: TicketExtra[];
    statusName?: string,
    isTicketMissed?: boolean;
    openImmediately?: boolean;
    customerAvaPath?: string;
    userRead?: string;

    ticketMissed?: TicketMissedModel;

    customerContactId?: string;
    assignStatus?: number;
    version?: number;
    loadingTicket?: LoadingState;
    agentName?: string;
    statusCode?: TicketStatusCode;
    isOpenInMonitorMode?: boolean;

    sourceCode?: string;
    callOngoing?: boolean;
    callId?: string
    customerContacts?: CustomerContact[]
    isDefaultExpand?: boolean;
    ticketTags?: any[];
    reportPhone?: string;
    reasonDetail?: string;
    updateBy?: string;
}

export interface TicketExtra {
    ticketExtraId?: string;
    ticketId?: string;
    channelId?: ChannelId;
    realmName?: string;
    holdStatus?: number;
    holdStartTime?: number;
    holdEndTime?: number;
    kpiHold?: number;
    kpiHoldNum?: number;
    holdNum?: number;
    customerMessageAt?: number;
    lastCustomerMessageAt?: number;
    firstResponseAt?: number;
    lastAgentMessageAt?: number;
}

export class TicketFilterForm {
    generalSearch?: string = '';
    ticketId?: string = '';
    channelId?: [] = [];
    sourceId?: [] = [];
    subject?: string = '';
    ticketPriorityId?: [] = [];
    ticketStatusId?: [] = [];
    requestTime?: { from: any, to: any } = { from: null, to: null };
    slaTimeCb?: [] = [];
    ticketTypeId1?: [] = [];
    ticketTypeId2?: [] = [];
    ticketTypeId3?: [] = [];
    ticketTypeId4?: [] = [];
    ticketTypeId5?: [] = [];
    ticketDetail_content?: string = '';
    customerName?: string = '';
    customerContact_contact?: string = '';
    emailFromKH?: string = '';
    assignerName?: string = '';
    ownerName?: string = '';
    assignTime?: { from: any, to: any } = { from: null, to: null };
    slaTime?: { from: any, to: any } = { from: null, to: null };
    agentHandleName?: string = '';
    transferStatus?: [] = [];
    responseStatus?: [] = [];
    description?: string = '';
    ticketEmotionId?: [] = [];
    resolveTime?: { from: any, to: any } = { from: null, to: null };
    updateBy?: string = '';
    updateTime?: { from: any, to: any } = { from: null, to: null };
    ticketMissed_acdStatus?: [] = [];
    ticketDetail_emailFrom?: string = '';
    ticketDetail_emailTo?: string = '';
    assignerGroupId?: [] = [];
    processGroupId?: [] = [];
    handleGroupId?: [] = [];
    // theoUserKH?: string = '';
    reopenTime?: { from: any, to: any } = { from: null, to: null };
    ticketDetail_externalConfId?: string = '';
    userRead?: [] = [];
    lastRequestTime?: { from: any, to: any } = { from: null, to: null };
    slaCooperateConfig?: { from: any, to: any } = { from: null, to: null };
    slaCooperateTime?: { from: any, to: any } = { from: null, to: null };
    slaProcessConfig?: { from: any, to: any } = { from: null, to: null };
    slaProcessTime?: { from: any, to: any } = { from: null, to: null };
    endConversationTime?: { from: any, to: any } = { from: null, to: null };  // thời điểm agent kết thúc hội thoại
    endConversation?: string[] = [];
    endReason?: [] = [];
    ignored?: [] = [];
    ticketIgnoreId?: [] = [];
    // nguoiGiamSat?: string = '';
    groupId?: string | null = '';
    ticketDetail_socialLink?: string = '';
    ticketDetail_socialStatus?: string = '';
    ticketDetailSearchDTOHM?: TicketDetailFilterForm = new TicketDetailFilterForm();
    customerContactSearchDTOHM?: CustomerContactFilterForm = new CustomerContactFilterForm();
    ticketMissedSearchDTOHM?: TicketMissedFilterForm = new TicketMissedFilterForm();
    agentId?: string = '';
    queueId?: [] = [];

    // Fields for video-call search
    refId?: string = ''; // Mã cuộc gọi
    customerCode?: string = ''; // Tài khoản khách hàng
    ticketDetail_contentExtra?: string = ''; // Liên hệ hẹn gọi lại
    ticketDetail_callBackTime?: { from: any, to: any } = { from: null, to: null }; // Thời điểm hẹn gọi lại

    otherFilters?: [] = [];
    tag1?: any = [];
    tag2?: any = [];
    tag?: any = [];
    ticketTagIds?: any = [];
    hasVoicemail?: string = '';
    sourceCode?: string
    ticketPhone?: any = null; // Khách hàng để lại số điện thoại
    adsId?: string = '';
    databaseSync?: boolean = false;

    handledTime?: { from: any, to: any } = { from: null, to: null }; // Thời điểm agent phản hồi
    speedOfHandling?: string | number | object | null = ''; // Thời gian khách hàng chờ cuộc gọi
    handlingDuration?: string | number | object | null = ''; // Thời gian tương tác
    endedBy?: string = ''; // Người kết thúc hội thoại

    customerContactId?: string | null;
    statisticType?: string = '';
    sortMode?: string | null;
    lastSendMessage?: string = '';
    aiSuggestion?: [] = [];

}

export class TicketDetailFilterForm {
    content?: string = '';
    emailFrom?: string = '';
    emailTo?: string = '';
    externalConfId?: string = '';
    socialLink?: string = '';

    // Fields for video-call search
    contentExtra?: string = '';
    callBackTime?: string = '{from: null, to: null}';
    socialStatus?: string = '';

}

export class CustomerContactFilterForm {
    contact?: string = '';
}

export class TicketMissedFilterForm {
    acdStatus?: number[] = [];
}
