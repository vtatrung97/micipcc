import {MessageDefaultModel} from "@models/facebook/message-default.model";

export class PagesFilterForm {
    fbName?: string;
    link?: string;
    createdByUsers?: string[];
    updatedByUsers?: string[];
    createdTimeRange?: object;
    updatedTimeRange?: object;
    groupId: string | null;
    // need edit to match pageDTO below
}

export class PageServiceFilterForm {
    serviceName?: string;
    serviceDesc?: string;
}

export class FilterUserModel {
    userName?: string

    constructor(userName: string) {
        this.userName = userName;
    }
}

export class FbPageResponse {
    data: FbPageItem[];
    appId: string;
    appSecret: string;
    userLongLiveAccessToken: string;
}

export class FbPageItem {
    id: string
    name: string
    category: string
    checkins: number;
    access_token: string
    link: string;
    picture: Picture;
}

export class FbService {
    serviceId: string;

    domainId: string;

    serviceName: string;

    description: string;

    serviceCode: string;

    status: number;

    default: boolean;   // 1 default: editable, not possible to delete, 0: possible delete, update
}

class Picture {
    width: number;
    height: number;
    url: string;
}

export class FBPageModel {
    fbPageId: string;

    activeComment: number;

    activeInbox: number;

    appId: string;

    appSecret: string;

    createBy: string;

    createTime: string;

    inboxToken: string;

    link: string;

    fbName: string;

    domainId: string

    pageId: string;

    realmId: string;

    status: number;

    surveyBusinessid: string;

    surveySend: string;

    commentToken: string;

    updateBy: string;

    updateTime: string;

    groupId: string;

    startRecord: string;

    pageSize: string;

    avatarPath: string;

    commentService: FbService | undefined;

    services: FbService[] = [];

    warningEndChatEnable: number | null;

    warningEndChatTime: number | null;

    warningEndChatMessage: MessageDefaultModel = new MessageDefaultModel('');

    endChatTime: number | null;

    endChatMessage: MessageDefaultModel[] = [];

    agentEndChatMessage: MessageDefaultModel[] = [];

    language: string;

    onlineGreeting: MessageDefaultModel[] = [];
    onlineResponse: string | null;

    offlineGreeting: MessageDefaultModel = new MessageDefaultModel('');
    offlineResponse: string | null;

    actionType: string
}

export class FbPageServiceSearchModel {
    fbPageId: string;
    realmName: string;
    serviceName: string;
    serviceDescription: string;
    queueName: string;
}

export class FacebookAutoModel {
    enablePrivateMsg: boolean;
    privateMsg: string;
    privateFiles: FileAutoDTO[] = [];
    enableCommentReply: boolean;
    commentMsg: string;
    commentFiles: FileAutoDTO[] = [];
    enableAutoCloseTicket: boolean;
}

export class FileAutoDTO {
    fileId?: string;
    file?: File;
    fileName: string;
}
