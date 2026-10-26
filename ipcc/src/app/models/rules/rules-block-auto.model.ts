export class RulesBlockAuto {
    autoBlockRuleId?: string;
    ruleName?: string;
    voiceChanelIdList?: string;
    voiceChanelNameList?: string;
    voiceChanel?: string;
    voiceChanelId?: string;
    voiceChanelName?: string;
    callLimit?: number;
    durationCallLimit?: number;
    blockType?: number;
    blockTime?: number;
    exceptionBlockRuleId?: number;
    status?: number;
    checkExceptionBlockRuleId?: boolean;
    exceptionBlockRuleDTOList?: any;
    createTime?: any;
    updateBy?: string;
    updateTime?: any;
    createBy?: string;
}
export class RulesBlockAutoValidationResponse {
    validRecord: RulesBlockAuto[];
    invalidCount: number;
    validCount?: number;
    linkUrl: string;
    linkUrlPublic: string;
    filePath: string;
    fileName: string;
    fileSize: number;
}
