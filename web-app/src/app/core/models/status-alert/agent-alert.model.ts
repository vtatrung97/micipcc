export class AgentAlert {
  kzAgentId?: string;
  agentId?: string;
  alertType: string;
  timestamp?: number;
  agentStatusAtAlert?: string;
  agentStatusDurationAtAlert?: number;
  callId?: string;
  callStatusAtAlert?: string;
  callStatusDurationAtAlert?: number;
  callType?: string;
  kzQueueId?: string;
  kzQueueIdList?: string[];
  timestampFrom?: number;
  timestampTo?: number;
  callStartTime?: number;
  callFrom?: string;
  callDurationAtAlert?: number;
  holdDurationAtAlert?: number;
  muteDurationAtAlert?: number;
  kpi?: number;
  durationAtAlert?: number;
  kzAccountId?: string;
  realmName?: string;
}

export enum AgentAlertType {
  status_auto = 'status_auto',
  status_forced = 'status_forced',
  mute = 'mute',
  hold = 'hold',
  talk_time_1 = 'talk_time_1',
  talk_time_2 = 'talk_time_2',
  long = 'long'
}
