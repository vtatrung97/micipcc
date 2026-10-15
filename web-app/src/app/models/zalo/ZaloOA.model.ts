import { MessageDefaultModel } from "@models/facebook/message-default.model";

export class ZaloOAModel {
    zaloAccountId: string;
    oaId: string;
    accessToken: string;
    refreshToken: string;
    createdBy: string;
    createdAt: number;
    updatedBy: string;
    updatedAt: number;
    realmName: string;
    status: number;
    groupId: string;
    name: string;
    description: string;
    appId: string;
    secretKey: string;
    tokenExpireDate: number;
    avatarPath: string;

    warningEndChatEnable: number | null;

    warningEndChatTime: number | null;

    warningEndChatMessage: MessageDefaultModel = new MessageDefaultModel('');

    endChatTime: number | null;

    endChatMessage: MessageDefaultModel[] = [];

    agentEndChatMessage: MessageDefaultModel[] = [];

    language: string;

    onlineGreeting: MessageDefaultModel[] = [];
    onlineResponse: string | null;

    offlineGreeting: MessageDefaultModel = new MessageDefaultModel('');
    offlineResponse: string | null;

}