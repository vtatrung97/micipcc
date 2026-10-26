
export class DistributeSubscriber {
    formatPhoneNumberId?: string;
    name?: string;
    expression?: string;
    description?: string;
    realmName?: string;
    groupId?: string;
    status?: number;
    createBy?: string;
    createTime?: any;
    updateBy?: string;
    updateTime?: any;
}
export class DistributeSubscriberResponse {
    validRecord: DistributeSubscriber[];
    invalidCount: number;
    validCount?: number;
    linkUrl: string;
    linkUrlPublic: string;
    filePath: string;
    fileName: string;
    fileSize: number;
}
