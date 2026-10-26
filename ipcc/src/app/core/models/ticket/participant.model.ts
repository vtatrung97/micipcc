import {ChannelId} from "@core/constant/ticket.enum";

// export type ParticipantModel = {
//     id?: string,
//     user: ChatUserModel,
//     userExternalId?: string,
//     agentId?: string,
//     conversationId: string,
//     lastReadAt: number,
//     lastReadMsgId: string,
//     unreadCount?: number,
//     joinAt: number,
//     ticketId: string,
//     channelId: ChannelId
// }

export type  ParticipantModel =
    {
        "agentId": string,
        "channelId": ChannelId,
        "conversationId": string,
        "id": string,
        "joinAt": number,
        lastReadAt: number,
        "lastReadMsgId": string,
        "leaveAt": number,
        "serviceCode": string,
        "serviceId": string,
        "ticketId": string,
        "unreadCount": number,
        "user": {
            "avatarPath": string,
            "channelId": ChannelId,
            "clientId": string,
            "createdAt": number,
            "domainId": string,
            "email": string,
            "enabled": true,
            "externalId": string,
            "gender": number,
            "id": string,
            "locale": string,
            "name": string,
            "phoneNumber": string,
            "realmName": string,
            "role": string
        },
        "userExternalId": string
    }

