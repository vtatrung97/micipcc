export class StatusAlert {
  configureTimeModeAlertId?: string;
  type: number;
  time: number;
  unit: number;
  agentStatus: string;
  colorDefault: string;
  colorAlert: string;
  agentStatuses: string;
}

export class AlertAnnouncement {
  kzAccountId: string;
  realmName: string;
  kzUserId: string;
  kzUserIdForHtml?: string;
  enable: boolean = false;
  color?: string;
}

export enum StatusAlertType {
  auto = 1,
  forced
}

export enum StatusAlertTimeUnit {
  second = 1,
  minute,
  hour
}

export const StatusAlertColorInMonitor: string = "efa2bc";
