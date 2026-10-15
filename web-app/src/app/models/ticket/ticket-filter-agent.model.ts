export class TicketFilterAgent {
  ticketFilterAgentId?: string;
  agentId?: string;
  agentName?: string;
  filterName?: string;
  createTime?: number;
  createBy?: string;
  updateTime?: number;
  updateBy?: string;
  realmName?: string;
  status?: number;

  type?: number;
}

export class NewTicketFilterAgentNameForm {
  filterName: string = '';
}