export type TammiMessage = {
    content: string;
    messageDefaultId?: string;
    status?: number;
};

export class TammiMessageDefault {
    messageOnline = '';
    messageOffline = '';

    endChatMessage: TammiMessage[] = [];
    agentEndChatMessage: TammiMessage[] = [];

    warningEndChatEnable: number | null = 0;
    warningEndChatTime: number | null = null;

    warningEndChatMessage: TammiMessage = {
        content: ''
    };

    endChatTime: number | null = null;

    domainId?: string;
    domainCode?: string;
}

export class UpdateTammiMessageDefault {
    messageOnline = '';
    messageOffline = '';

    endChatMessage: TammiMessage[] = [];
    agentEndChatMessage: TammiMessage[] = [];

    warningEndChatEnable: number | null = 0;
    warningEndChatTime: number | null = null;

    warningEndChatMessage: TammiMessage | null = null;

    endChatTime: number | null = null;
}
