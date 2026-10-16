
export class CallBotCustomer {
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
export class CallBotCustomerValidationResponse {
    validRecord: CallBotCustomer[];
    invalidCount: number;
    validCount?: number;
    linkUrl: string;
    linkUrlPublic: string;
    filePath: string;
    fileName: string;
    fileSize: number;
}
