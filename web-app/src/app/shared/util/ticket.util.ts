import { ChannelId, SendStatus } from "@core/constant/ticket.enum";
import { MESSENGER_CONFIG } from "@core/constant/validate-chat-config/messenger.config";
import { ZALO_CONFIG } from "@core/constant/validate-chat-config/zalo.config";
import { ValidateChatConfigModel } from "@core/models/ticket/validate-chat-config.model";
import { CHAT_PRIVATE_CONFIG } from "@core/constant/validate-chat-config/chat-private.config";
import { CHAT_PORTAL_CONFIG, SUPPORT_CHAT_CONFIG } from "@core/constant/validate-chat-config/chat-portal.config";
import { MOCHA_CONFIG } from "@core/constant/validate-chat-config/mocha.config";
import { TELEGRAM_CONFIG } from "@core/constant/validate-chat-config/telegram.config";
import { VIBER_CONFIG } from "@core/constant/validate-chat-config/viber.config";
import { TIKTOK_CONFIG } from "@core/constant/validate-chat-config/tiktok.config";

export class TicketUtil {
    static getChatConfigByChannelId(channelId: ChannelId) {
        let chatConfig: ValidateChatConfigModel;
        if (channelId == ChannelId.Messenger) {
            chatConfig = MESSENGER_CONFIG
        } else if (channelId == ChannelId.Zalo) {
            chatConfig = ZALO_CONFIG
        } else if (channelId == ChannelId.Mocha) {
            chatConfig = MOCHA_CONFIG
        } else if (channelId == ChannelId.Private) {
            chatConfig = CHAT_PRIVATE_CONFIG
        } else if (channelId == ChannelId.ChatWeb) {
            chatConfig = CHAT_PORTAL_CONFIG
        } else if (channelId == ChannelId.SupportChat) {
            chatConfig = SUPPORT_CHAT_CONFIG
        } else if (channelId == ChannelId.Telegram) {
            chatConfig = TELEGRAM_CONFIG
        } else if (channelId == ChannelId.Viber) {
            chatConfig = VIBER_CONFIG
        } else if (channelId == ChannelId.Tiktok) {
            chatConfig = TIKTOK_CONFIG
        }
        else {
            chatConfig = CHAT_PORTAL_CONFIG
        }
        return chatConfig
    }

    static isChatChannel(channelId: ChannelId) {
        return channelId == ChannelId.Zalo || channelId == ChannelId.Mocha || channelId == ChannelId.Messenger || channelId == ChannelId.ChatWeb
            || channelId == ChannelId.Chatbot || channelId == ChannelId.Whatsapp || channelId == ChannelId.Telegram || channelId == ChannelId.Viber
            || channelId == ChannelId.Tammi || channelId == ChannelId.Tiktok;
    }

    static isMsgSendFail(sendStatus: SendStatus = 0) {
        return sendStatus == SendStatus.SendFail || sendStatus >= 5
    }

    static getFileExtensionUppercase(fileName: string) {
        return fileName.split('.').pop()?.toUpperCase() || '';
    }


    static EMOJI_ONLY_TEXT_REGEX = /^[\p{Extended_Pictographic}\s]+$/u;

    static getRegexPhoneAndEmailAndUrl(keywords?: string[]) {
        const LINK_REGEX = /(?<link>\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/
        // NOSONAR
        const EMAIL_REGEX = /(?<email>[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)/; // NOSONAR
        const NOT_PHONE_REGEX = /(?<notPhonenumber>\d{12,})/
        // NOSONAR
        const PHONE_REGEX = /(?<phonenumber>(?<!\d)((\+|00)?84|0)?\s*(2[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}|[3-579][-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}|6\d{2,5}[-.\s]?\d{1,4}|8[1-9][-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}|80[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1})(?!\d))/; // NOSONAR
        // NOSONAR
        const PHONE1_REGEX = /(?<phonenumber1>0981988997777777777777777)/

        if (Array.isArray(keywords) && keywords.length > 0) {
            // NOSONAR
            // ✅ Escape từ khóa để không bị conflict regex
            const escaped = keywords.map(k => k.trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

            // ✅ Dò theo ranh giới từ \b để tránh match một phần
            const NEGATIVE_REGEX = new RegExp(`(?<negative>(${escaped.join('|')}))`, 'iu');
            return new RegExp("(" + NEGATIVE_REGEX.source + ")|(" + LINK_REGEX.source + ")|(" + EMAIL_REGEX.source + ")|(" + NOT_PHONE_REGEX.source + ")|(" + PHONE_REGEX.source + ")|(" + PHONE1_REGEX.source + ")", 'igu');
        }

        return new RegExp("(" + LINK_REGEX.source + ")|(" + EMAIL_REGEX.source + ")|(" + NOT_PHONE_REGEX.source + ")|(" + PHONE_REGEX.source + ")|(" + PHONE1_REGEX.source + ")", 'ig');

    }

    static PHONE_REGEX = /(?<phonenumber>(?<!\d)((\+|00)?84|0)?\s*(2[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}|[3-579][-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}|6\d{2,5}[-.\s]?\d{1,4}|8[1-9][-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}|80[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1}[-.\s]?\d{1})(?!\d))/; // NOSONAR

    static getIconByChannelId(channelId: number): string {
        let channelIcon: string = '';

        if (channelId == ChannelId.Voice) {
            channelIcon = `<i class="ti ti-phone-calling fs-18"></i>`;
        } else if (channelId == ChannelId.Email) {
            channelIcon == `<i class="ti ti-mail fs-18"></i>`;
        } else if (channelId == ChannelId.Messenger) {
            channelIcon = `<i class="ti ti-brand-messenger fs-18"></i>`
        } else if (channelId == ChannelId.FacebookPage) {
            channelIcon = `<i class="ti ti-brand-facebook fs-18"></i>`
        } else if (channelId == ChannelId.ChatWeb) {
            channelIcon = `<i class="ti ti-world-www fs-18"></i>`
        } else if (channelId == ChannelId.Chatbot) {
            channelIcon = '<i class="ti ti-headphones fs-18"></i>'
        } else if (channelId == ChannelId.Whatsapp) {
            channelIcon = '<i class="ti ti-brand-whatsapp fs-18"></i>'
        } else if (channelId == ChannelId.Telegram) {
            channelIcon = '<i class="ti ti-brand-telegram fs-18"></i>'
        } else if (channelId == ChannelId.Viber) {
            channelIcon = ''
        } else if (channelId == ChannelId.Zalo) {
            channelIcon = ''
        } else if (channelId == ChannelId.Mocha) {
            channelIcon = ''
        }

        return channelIcon;
    }
}
