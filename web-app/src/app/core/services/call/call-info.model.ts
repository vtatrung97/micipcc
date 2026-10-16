import {TransferAgentType} from "@core/services/call/call.enum";

export type VideoCallStatus = "ringing" | "answered" | "ended" | 'dialing';
export class CallInfo {
  callId: string;
  otherLegCallId: string;
  status: VideoCallStatus;
  called?: string;
  caller?: string;
  direction?: string;
  offeredVideo?: any;
  queueId?: string;
  memberCallId?: string;
  hideCallerId?: boolean;
  answerTime?: number;
  callNumberInCurrentDay?: number;
  callNumberInLast7Days?: number;
  lastAgent?: string;
  recentAgent: string;
  is_missedcall_priority?: number
  lcaq_queueID?: string;
  acdPriority?: string;
  enteredTime?: number;
  groupId?: string;
  callerIdNumber?: string;
  calleeIdNumber?: string;
  channelNumber?: string
  vars?: any;
  hideInfo?:boolean = false;
  callPriorirized?:boolean = false;
  intelligentRouting?:boolean = false;
  redirectCallEvent?: any;

  // Fields for call transfer
  agentTransfer?: string;
  queueTransfer?: string;
  ticketId?: string;
  requestTime?: number;
  category?: any;
  transferNote?: string;
  hotLog?: any;
  hot?: number;
  transferType?: TransferAgentType;
  isCampaignCall?: boolean;
  isCallBack?: boolean;
  callbackSessionId?: string;
  sipAccepted?: boolean;
}
