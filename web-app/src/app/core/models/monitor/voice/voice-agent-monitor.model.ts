export class Agent {
  agentId: string;
  queueId: string;
  agentName: string;
  groupName?: string;
  queueName: string;
  agentQueueId: string;
  accountId: string;
  userStatus?: string;
  callStatus?: string;
  extension: string;
  seatNumber: number;
  kzUserId: string;
  realmName: string;
  loginTime: number;
  logoutTime: number;
  transferStatus: string;
  transferNumber: number;

  constructor(agentQueueId: string, agentId: string, agentName: string, queueId: string, queueName: string) {
    this.agentQueueId = agentQueueId;
    this.agentId = agentId;
    this.agentName = agentName;
    this.queueId = queueId;
    this.queueName = queueName;
  }
}

export class AgentStatusStat extends Agent{
  currentStatus: string;
  timestamp: number;
  callId: string;
  callerIdNumber: string;
  previousStatus: string;
  previousStatusDuration: number;
  previousStatusTimestamp: number;
  previousStatusQueueId: string;
  previousStatusCallId: string;
  previousStatusCallerIdNumber: string;
  temporaryStatus: string;
}

export class DailyAgentStatusModel extends Agent {
  kzUserIdForHtml?: string;
  connectingCount: number = 0;
  connectedCount: number = 0;
  connectedRatio: number | string = 0;
  connectingDurationForConnectedCall: number = 0;
  connectedDuration: number = 0;
  connectedDurationAvg: number | string = 0;
  connectedDurationLt10: number | string = 0;
  connectingDurationForConnectedCallAvg: number | string = 0;
  holdCount: number = 0;
  holdDuration: number = 0;
  numberTransferred: number = 0;
  maxConnectedDuration: number = 0;
  totalConnectedDuration: number = 0;
  connectingDurationGt10: number = 0;
  numberEndedByAgent: number = 0;
  lastChangeUserStatus: number;
  userStatusDuration: number = 0;
  numberMissByAgent: number = 0;
  numberMissByCustomer: number = 0;
  statusChangeCount: number = 0;
  windowStart?:  number = 0;
  windowEnd?:  number = 0;

  //<editor-fold desc="Section agent status and their change count">
  inboundDuration: number = 0;
  noAnswerDuration: number = 0;
  typingDuration: number = 0;
  goOutDuration: number = 0;
  meetingDuration: number = 0;
  lunchDuration: number = 0;
  trainingDuration: number = 0;
  sleepingDuration: number = 0;
  notAvailableDuration: number = 0;
  outboundDuration: number = 0;
  answeringOutboundDuration: number = 0;
  inboundChangeCount: number = 0;
  noAnswerChangeCount: number = 0;
  typingChangeCount: number = 0;
  goOutChangeCount: number = 0;
  meetingChangeCount: number = 0;
  lunchChangeCount: number = 0;
  trainingChangeCount: number = 0;
  sleepingChangeCount: number = 0;
  notAvailableChangeCount: number = 0;
  outboundChangeCount: number = 0;
  answeringOutboundChangeCount: number = 0;
  //</editor-fold>
}

export class VoiceAgentFilterForm {
  generalSearch: string;
  listQueueIds: [];
  listGroupIds: [];
  userStatus: [];
  lastChangeUserStatus: object;
  callStatus: [];
}

export class DailyAgentEachStat {
  otherStats: DailyAgentEachOtherStat[];
  statusStats: DailyAgentEachStatusStat[];
}

export class DailyAgentEachOtherStat {
  name: string;
  [val: string]: any;
  type: 'timestamp' | 'duration' | 'number' = 'timestamp';

  constructor() {
  }
}

export class DailyAgentEachStatusStat {
  status: string;
  statusChangeCount: number;
  statusDuration: number;
  isShownFrequency: boolean;
  channel: string;
}

export enum EventType {
  AgentStatusStat = 1,
  DailyAgentStatusStat = 2
}


