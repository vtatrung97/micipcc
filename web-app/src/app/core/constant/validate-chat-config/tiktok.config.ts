import {ValidateChatConfigModel} from "@core/models/ticket/validate-chat-config.model";

export const TIKTOK_CONFIG : ValidateChatConfigModel = {
    supportAlbum: false,
    allowFileExtension: new Set(),
    blacklistFileExtension: new Set(["EXE","CMD","BAT","COM","LNK","VBS","MSI","VB","WS","WSF","SCF","SCR","PIF"]),
    supportReply: true,
    allowReplyType: new Set(),
    maxChatCharacter: 2000,
    maxFileSize: 8388608,
    maxImageSize: 8388608,
    maxGifSize: 8388608,
    maxSelectFile: 20,
    supportSendTyping: true
}
