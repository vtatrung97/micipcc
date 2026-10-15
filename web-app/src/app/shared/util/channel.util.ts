import {ChannelId} from "@core/constant/ticket.enum";

export class ChannelUtil {
    static convertChannelId(channelId: ChannelId){
        let channel: string;
        switch (channelId) {
            case ChannelId.Email:
                channel = "Email";
                break;
            case ChannelId.Messenger:
                channel = "Messenger";
                break;
            case ChannelId.FacebookPage:
                channel = "Facebook Comment";
                break;
            case ChannelId.ChatWeb:
                channel = "Chat Web";
                break;
            case ChannelId.CallMeBack:
                channel = "Call Me Back";
                break;
            case ChannelId.Zalo:
                channel = "Zalo";
                break;
            case ChannelId.Mocha:
                channel = "Mocha";
                break;
            case ChannelId.Private:
                channel = "Private";
                break;
            case ChannelId.ChatInternal:
                channel = "ChatInternal";
                break;
            case ChannelId.Chatbot:
                channel = "Chatbot";
                break;
            case ChannelId.VideoCall:
                channel = "Video Call";
                break;
            case ChannelId.Whatsapp:
                channel = "Whatsapp";
                break;
            case ChannelId.Telegram:
                channel = "Telegram";
                break;
            case ChannelId.Viber:
                channel = "Viber";
                break;
            case ChannelId.Tammi:
                channel = "Tammi";
                break;
            case ChannelId.Tiktok:
                channel = "Tiktok";
                break;
            default:
                channel = "Voice";
                break;
        }
        return channel;
    }
}
