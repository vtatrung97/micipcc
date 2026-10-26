export enum CallStatus {
  RingIng = "ringing",
  Answered = "answered",
  Ended = "ended",
  Dialing = "dialing"
}
export enum CallOutType {
  Telecom = 1,
  App
}
export enum VoiceType {
  Audio = 1,
  SigleVideo,
  TwoWayVideo
}
export enum SignalStatus {
  Good = 'Tốt',
  Connecting = "Đang kết nối",
  NoAnswer = "Không trả lời"
}
export enum SocicalStatus {
  Cancel = 0,
  Comming = 1,
}

export enum TransferAgentType {
  Acd = 1,
  Agent,
  Callflow,
  Supervisor,
  ExpertGroup,
  OutIvr
}
