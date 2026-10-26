import { channelNameType, Ticket } from "@core/models/ticket/ticket.model";
import {
    ChannelId,
    ContentType,
    LoadingState,
    MessageDirection,
    MessageType,
    SendStatus
} from "@core/constant/ticket.enum";
import { Attach } from "../attach.model";
import { ParticipantModel } from "@core/models/ticket/participant.model";
export enum AgentType {
    BOT = 1,
    AGENT = 2
}
export class TicketDetail {
    uiGenMsgId?: string;
    typing?: boolean;
    messageRight?: boolean; // tin nhắn hiển thị bên trái hay phải
    replyTo?: string;
    needShowAvatar?: boolean;
    needShowAboveTime?: boolean;
    authorNameDisplay?: string;
    parentId?: string;
    parentDetail?: TicketDetail;
    originalMessageId?: number | string;
    customerId?: string;
    customerImg?: string;
    createTime?: number;
    contentType?: ContentType;
    messageType?: MessageType;
    // storeFilePath?: string;
    // storeFilePathTemp?: string;  // url tạm thời để hiển thị ảnh, video lên giao diện mà chưa cần upload lên minio thành công
    ticketId: string;
    ticket?: Ticket;
    ticketDetailId?: string;
    // msgId?: number;
    channelName?: channelNameType;
    authorId?: number | string;
    channelId: ChannelId;
    authorName?: string;
    authorImg?: string;
    // fileUrl?:string;
    // fileName?:string;
    // fileSize?: number;
    confId?: string;
    externalConfId?: string;
    externalParentId?: string;
    subject?: string;
    content?: string;
    contentExtra?: string;
    requestTime?: number;
    messageTime?: number;
    agentId?: string;
    agentName?: string;
    agentType?: number;
    customerUsername?: string;
    objectId?: string;
    sessionId?: string;
    status?: number;
    updateTime?: number;
    sendStatus?: SendStatus;
    emailCc?: string;
    emailBcc?: string;
    emailTo?: string;
    messageDirection?: MessageDirection;
    sourceId?: string;
    realmName?: string;
    socialStatus?: number;
    socialLink?: string;
    socialTime?: number;
    canHide?: number;
    canRemove?: number;
    canLike?: number;
    emailFrom?: string;
    attachments?: Attach[];
    seenBy?: ParticipantModel[];
    needShowFriendsAvtSeen?: boolean;
    needShowSeenIcon?: boolean;
    resendCallBack?: () => void;
    pageId?: string;
    isChannelMain?: boolean
    isSeenByCurrentUser?: boolean;
    loadingState?: LoadingState;
    isTicketNote?: boolean;
    mainTicketId?: string
    parentEmailInoutId?: string

    hasSurvey?: boolean;
    isCxcloudSurvey?: number
    isVttSurvey?: number
    surveyConfigId?: string
    surveyClientId?: string
    surveyFrequency?: number
    surveyFrequencyUnit?: number
    surveyTimeout?: number
    surveyTimeoutUnit?: number


    socialId?: string;
    isFwEmail?: boolean;
    callBackTime?: number;
    callType?: number;
    callBackEndTime?: number;

    synchronized?: boolean;
}

export class TicketDetailFilter {
    ticketId: string;
    content: string;
    messageType: number = 0;
    requestTime?: object;
    searchOnAllTickets: boolean;
    customerId?: string;
    start?: number;
    length?: number;
}

export interface CustomerInfo {
    scenarioId?: string;
    customerId?: string;
    customerName?: string;
    objectCustomer?: string;
    netcoreCustomerId?: string;
    phoneId?: string;
    pageView?: string;
    errorStep?: string;
    currentService?: string;
    mobileActivePackage?: string;
    fixedActivePackage?: string;
    chooseServiceType?: string;
    packageDetailView?: string;
    bestMobilePackage?: string;
    bestFixedPackage?: string;
    dailyUsageSummary?: string;
    fixedlineSummary?: string;
    billingTransaction?: string;
    synchronized?: boolean;
}
