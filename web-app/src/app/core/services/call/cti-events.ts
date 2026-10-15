import {MyccAgentStatusStat} from "../../models/mycc-agent-status-stat.model";

export class OnMediaFailed {
    readonly type: string = 'OnMediaFailed';
}

export class OnRegistered {
    readonly type: string = 'OnRegistered';
}

export class OnActiveWebPhone {
    readonly type: string = 'OnActiveWebPhone';
}

export class OnNoWebRTCDeviceFound {
    readonly type: string = 'OnNoWebRTCDeviceFound';
}

export class ErrorNotification {
    readonly type: string = 'ErrorNotification';
    data: any;

    constructor(data: any) {
        this.data = data;
    }
}

export class WPCallRingingEvent {
    readonly type: string = 'WPCallRingingEvent';
    data: any;

    constructor(data: any) {
        this.data = data;
    }
}

export class WPCallAnsweredEvent {
    readonly type: string = 'WPCallAnsweredEvent';
    data: any;

    constructor(data: any) {
        this.data = data;
    }
}

export class WPCallEndedEvent {
    readonly type: string = 'WPCallEndedEvent';
    data: { remainingCalls: number };

    constructor(remainingCalls: number) {
        this.data = {remainingCalls: remainingCalls};
    }
}

export class OnAgentStatusChange {
    readonly type: string = 'OnAgentStatusChange';
    data: any;

    constructor(data: string) {
        this.data = data;
    }
}

export class UserCredentialsRequest {
    readonly type: string = 'UserCredentialsRequest';
}

export class UserCredentialsResponse {
    readonly type: string = 'UserCredentialsResponse';
    data: {
        account_id: string;
        account_name: string;
        realm: string;
        user_id: string;
        auth_token: string;
        refresh_token: string;
        language: string;
        session_id: string;
        crossbar: string;
        proxies: string[];
        access_token: string;
        tenant: string;
    };

    constructor(data: { account_id: string; account_name: string; realm: string; user_id: string; auth_token: string; language: string;
        session_id: string; crossbar: string; proxies: string[]; access_token: string, tenant: string, refresh_token: string}) {
        this.data = data;
    }
}

export class OutboundCallRequest {
    readonly type: string = 'OutboundCallRequest';
    data: {
        target: string;
    };

    constructor(data: { target: string }) {
        this.data = data;
    }
}

export class CallbarLoginCheckRequest {
    readonly type: string = 'CallbarLoginCheckRequest';
    data: {
        forceConnect: boolean;
    };

    constructor(forceConnect: boolean) {
        this.data = {forceConnect: forceConnect};
    }
}

export class CallbarLoginCheckResponse {
    readonly type: string = 'CallbarLoginCheckResponse';
    data: any;

    constructor(data: any) {
        this.data = data;
    }
}

export class AgentStatusStatChange {
    readonly type: string = 'AgentStatusStatChange';
    data: MyccAgentStatusStat;

    constructor(data: MyccAgentStatusStat) {
        this.data = data;
    }
}

export class ResetVoiceStatusRequest {
    readonly type: string = 'ResetVoiceStatusRequest';
}

export class WPFrameResizedEvent {
    readonly type: string = 'WPFrameResizedEvent';
    data: any;

    constructor(data: { width: number, height: number }) {
        this.data = data;
    }
}

export class APUserCallEvent {
    readonly type: string = 'APUserCallEvent';
    data: any;

    constructor(data: any) {
        this.data = data;
    }
}

export class InboundCallAction {
    readonly type: string = 'InboundCallAction';
    data: any;

    constructor(data: { action: number, callId: string, transferCallNumber?: string }) {
        this.data = data;
    }
}

export class OutboundCallAction {
    readonly type: string = 'OutboundCallAction';
    data: any;

    constructor(data: { calleeNumber: string, ticketId: string, callType: string, campainId?: string  }) {
        this.data = data;
    }
}


export class OutboundCampaignCallAction {
    readonly type: string = 'OutboundCampaignCallAction';
    data: any;

    constructor(data: { calleeNumber: string, campaignId: string }) {
        this.data = data;
    }
}

export class OutboundCallbackAction {
    readonly type: string = 'OutboundCallbackAction';
    data: any;

    constructor(data: { calleeNumber: string, cbSessionID: string}) {
        this.data = data;
    }
}

export class UpdatePhoneNumberAction {
    readonly type: string = 'UpdatePhoneNumberAction';
    data: any;

    constructor(data: {phoneNumber: string }) {
        this.data = data;
    }
}
export class OutboundZaloCallAction {
    readonly type: string = 'OutboundZaloCallAction';
    data: any;

     constructor(data: { calleeNumber: string, callType: string, extraHeaders? : any[],zaloOAId?: string, ticketId?: string}) {
        this.data = data;
    }
}
