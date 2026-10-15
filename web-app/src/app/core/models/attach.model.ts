export class Attach {
    ticketAttachId?: string
    requestTime?: number
    ticketId?: string
    storeFilePathTemp?: string;  // url tạm thời để hiển thị ảnh, video lên giao diện mà chưa cần upload lên minio thành công
    storeFilePath?: string
    fileName?: string
    fileSize?: number
    ticketDetailId?: string
    messageTime?: number
    attachTitle?: string
    contentType?: any
    description?: string
    status?: number
    url?: string
    mediaSrc?: string
    createTime?: number
    updateTime?: number
    updateBy?: string
    socialConfId?: string
    realmName?: string
    sourceId?: string
    fileBlob?: Blob;
    width?: number;
    height?: number;
    createBy?: string
    originalMessageId?: number;
    isForward?: boolean;
}

export class AttachForm {
    data: Blob;
    name: string;
}
