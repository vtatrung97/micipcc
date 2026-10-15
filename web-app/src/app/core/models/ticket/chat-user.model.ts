import {ChannelId} from "@core/constant/ticket.enum";
import {Gender} from "@core/constant/ticket.enum";

export type ChatUserModel = {
    id?: string,
    avatarPath: string,
    channelId: ChannelId,
    clientId: string,
    createdAt: number,
    domainId: string,
    email: string,
    enabled: true,
    externalId: string,
    gender: Gender,
    locale: string,
    name: string,
    phoneNumber: string,
    realmName: string,
    role: string
}
