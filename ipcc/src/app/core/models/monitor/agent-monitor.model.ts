export class AgentQueueModel {
  totalReceive: number = 0;
  totalAnswering: number = 0;
  totalNotAnswer: number = 0;
  totalFirstResponse: number = 0;
  avgFirstResponseTime: number = 0;
  totalResolved: number = 0;
  avgResolveTime: number = 0;
  totalSocialTicket: number = 0;
  totalAssign: number = 0;
  totalTransfer: number = 0;
  totalHold: number = 0;
  totalTicketHold: number = 0;
  avgHold: number = 0;
  avgHoldTime: number = 0;
  passKpiNum: number = 0;
  totalFirst: number = 0;
  ratioFirstKpi: number = 0;
  totalFirstKpi: number = 0;
  totalNext: number = 0;
  ratioNextKpi: number = 0;
  totalNextKpi: number = 0;
  kpiHoldTime: number = 0;
  ratioKpiHoldTime: number = 0;
  realmName: String;
  agentId: String;
  queueId: String;
  agentName: String;
  queueName: String;
  agentQueueId: String;
  windowStart?:  number;
  windowEnd?:  number;
  key?: string;

  constructor(agentQueueId: string, agentId: string, agentName: string, queueId: string, queueName: string) {
    this.agentQueueId = agentQueueId;
    this.agentId = agentId;
    this.agentName = agentName;
    this.queueId = queueId;
    this.queueName = queueName;
  }
}

export class AgentStatusModel {
  agentId: String;
  vsaUserLogin: String;
  queueId: String;
  chatUserStatus: String;
  chatSystemStatus: number = 0;
  maxTransactionChat: number = 0;
  lastChangeChatStatus: number = 0;
  ticketUserStatus:  String;
  userStatus: String = '';
  ticketSystemStatus: number = 0;
  maxTransactionTicket:  number = 0;
  lastChangeTicketStatus:  number = 0;
  maxTotalTransaction: number = 0;
  ip: String;
  loginTime: number = 0;
  logoutTime: number = 0;
  chatStatusDuration: number = 0;
  ticketStatusDuration: number = 0;
  constructor(agentId: String,
              vsaUserLogin: String,
              queueId: String,
              chatUserStatus: String,
              chatSystemStatus: number,
              maxTransactionChat: number,
              lastChangeChatStatus: number,
              ticketUserStatus: String,
              userStatus: String,
              ticketSystemStatus: number,
              maxTransactionTicket: number,
              lastChangeTicketStatus: number,
              maxTotalTransaction: number,
              ip: String,
              loginTime: number,
              logoutTime: number,
              chatStatusDuration: number,
              ticketStatusDuration: number) {
    this.agentId = agentId;
    this.vsaUserLogin = vsaUserLogin;
    this.queueId = queueId;
    this.chatUserStatus = chatUserStatus;
    this.chatSystemStatus = chatSystemStatus;
    this.maxTransactionChat = maxTransactionChat;
    this.lastChangeChatStatus = lastChangeChatStatus;
    this.ticketUserStatus = ticketUserStatus;
    this.userStatus = userStatus;
    this.ticketSystemStatus = ticketSystemStatus;
    this.maxTransactionTicket = maxTransactionTicket;
    this.lastChangeTicketStatus = lastChangeTicketStatus;
    this.maxTotalTransaction = maxTotalTransaction;
    this.ip = ip;
    this.loginTime = loginTime;
    this.logoutTime = logoutTime;
    this.chatStatusDuration = chatStatusDuration;
    this.ticketStatusDuration = ticketStatusDuration;
  }
}

export interface AgentQueueMonitorFilterForm {
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
  agentQueueId: String;
  windowStart?:  object;
  windowEnd?:  object;
}

export class AgentAndQueueFilterForm {
  generalSearch: string;
  agentId: string;
  queueId: string;
  serviceOwner: string | null;
}

export class AgentStatusStat {
  agentId: string;
  accountId: number;
  currentStatus: string;
  timestamp: number;
  queueId: string;
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

export class AgentTicketEvent {
  agentId: string;
  queueId: string;
  totalReceive: number = 0;
  totalAnswering: number = 0;
  totalNotAnswer: number = 0;
}

export class TicketQueueEvent {
  queueId: string
  endTime: string;
  ownerId: string;
}


export class TicketMonitorFilterForm {
  // totalReceive: number;
  // totalAnswering: number;
  // totalNotAnswer: number;
}

export interface AgentStatusMonitorFilterForm {
  generalSearch: string;
  agentId: String;
  chatUserStatus: String[];
  ticketUserStatus: String[];
  ip: String;
  maxTransactionChat: object;
  lastChangeChatStatus: object;
  maxTransactionTicket: object;
  lastChangeTicketStatus: object;
  maxTotalTransaction: object;
  loginTime: object;
  logoutTime: object;
}

export class AgentStatusMonitorUpdateForm {
  agentId: [];
  chatUserStatus: '';
  maxTransactionChat: number;
  ticketUserStatus: '';
  maxTransactionTicket: number;
  maxTotalTransaction: number;
  notificationText: '';
  editType: number;
}

export enum EventType {
  AgentStatus = 1,
  AgentLogin = 2,
  DailyAgentStatusStat = 3,
}
