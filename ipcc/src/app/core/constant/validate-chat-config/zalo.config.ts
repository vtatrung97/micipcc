import {ValidateChatConfigModel} from "@core/models/ticket/validate-chat-config.model";
import {ContentType} from "@core/constant/ticket.enum";

export const ZALO_CONFIG : ValidateChatConfigModel = {
    supportAlbum: false,
    allowFileExtension: new Set(["PDF", "DOC", "DOCX", "JPG", "PNG"]),
    blacklistFileExtension: new Set(["EXE","CMD","BAT","COM","LNK","VBS","MSI","VB","WS","WSF","SCF","SCR","PIF"]),
    supportReply: true,
    allowReplyType: new Set([ContentType.Text]),
    maxChatCharacter: 2000,
    maxFileSize: 5242880,
    maxImageSize: 1048576,
    maxGifSize: 5242880,
    maxSelectFile: 20,

}
