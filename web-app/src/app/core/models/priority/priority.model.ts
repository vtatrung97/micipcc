export class PriorityCheckRule {
    missPriorityId?: string;
    name?: string;
    queueId?: string;
    queueName?: string;
    waitingTimeMissCall?: string;
    missCall1?: string;
    missCall2?: string;
    enableTransferQueue?: string;
    freeThreshold?: string;
    realmName?: string;
    status?: number;
    createTime?: any;
    updateBy?: string;
    updateTime?: any;
    createBy?: string;
}
export class PriorityCheckRuleValidationResponse {
    validRecord: PriorityCheckRule[];
    invalidCount: number;
    validCount?: number;
    linkUrl: string;
    linkUrlPublic: string;
    filePath: string;
    fileName: string;
    fileSize: number;
}
