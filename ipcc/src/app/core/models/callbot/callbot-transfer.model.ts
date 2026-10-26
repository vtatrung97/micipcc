
export class CallBotTransfer {
    callbotGroupId?: string;
    callbotGroupCode?: string;
    callbotGroupName?: string;
    description?: string;
    realmName?: string;
    kzAccountId?: string;
    groupId?: string;
    status?: number;
    createTime?: any;
    updateBy?: string;
    updateTime?: any;
    createBy?: string;
}
export class CallBotTransferValidationResponse {
    validRecord: CallBotTransfer[];
    invalidCount: number;
    validCount?: number;
    linkUrl: string;
    linkUrlPublic: string;
    filePath: string;
    fileName: string;
    fileSize: number;
}
