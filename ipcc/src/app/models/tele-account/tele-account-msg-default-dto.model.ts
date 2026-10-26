export class TeleAccountMessageDefault {
    telegramAccountId = '';
    botId = '';
    name = '';
    description = '';

    messageOnline = '';
    messageOffline = '';

    endChatMessage: Message[] = [];
    agentEndChatMessage: Message[] = [];

    warningEndChatEnable: number | null = 0;
    warningEndChatTime: number | null = null;

    warningEndChatMessage: Message = {
        content: ''
    };

    endChatTime: number | null = null;
}

export class UpdateTeleAccountMessageDefault {
    messageOnline = '';
    messageOffline = '';

    endChatMessage: Message[] = [];
    agentEndChatMessage: Message[] = [];

    warningEndChatEnable: number | null = 0;
    warningEndChatTime: number | null = null;

    warningEndChatMessage: Message | null = null;

    endChatTime: number | null = null;
}

export type Message = {
    content: string;
    messageDefaultId?: string;
    status?: number;
};