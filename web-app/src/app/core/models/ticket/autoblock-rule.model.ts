export class AutoblockRuleModel {

    blockRuleId: string;

    ruleName: string;

    ticketLimit: number;

    applyRange: number;

    blockRange: number;

    blockTime: number;

    realmName: string;

    groupId: string;

    createTime: number;

    createBy: string;

    updateTime: number;

    updateBy: string;

    status: number;

    brApplyDetails: any;
    brBlockDetails: any;
}

export class ReqInvalidBlockRuleModel {
    type: number;

    applyIds: string;

    exceptionSources: string[];

    exceptionServices: string[];

    groupId: string;

    blockRuleId?: string;
}


