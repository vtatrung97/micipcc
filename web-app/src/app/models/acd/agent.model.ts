export class Agent {
  agentId?: string;
  agentName?: string;
  agentType?: number;
  callStatus?: string;
  chatSystemStatus?: number;
  chatUserStatus?: string;
  realmName?: string;
  createBy?: string;
  createTime?: number;
  description?: string;
  lastChangeChatStatus?: number;
  lastChangeTicketStatus?: number;
  lastFinishWorkVoice?: number;
  lastFinishWorkChat?: number;
  lastFinishWorkTicket?: number;
  lastStartWorkVoice?: number;
  lastStartWorkChat?: number;
  lastStartWorkTicket?: number;
  maxTransactionTicket?: number;
  maxTotalTransaction?: number;
  status?: number;
  systemStatus?: string;
  ticketSystemStatus?: number;
  ticketUserStatus?: string;
  updateBy?: string;
  updateTime?: number;
  userKazooId?: string;
  userStatus?: string;
  vsaUserLogin?: string;
  campaignSystemStatus?: string;
  currentCampaignId?: number;
  groupId?: string;
  maxTransactionChat?: number;
  kzAccountId?: string;
  timestampFrom?: number;
  timestampTo?: number;

}

export class AgentStatusDTO {
  assignerId: string;
  assignerName?: string;
  assigneeId: string;
  chatUserStatus: string;
  lastChatUserStatus?: string;
  lastChangeChatStatus?: number;
  ticketUserStatus: string;
  lastTicketUserStatus?: string;
  lastChangeTicketStatus?: number;
  userStatus?: string;
  lastChangeUserStatus?: number;
  userKazooId?: string;
  loginTime?: number;
  logoutTime?: number;
  notificationText?: string;
}

export enum AgentStatus {
  AVAILABLE = "AVAILABLE",
  NOT_AVAILABLE = "NOT_AVAILABLE",
  LUNCH = "LUNCH",
  AT_LUNCH = "AT_LUNCH",
  MEETING = "MEETING",
  NO_ACD = "NO_ACD",
  LOG_OUT = "LOG_OUT",
  INBOUND = "INBOUND",
  OUTBOUND = "OUTBOUND",
  TRAINING = "TRAINING",
  GO_OUT = "GO_OUT",
  TYPING = "TYPING",
  NO_ANSWER = "NO_ANSWER",
  WEB_EXIT = "WEB_EXIT"
}

export enum AgentVoiceStatus {
  logged_in = 'logged_in',
  ready = 'ready',
  resume = 'resume',
  paused = 'paused',
  wrapup = 'wrapup',
  inbound = 'inbound',
  outbound = 'outbound',
  connecting = 'connecting',
  connected = 'connected',
  outbound_connecting = 'outbound_connecting',
  outbound_connected = 'outbound_connected',
  logged_out=  'logged_out',
  unknown = 'unknown',
  no_acd = 'no_acd',
  lunch = 'lunch',
  meeting = 'meeting',
  training = 'training',
  available = 'available',
  not_available = 'not_available',
  go_out = 'go_out',
  typing = 'typing',
  sleeping = 'sleeping',
  no_answer = 'no_answer',
  web_exit = 'web_exit',
  direct_call = 'direct_call',
  web_enter = 'web_enter',
  web_logout= 'web_logout',
  webphone_after = 'webphone_after'
}

export enum AgentCallStatus {
  ringing = 'ringing',
  answering = 'answering',
  stuck = 'stuck'
}

export enum CallStatus {
  IN_IVR = 'IN_IVR',
  MENU = 'MENU',
  QUEUEING = 'QUEUEING',
  RINGING = 'RINGING',
  ANSWERING = 'ANSWERING',
  MISSED = 'MISSED',
  HOLDING = 'HOLDING',
  PROCESSED = 'PROCESSED',
  ABANDONED = 'ABANDONED',
  ENDED = 'ENDED',
  DESTROYED = 'DESTROYED'
}

export enum Warning {
  no_warning = 0,
  warning = 1
}

export enum QueueManagerId {
  VOICE = "1",
  EMAIL = "2",
  FACEBOOK_MESSENGER = "3",
  FACEBOOK_PAGE = "4",
  CHAT_WEB = "5",
  CHAT_APP = "6",
  ZALO = "7",
  MOCHA = "8",
  PRIVATE = "9",
  CHAT_INTERNAL = "10",
  CHATBOT = "11"
}

export class FilteredAgent {
  agentId?: string;
  agentName?: string;
  realmName?: string;
  vsaUserLogin?: string;
  groupId?: string;
  zoneId?: string;
}

export class AgentFilterForm {
  agentName?: string;
  agentGroupId?: [];
  groupId?: [];
  zoneId?: [];
  queueId?: string;
}

export type AgentStatusType = {statusOptionImg: string, status: AgentStatus, statusDisplayImg: string, statusText: string, display: boolean}
