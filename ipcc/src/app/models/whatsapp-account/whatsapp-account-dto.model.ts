import { MessageDefaultModel } from '@models/facebook/message-default.model';

export class WhatsappAccountConfig {
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

export type WhatsappAccUpdateReq = {
  onlineResponse: string;
  warningEndChatEnable: 0 | 1;
  warningEndChatMessage: MessageDefaultModel;
  warningEndChatTime: number | null;
  endChatMessage: MessageDefaultModel[];
  endChatTime: number | null;
  agentEndChatMessage: MessageDefaultModel[];
};
