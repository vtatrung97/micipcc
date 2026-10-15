export class TicketStatus {
  ticketStatusId?: string;
  statusName?: string;
  description?: string;
  status?: number;
  realmId: number;
  editable?: number;
  groupId?: number;
  createBy?: string;
  createTime?: number;
  updateBy?: string;
  updateTime?: number;
  statusType?: number;
  statusCode?: string;
}

export enum TicketStatusType {
  OPEN = 1,
  CLOSE = 2
}

export enum TicketStatusCode {
  OPEN = 'OPEN',
  REOPEN = 'REOPEN',
  CLOSED = 'CLOSED',
  TEMP_CLOSE = 'TEMP_CLOSE'
}

export type TicketHandleStatus = "NEW" | "DONE" | "ON_PROCESS" | "TEMP_CLOSE";

export interface TicketHandleStatusDetail {type: TicketHandleStatus | number, title: string, svgSrc: string, ticketStatusId?: string};