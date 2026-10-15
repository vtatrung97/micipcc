export interface Column {id: string, name: string, tooltip?: string | null, checked: boolean, fixed?: boolean, order?: number}

export interface TableOptions {
  serverSide?: boolean,
  lengthMenu?: number[],
  filter?: boolean,
  data?: any[],
  pageLength?: number,
  paging?: boolean,
  info?: boolean,
  colReorder?: boolean | object,
  order?: any[],
  columns: object[],
  fixedColumns?: object,
  scrollCollapse?: boolean,
  scrollX?: boolean,
  orderFixed?: object,
  columnDefs?: any[],
  ajax?: any,
  showPagingOnly?: boolean,
  ordering?: boolean,
  rowId?: string
}
export class TicketTransactionMonitor {
  key?: string;
  agentId: String;
  ticketId: String;
  channelId: number;
  sourceId?: string
  sourceName: String;
  agentName: String;
  customerName: String;
  statusName: String;
  requestTime: number | null;
  queueTime: number | null;
  assignTime: number | null;
  totalTime: number | null;
  waitQueueTime: number | null;
  answerTime: number | null;
  holdTime: number = 0
  agentQueueId: String;
  holdStatus: number;
  holdStartTime: number
  channelName: string
  statusId?: string

  constructor(agentQueueId: string, ticketId: string, channelId: number, customerName: string, sourceName: string) {
    this.agentQueueId = agentQueueId;
    this.ticketId = ticketId;
    this.channelId = channelId;
    this.customerName = customerName;
    this.sourceName = sourceName;
  }
}

export interface TransactionFilterParams {
  generalSearch?: string,
  groupId?: string | null,
  channelId: string,
  answerTime: {from: number, to: number}
}

export interface DateTimeRange {
  from?: number | 0,
  to?: number
}

export interface MonitorFilterParams {
  generalSearch?: string
  channelId?: string,
  statusId?: string,
  answerTime?: {from: number | null, to: number | null},
  requestTime?: {from: number | null, to: number | null},
  assignTime?: {from: number | null, to: number | null},
  holdTime?: {from: number | null, to: number | null},
  warningType?: string,
  holdStatus?: number,
  otherFilters?: any
}
