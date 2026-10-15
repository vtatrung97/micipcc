export class InboundQueueModel {
  queueId: string;
  queueName: string;
  totalCall: number = 0;
  distributing: number = 0;
  ringing: number = 0;
  answering: number = 0;
  totalPrimaryAgent: number = 0;
  totalSecondaryAgent: number = 0;
  missCallRatio: number | string = 0;
  answeredCallRatio: number | string = 0;
  avgAnswerTime: number = 0;
  avgHoldTime: number = 0;
  avgWaitTime: number = 0;
  enteredCallCount: number = 0;
  holdCount: number = 0;
  avgAnswerTimeEachAgent: number = 0;
  totalCallPerAgent: number | string = 0;
  handledCallCount: number = 0;
  handlingDurationLt20: number = 0;
  handlingDurationLt10: number = 0;
  abandonedCallCount: number = 0;
  abandonedCallWaitLT20: number = 0;
  abandonedCallWaitLT10: number = 0;
  numberAvailableAgent: number = 0;
  numberOutboundAgent: number = 0;
  numberNotAvailableAgent: number = 0;
  numberNoAnswerAgent: number = 0;
  numberAtLunchAgent: number = 0;
  numberMeetingAgent: number = 0;
  numberTrainingAgent: number = 0;
  numberGoOutAgent: number = 0;
  numberTypingAgent: number = 0;
  numberSleepingAgent: number = 0;
  numberAgentInQueue: number = 0;
  numberLoggedInAgent: number = 0;
  numberReadyAgent: number = 0;
  numberServingAgent: number = 0;
  totalAgent: number = 0;
  agents: [];
  agentIds: string;
  userKazooIds: string;

  processedCallCount: number = 0;
  speedOfHandling: number = 0;
  handlingDuration: number = 0;
  holdDuration: number = 0;
  handlingDurationGt10Lt20: number = 0;
  abandonedCallWaitGE10LT20: number = 0;

  constructor(id: string, queueName: string) {
    this.queueId = id;
    this.queueName = queueName;
    this.agents = [];
  }
}

export class InboundQueueFilterForm {
  listQueueIds: [];
  queueManagerId: any;
}

export class AgentInQueueFilterForm{
  queueId: String;
  queueGroupChildIds?: string[]
}

export class Agent {
  agentId: string;
  userKazooId: string;
  userStatus: string;
}

export class AgentStatusMonitor {
  agentId: string;
  userKazooId: string;
  userStatus: string;
  groupId: string;
  numberMissByAgent?: number
}

export enum EventType {
  AgentStatusStat = 1,
  DailyQueueStatusStat = 2,
  QueueTransactionStat = 3
}

