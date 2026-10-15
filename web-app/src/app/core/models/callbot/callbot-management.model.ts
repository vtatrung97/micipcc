
export class CallBotManagement {
    callbotBotId?: string;
    callbotBotCode?: string;
    callbotBotName?: string;
    callbotBotSip?: string;
    callbotBotDescription?: string;
    realmName?: string;
    kzAccountId?: string;
    groupId?: string;
    status?: number;
    createTime?: any;
    updateBy?: string;
    updateTime?: any;
    createBy?: string;
}
export class CallBotManagementValidationResponse {
    validRecord: CallBotManagement[];
    invalidCount: number;
    validCount?: number;
    linkUrl: string;
    linkUrlPublic: string;
    filePath: string;
    fileName: string;
    fileSize: number;
}
