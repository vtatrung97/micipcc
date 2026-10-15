export class CallOnline {
    callOnlineId: string;
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
    callerIdNumber?: string;
    customerRank?: string;
    voiceChannel?: string;
    objectName?: string;
    state?: string;
    answeredTime?: number;
    userKazooId?: string;
    callId?: string;
}

export class CallOnlineFilterForm {
    agentName?: string;
    isListenSearch?: [];
    groupId: string | null;
}

export class AgentCallOnlineForm {
    agentId?: string;
    agentName?: string;
    email?: string;
    vsaUserLogin?: string;
    phoneNumber?: string;
    groupName?: string;
    searchAgent?: string;
    groupIds?: [];
    supervisorId?: string;
    agentGroupId?: string;
    zoneId?: string;
    userKazooId?: string;
}
