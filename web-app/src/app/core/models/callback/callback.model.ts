export interface CallbackSession {
    cbSessionId: string;
    caller?: string;
    called?: string;
    firstCallTime: number;
    lastCallbackTime?: number;
    lastCallTime?: number;
    missTimes?: number;
    retryTimes?: number;
    queueInboundId?: string;
    queueCallbackId?: string;
    voiceChannelNumber?: string;
    kzAccountId?: string;
    status?: string;
    updateTime?: number;
    lastCallStartTime?: number;
    lastCallEndTime?: number;
    isInternal?: number;
    isBlacklist?: number;
    customerLevel?: number;
    customerType?: number;
    lastCallWaitTime?: number;

    // Bot callback fields
    botVerifyCallback?: string;
    botCallBackText?: string;
    botCallBackTime?: number;
    botCallBackExpectedTime?: number;
    botCallBackEmotion?: string;
    botCallBackCallId?: string;
}
