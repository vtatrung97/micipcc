import {ValidateChatConfigModel} from "@core/models/ticket/validate-chat-config.model";

export const SUPPORT_CHAT_CONFIG : ValidateChatConfigModel = {
    supportAlbum: false,
    allowFileExtension: new Set(),
    blacklistFileExtension: new Set(),
    supportReply: false,
    allowReplyType: new Set(),
    maxChatCharacter: 2000,
    maxFileSize: 8388608,
    maxImageSize: 8388608,
    maxGifSize: 8388608,
    maxSelectFile: 20,
    supportSendTyping: false,
}
