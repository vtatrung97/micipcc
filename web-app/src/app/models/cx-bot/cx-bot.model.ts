import {MessageDefaultModel} from "@models/facebook/message-default.model";

export class service {
    whatsappAccountId: string;
    whatsappBusinessId: string;
    name: string;
    groupId: string;
    realmName: string;
    onlineResponse: string;
    warningEndChatEnable: 0 | 1;
    warningEndChatMessage: MessageDefaultModel = new MessageDefaultModel('');
    warningEndChatTime: number | null;
    endChatMessage: MessageDefaultModel[] = [];
    endChatTime: number | null;
    agentEndChatMessage: MessageDefaultModel[] = [];
}

export class ServiceOwnerDTO {
    id: string;
    name: string;
}