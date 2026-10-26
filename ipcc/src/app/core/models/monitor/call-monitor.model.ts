export class LiveCallModel {
  callId: String;
  accountId: String;
  callType: String;
  callerIdNumber: String;
  calleeIdNumber: String;
  fromAgent: String;
  toAgent: String;
  otherLegCallId: String;
  objectId: String;
  objectType: String;
  queueAgent: String;
  startTime: number;
  holdDuration: number;
  holding: boolean;
  state: String;
  stateTimeMs: number;
  stateDuration: number = 0;
  totalDuration: number = 0;
}

export enum CallStatus {
  in_ivr = 'IN_IVR',
  menu = 'MENU',
  queueing = 'QUEUEING',
  ringing = 'RINGING',
  answering = 'ANSWERING',
  missed = 'MISSED',
  holding = 'HOLDING'
}

export enum CallType {
  internal = 'INTERNAL',
  inbound = 'INBOUND',
  outbound = 'OUTBOUND'
}

export enum Warning {
  no_warning = 'NO_WARNING',
  warning = 'WARNING',
  mute = 'MUTE',
  hold = 'HOLD',
  long = 'LONG',
  talk_time_1 = 'TALK_TIME_1',
  talk_time_2 = 'TALK_TIME_2'
}

