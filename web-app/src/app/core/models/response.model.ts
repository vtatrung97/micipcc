import {AuthorType, ChannelId, ContentType, SendStatus} from "@core/constant/ticket.enum";
import {ParticipantModel} from "@core/models/ticket/participant.model";

export interface ResponseEnvelope<T> {
    data: T
    code: number
    status: string
    path: string
    message: string
    page_size: number
    request_id: string
    timestamp: number
    timestampISO8601: string
}

export interface CbResponse<T> {
    data: T;
    auth_token: string;
    status: string;
    message: string;
    error: string;
    request_id: any;
    start_key: string;
    next_start_key: string;
}

export interface DatatablesResponse<T> {
    data: T[];
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
    displayLength?: number;
    displayStart?: number;
}

export interface MinioResponse {
    code: number;
    message: string;
    data: {
        fileName: string;
        filePath: string;
        privateLink: string;
        publicLink: string;
        result: boolean
    } []
}


export interface WsChatResponse {
    uiGenMsgId?: string;
    id: string; // cần Diệu bổ sung
    ticketId: string; // cần Diệu bổ sung
    channelId: ChannelId;
    authorType: AuthorType;
    authorId: string;
    agentId: string;
    conversationId: string;
    receivedAt: number;
    type: ContentType;
    content: string;
    contentExtra: string;
    fileUrl: string[];
    fileName: string[];
    fileSize: number[];
    originalMessageId: string;
    originalMessageTimestamp: number;
    integrationId: string;
    serviceId: string;
    replyTo: string;
    status: SendStatus;
    userId: string;
    typing: boolean;
    authorAvt?: string;
    authorName?: string;
    surveyClientId?: string
}

export type WsSeenResponse = ParticipantModel[]

export interface ChatServerRequest {
    data: {
        channelId: ChannelId;
        authorType: AuthorType;
        authorId: number | string;
        type: ContentType;
        content: string;
        contentExtra: string;
        fileUrl?: (string|undefined)[];
        fileName?: (string|undefined)[];
        fileSize?: (number|undefined)[];
        // originalMessageId: string | number;
        originalMessageTimestamp: number;
        integrationId: string;
        serviceId: string;
        refId?: string;
        replyTo?: string;
        externalId?: string;
        status: number;
        ticketId: string;
        typing?: boolean;
        multiChannel?: boolean;
        merge?: boolean;
        requestTime?: number;
        ownerId?: string;
        uiGenMsgId?: string;
        privateMsg?: boolean;
        domainId?: string;
    }
}

