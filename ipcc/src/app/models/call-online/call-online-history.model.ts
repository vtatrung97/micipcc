export class CallOnlineHistory {
    callOnlineId?: string;
    agentId?: string;
    agentName?: string;
    supervisorId?: string;
    listenNumber?: number;
    isListen?: number;
    createTime?: number;
    createBy?: string;
    updateTime?: number;
    updateBy?: string;
    status?: number;
    realmName?: string;
    groupId?: string;
    kzAccountId?: string;
}

export class CallOnlineHistoryFilterForm {
    agentName?: string;
    voiceChannelId?: [];
    queueId?: [];
    listenTimeRange?: any;
    groupId: string | null;
}

export class CallOnlineHistoryDTO {
    callId?: string;
    agentKzId?: string;
    listenNumber?: number;
    callIdListen?: string;
    listenEndTime?: number;
    listenStartTime?: number;
    callStartTime?: number;
    callAnswerTime?: number;
    queueId?: string;
    objectId?: string;
    voiceChannelNumber?: string;
    customerPhone?: string;
    rankName?: string;
}
