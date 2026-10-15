export class LiveCallModel {
    callId: String;
    accountId: String;
    callType: String;
    callerIdNumber: String;
    calleeIdNumber: String;
    fromAgent: String;
    toAgent: String;
    otherLegCallId: String;
    objectId: String;
    objectType: String;
    queueAgent: String;
    startTime: number;
    holdDuration: number;
    holding: boolean;
    state: String;
    stateTimeMs: number;
    stateDuration: number = 0;
    totalDuration: number = 0;
}

export interface MissedCallModel {
    callbackSessionId: string;
    kzAccountId: string | null;
    caller: string|null;
    firstCallTime: number|null;
    lastCallTime: number|null;
    callbackDeadline: number|null;
    callbackWarningTime: number|null;
    callbackEvaluate: string|null;
    callbackStatus: number|null;
    endStatusDisplay: string|null;
    missTimes: number|null;
    retryTimes: number|null;
    firstCallbackTime: number|null;
    lastCallbackTime: number|null;
    inboundQueueName: string|null;
    callbackQueueName: string|null;
    internalCustomer: boolean|null;
    blacklistOrVip: string|null;
    customerRank: string|null;
    warningTime: string|null;
    callbackMode: string|null;
    isCallbackAllowed: boolean|null;
    lastCallbackStatus: string|null;
    agentName: string|null;
}

export interface CallbackDetailModel {
    startTime: number|null;
    endTime: number|null;
    agentName: string|null;
    caller: string|null;
    dialedNumber: string|null;
    queueName: string|null;
    callbackStatus: string|null;
    talkingDuration: number | null;     // ← thêm dòng này
}

export interface MissedCallFilterForm {
    listQueueIds: string[];
    phoneNumber: string;
    processStatus: string;  // ['on_deadline','miss_deadline']
    callBackFlag: number | null;   // ['0','1']
    loginTimeRange: {'from': number | null, 'to': number | null}
}

export enum ActionStatus {
    due = 'DUE',
    overdue = 'OVERDUE'
}
