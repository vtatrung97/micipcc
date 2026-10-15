export class QueueModel {
  queueId: String;
  queueName:String;
  queueManagerId: String;
  totalQueue: number = 0;
  totalMiss: number = 0;
  ratioSuccess: number = 0;
  totalFirstResponse: number = 0;
  firstResponseAvgTime: number = 0;
  acdTimeAvg: number = 0;
  totalResolved: number = 0;
  avgResolveTime: number = 0;
  avgHold: number = 0;
  avgHoldTime: number = 0;
  totalFirstResponseKpi: number = 0;
  totalFirstResponseFail: number = 0;
  ratioFirstResponsePass: number = 0;
  ratioFirstKpi: number = 0;
  ratioNextKpi:number = 0;
  totalNotResolved:number = 0;
  totalNotAssigned:number = 0;
  totalMissTime:number = 0;
  totalNotResponse:number = 0;
  totalAnswering: number = 0;
  totalMissing: number = 0;
  totalAgentAvailable:number = 0;
  totalAgentUnavailable: number = 0;
  totalPrimaryAgent: number = 0;
  totalPrimaryAgentAvailable:number = 0;
  totalPrimaryAgentUnavailable:number = 0;
  totalSecondaryAgent :number = 0;
  totalAgentSecondaryAvailable: number = 0;
  totalAgentSecondaryUnavailable: number = 0;
  realmName: String;
  totalHold: number = 0;
  totalTicketHold: number = 0;
  passKpiNum: number = 0;
  totalFirst: number = 0;
  totalFirstKpi: number = 0;
  totalNext: number = 0;
  totalNextKpi: number = 0;
  kpiHoldTime: number = 0;
  ratioKpiHoldTime: number = 0;
  windowStart?:  number;
  windowEnd?:  number;

  constructor(queueId: string, queueName: string, queueManagerId: string) {
    this.queueId = queueId;
    this.queueName = queueName;
    this.queueManagerId = queueManagerId;
  }
}

export class Agent {
  id: string;
  first_name: string;
  last_name: string;
  queues: string[];
  status: string;
}

export class VoiceQueueModel {
  queueId: string;
  queueName: string;
  enteredCallCount: number = 0;
  handledCallCount: number = 0;
  handledRatio: number = 0;
  ringingCallCount: number = 0;
  queueingCallCount: number = 0;
  answeringCallCount: number = 0;
  speedOfHandlingAvg: number = 0;
  handlingDurationAvg: number = 0;
  answeredPassKpiRatio: number = 0;
  holdTimeAvg: number = 0;
  holdPassKpiRatio: number = 0;
  longCallCount: number = 0;
  speedOfHandlingGT20: number = 0;
  speedOfHandlingGT10: number = 0;
  abandonedCallWaitLT20: number = 0;
  abandonedCallWaitLT10: number = 0;
  numberAgentInQueue: number = 0;
  readyAgent: number = 0;
  loggedInAgent: number = 0;
  kpiAnswer = 'N/A';
  kpiHold = 'N/A';
  agents: [];
  constructor(id: string, queueName: string) {
    this.queueId = id;
    this.queueName = queueName;
    this.agents = [];
  }
}

export interface QueueMonitorFilterForm {
  totalFirstResponse: object;
  avgFirstResponseTime: object;
  totalResolved: object;
  avgResolveTime: object;
  totalAssign: object;
  totalTransfer: object;
  avgHold: object;
  avgHoldTime: object;
  kpiHoldTime: object;
  ratioKpiHoldTime: object;
  totalFirstKpi: object;
  ratioFirstKpi: object;
  totalNextKpi: object;
  ratioNextKpi: object;
  queueId: String;
  windowStart?:  object;
  windowEnd?:  object;
}

export class QueueFilterForm {
  generalSearch: string;
  queueId: string;
  queueType: number;
  serviceOwner: string | null;
}

export class QueueAgentStatusFilterForm {
  generalSearch: string;
  showedQueueId: string;
  serviceOwner: string | null;
}

export class QueueTicketEvent {
  queueId: string
  totalNotResolved: number = 0;
  totalNotAssigned: number = 0;
  totalNotResponse: number = 0;
  totalAnswering: number = 0;
}

export class QueueTicketMissEvent {
  queueId: string
  totalMissing: string;
}

export class TicketQueueMonitorFilterForm {
  // totalReceive: number;
  // totalAnswering: number;
  // totalNotAnswer: number;
}
