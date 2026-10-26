import { channelInfo } from "@core/models/ticket/ticket.model";
import { BlockRange, BlockType, ChannelId, CreateBlockType, TicketType } from "@core/constant/ticket.enum";

export const CHANNEL_LIST: channelInfo[] = [
    {
        channelId: ChannelId.Private,
        channelName: 'private',
        tooltip: 'Kênh riêng tư',
        badgeSvgUrl: "assets/images/svg/brand-icons/brand-message-badge/private-badge.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/brand-message-badge/private-badge.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/private-badge.svg",
        isSupportTransfer: false
    },
    {
        channelId: ChannelId.ChatInternal,
        channelName: 'internal',
        tooltip: 'Kênh chat nội bộ',
        badgeSvgUrl: "assets/images/svg/brand-icons/brand-message-badge/internal-badge.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/brand-message-badge/internal-badge.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/internal-badge.svg",
        isSupportTransfer: false
    },

    {
        channelId: ChannelId.Voice,
        channelName: 'call',
        tooltip: 'Voice',
        badgeSvgUrl: "assets/images/svg/brand-icons/brand-message-badge/phone-badge.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/phone.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/phone-badge.svg",
        isSupportTransfer: true

    },

    {
        channelId: ChannelId.VideoCall,
        channelName: 'sdk',
        tooltip: 'Video Call',
        badgeSvgUrl: "assets/images/svg/brand-icons/chose-brand/sdk-badge.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/sdk-badge.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/sdk-badge.svg",
        isSupportTransfer: true

    },

    {
        channelId: ChannelId.ChatWeb,
        channelName: 'chatPortal',
        tooltip: 'MESS_FRAME.TRANSFER_CHANNEL.CHAT_PORTAL',
        badgeSvgUrl: "assets/images/svg/brand-icons/brand-message-badge/globalization-badge.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/globalization.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/globalization-badge.svg",
        isSupportTransfer: false
    },
    {
        channelId: ChannelId.CallMeBack,
        channelName: 'viettel',
        tooltip: 'Viettel',
        badgeSvgUrl: "assets/images/svg/brand-icons/brand-message-badge/viettel-badge.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/viettel.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/viettel-badge.svg",
        isSupportTransfer: false
    },

    {
        channelId: ChannelId.FacebookPage,
        channelName: 'facebook',
        tooltip: 'Facebook',
        badgeSvgUrl: "assets/images/svg/brand-icons/brand-message-badge/facebook-badge.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/facebook.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/facebook-badge.svg",
        isSupportTransfer: false
    },
    {
        channelId: ChannelId.Zalo,
        channelName: 'zalo',
        tooltip: 'MESS_FRAME.TRANSFER_CHANNEL.CHAT_ZALO',
        badgeSvgUrl: "assets/images/svg/brand-icons/brand-message-badge/zalo-badge.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/zalo.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/zalo-badge.svg",
        isSupportTransfer: true
    },
    {
        channelId: ChannelId.Mocha,
        channelName: 'mocha',
        tooltip: 'MESS_FRAME.TRANSFER_CHANNEL.CHAT_MOCHA',
        badgeSvgUrl: "assets/images/svg/brand-icons/brand-message-badge/mocha.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/mocha.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/mocha.svg",
        isSupportTransfer: false
    },
    {
        channelId: ChannelId.Messenger,
        channelName: 'messenger',
        tooltip: 'MESS_FRAME.TRANSFER_CHANNEL.CHAT_MESSENGER',
        badgeSvgUrl: "assets/images/svg/brand-icons/brand-message-badge/facebook-messenger-badge.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/facebook-messenger.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/facebook-messenger-badge.svg",
        isSupportTransfer: true
    },
    {
        channelId: ChannelId.Email,
        channelName: 'mail',
        tooltip: 'MESS_FRAME.TRANSFER_CHANNEL.SEND_MAIL',
        badgeSvgUrl: "assets/images/svg/brand-icons/brand-message-badge/mail-badge.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/mail.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/mail-badge.svg",
        isSupportTransfer: true
    },
    {
        channelId: ChannelId.Chatbot,
        channelName: 'chatbot',
        tooltip: 'Chatbot',
        badgeSvgUrl: "assets/images/svg/brand-icons/brand-message-badge/chatbot-badge.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/chatbot.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/chatbot-badge.svg",
        isSupportTransfer: false
    },
    {
        channelId: ChannelId.Voicemail,
        channelName: 'voicemail',
        tooltip: 'Voicemail',
        badgeSvgUrl: "assets/images/svg/brand-icons/brand-message-badge/chatbot-badge.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/chatbot.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/chatbot-badge.svg",
        isSupportTransfer: false
    },
    {
        channelId: ChannelId.Whatsapp,
        channelName: 'whatsapp',
        tooltip: 'Whatsapp',
        badgeSvgUrl: "assets/images/svg/brand-icons/whatsapp.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/whatsapp.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/whatsapp-badge.svg",
        isSupportTransfer: false
    },
    {
        channelId: ChannelId.Telegram,
        channelName: 'telegram',
        tooltip: 'Telegram',
        badgeSvgUrl: "assets/images/svg/brand-icons/tele.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/tele.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/telegram-badge.svg",
        isSupportTransfer: false
    },
    {
        channelId: ChannelId.Tammi,
        channelName: 'tammi',
        tooltip: 'Tammi',
        badgeSvgUrl: "assets/images/svg/brand-icons/tammi.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/tammi.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/tammi-badge.svg",
        isSupportTransfer: false
    },
    {
        channelId: ChannelId.Tiktok,
        channelName: 'tiktok',
        tooltip: 'Tiktok',
        badgeSvgUrl: "assets/images/svg/brand-icons/tiktok.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/tiktok.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/tiktok.svg",
        isSupportTransfer: false
    },
    {
        channelId: ChannelId.Viber,
        channelName: 'viber',
        tooltip: 'Viber',
        badgeSvgUrl: "assets/images/svg/brand-icons/viber.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/viber.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/viber.svg",
        isSupportTransfer: false
    },
    {
        channelId: ChannelId.Callbot,
        channelName: 'callbot',
        tooltip: 'Callbot',
        badgeSvgUrl: "assets/images/svg/brand-icons/brand-message-badge/phone-badge.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/phone.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/phone-badge.svg",
        isSupportTransfer: true
    },
    {
        channelId: ChannelId.Appstore,
        channelName: 'Appstore',
        tooltip: 'Appstore',
        badgeSvgUrl: "assets/images/svg/brand-icons/brand-message-badge/apple.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/apple.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/apple.svg",
        isSupportTransfer: false
    },
    {
        channelId: ChannelId.Chplay,
        channelName: 'Chplay',
        tooltip: 'Chplay',
        badgeSvgUrl: "assets/images/svg/brand-icons/brand-message-badge/ggplay.svg",
        squareBrandSvgUrl: "assets/images/svg/brand-icons/ggplay.svg",
        chooseBrandSvgUrl: "assets/images/svg/brand-icons/chose-brand/ggplay.svg",
        isSupportTransfer: false
    },
]

