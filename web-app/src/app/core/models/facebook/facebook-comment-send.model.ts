export class FacebookCommentSendModel {
    customerId?: string;
    createTime?: number;
    contentType?: number;
    messageType?: number;
    ticketId?: string;
    ticketDetailId?: string;
    confId?: string;
    parentId?: string;
    externalConfId?: string;
    externalParentId?: string;
    content?: string;
    requestTime?: number;
    messageTime?: number;
    agentId?: string;
    agentName?: string;
    agentType?: number;
    objectId?: string;
    status?: number;
    sourceId?: string;
    messageDirection?: number;
    updateTime?: number;
    realmName?: string;
    action?: number;
    customerUsername?: string;
    fileUrl?: string;
    pageId?: string;
    commentId?: string;
    sendStatus?: number;
    storeFilePathTemp?: string;  // url tạm thời để hiển thị ảnh, video lên giao diện mà chưa cần upload lên minio thành công
    storeFilePath?: string
    fileName?: string
    fileSize?: number

    replyFacebookId?: string;
}
