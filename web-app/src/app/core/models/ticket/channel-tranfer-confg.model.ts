import {ChannelId} from "@core/constant/ticket.enum";

export type ChannelTranferConfig = {
    isTransferChannel: boolean,
    domainSelected: string,
    contactSelected?: string,
    transferZaloPhone?: string,
    selectedChannelId: ChannelId,
    contactAdded?: string
}

export interface Channel {
    channelId: number,
    createBy: string,
    createTime: number,
    description: string,
    isReply: number,
    name: string,
    status: number,
    updateBy: string,
    updateTime: number
}

export type ChannelTransferWithMessageConfig = {
    isTransferChannel: boolean,
    domainSelected: string,
    contactSelected?: string,
    transferZaloPhone?: string,
    selectedChannelId: ChannelId,
    contactAdded?: string
    privateMessage?: string
}
