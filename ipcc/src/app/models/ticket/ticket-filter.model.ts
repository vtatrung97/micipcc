export class TicketFilter {
  ticketFilterId: string;
  tableName?: string;
  field: string;
  fieldName: string;
  fieldType: string;
  createTime?: number;
  createBy?: string;
  updateTime?: number;
  updateBy?: string;
  status?: number;
  ordered?: number;
  parentField?: string;
  optional?: number;

  checked?: boolean;
  preOpen: boolean = false;
  selectedValue?: any;
  isDefault: boolean
}