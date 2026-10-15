export type CallStatus = "ringing" | "answered" | "ended" | 'dialing';
export class SipEvent {
  callId: string;
  direction?: string;
  called?: string;
  caller?: string;
  status: CallStatus;
  offeredVideo?: boolean;
  queueId?: string;
  hideCallerId?: boolean;
  memberCallId?: string;
  hold: boolean;
  mute: boolean;
  offCamera: boolean;
  showKeypad: boolean;
  showTransfer: boolean;
  ringTime?: number;
  display: string;
  redirectCallEvent?: any;
  hideInfo?:boolean;
}
