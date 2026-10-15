export class OutboundQueueModel {
  queueId: string;
  queueName: string;
  totalCall: number = 0;
  distributing: number = 0;
  ringing: number = 0;
  answering: number = 0;
  numberOutboundAgent: number = 0;
  numberOutboundConnectingAgent: number = 0;
  numberOutboundConnectedAgent: number = 0;
  numberConnectingAgent: number = 0;
  numberServingAgent: number = 0;
  agents: [];

  constructor(id: string, queueName: string) {
    this.queueId = id;
    this.queueName = queueName;
    this.agents = [];
  }
}

export class OutboundQueueFilterForm {
  listQueueIds: [];
  queueManagerId: any;
}

export class Agent {
  agentId: string;
  userKazooId: string;
  userStatus: string;
}

export enum EventType {
  AgentStatusStat = 1,
  QueueTransactionStat = 2
}