export const TICKET_TYPE: { id: number, name: string }[] = [
    {
        id: TicketType.Ticket,
        name: 'TICKET_TYPE.TICKET'
    },
    {
        id: TicketType.Claim,
        name: 'TICKET_TYPE.CLAIM'
    },
    {
        id: TicketType.Statistic,
        name: 'TICKET_TYPE.STATISTIC'
    },
]

export const TICKET_TYPE_FILTER: { id: number, name: string }[] = [
    {
        id: TicketType.Claim,
        name: 'TICKET_TYPE.CLAIM'
    },
    {
        id: TicketType.Statistic,
        name: 'TICKET_TYPE.STATISTIC'
    },
]

export const BLOCK_RANGE = [
    { id: BlockRange.Customer, name: "WHITELIST.WHITE_RANGE1.CUSTOMER" },
    { id: BlockRange.Contact, name: "WHITELIST.WHITE_RANGE1.CONTACT" },
    { id: BlockRange.Channel, name: "WHITELIST.WHITE_RANGE1.CHANNEL" },
    { id: BlockRange.Source, name: "WHITELIST.WHITE_RANGE1.SOURCE" },
    { id: BlockRange.Service, name: "WHITELIST.WHITE_RANGE1.SERVICE" }
]

export const BLOCKING_FORM = [
    { id: CreateBlockType.AutoBlock, name: 'blockUser.blockedUser.filter.automaticBlock' },
    { id: CreateBlockType.ManualBlock, name: 'blockUser.blockedUser.filter.manualBlock' }
]

export const BLOCKED_TYPE = [
    { id: BlockType.Internal, name: 'blockUser.blockedUser.table.internal' },
    { id: BlockType.Recurrent, name: 'blockUser.blockedUser.table.recurrent' }
]

export const CONTACT_TYPE = [
    { id: "1", name: "SĐT" },
    { id: "2", name: "Email" },
    { id: "3", name: "Messenger" },
    { id: "4", name: "Zalo" },
    { id: "5", name: "WebPortal" },
    { id: "6", name: "SDK" },
    { id: "7", name: "mocha" },
]

export const COLOR_DEFAULT = "#ffffff";
export const BACKGROUN_COLOR_DEFAULT = "#0000FF";
export const REASON_OTHER = '00004';
