
export class CustomerRankVip {
    customerRankVipId?: string;
    rankCode?: string;
    rankName?: string;
    realmName?: string;
    groupId?: string;
    status?: number;
    createTime?: any;
    updateBy?: string;
    updateTime?: any;
    createBy?: string;
}
export class CustomerRankVipValidationResponse {
    validRecord: CustomerRankVip[];
    invalidCount: number;
    validCount?: number;
    linkUrl: string;
    linkUrlPublic: string;
    filePath: string;
    fileName: string;
    fileSize: number;
}
