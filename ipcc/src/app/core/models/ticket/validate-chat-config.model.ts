import {ContentType} from "@core/constant/ticket.enum";

export class ValidateChatConfigModel {
    supportReply: boolean
    allowReplyType: Set<ContentType>
    supportAlbum: boolean
    maxFileSize: number
    maxSelectFile: number
    allowFileExtension: Set<string>
    blacklistFileExtension: Set<string>
    maxChatCharacter: number
    maxImageSize: number
    maxGifSize: number
    supportSendSeen?: boolean
    supportSendTyping?: boolean

}
