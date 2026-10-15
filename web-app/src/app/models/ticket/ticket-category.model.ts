export class TicketCategory {
  ticketCategoryId: string;
  ticketId: string;
  requestTime?: number;
  createTime?: number;
  createBy?: string;
  updateTime?: number;
  updateBy?: string;
  status: number;
  realmName: string;
  ticketTypeId: string;
  parentTypeId?: string;
  level: number;
}