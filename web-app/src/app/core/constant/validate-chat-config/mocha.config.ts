import {ValidateChatConfigModel} from "@core/models/ticket/validate-chat-config.model";
import {ContentType} from "@core/constant/ticket.enum";

export const MOCHA_CONFIG : ValidateChatConfigModel = {
    supportAlbum: false,
    allowFileExtension: new Set(["PDF", "DOC", "DOCX", "JPG", "PNG"]),
    blacklistFileExtension: new Set(["EXE","CMD","BAT","COM","LNK","VBS","MSI","VB","WS","WSF","SCF","SCR","PIF"]),
    supportReply: false,
    allowReplyType: new Set(),
    maxChatCharacter: 2000,
    maxFileSize: 500000,
    maxImageSize: 500000,
    maxGifSize: 500000,
    maxSelectFile: 20,

}
