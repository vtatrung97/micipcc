import { TicketTag } from "./ticket-tag.model";
import { TicketTypeLevel } from "./ticket-type-level.model";

export class TicketUpdate {
  ticketId: string;
  requestTime?: number;
  ignored?: number;
  endConversation?: boolean;
  ticketStatusId?: string;
  ticketIgnoreId?: string;
  ticketTypeId?: string;
  ticketPriorityId?: string;
  ticketEmotionId?: string;
  ticketTagList?: string;
  ticketTagIds?: any;
  description?: string;
  endReason?: number;

  ticketChannelId?: number;

  oldStatusType?: number;
  newStatusType?: number;

  oldAgentId?: string;
  oldAgentName?: string;
  newAgentId?: string;
  newAgentName?: string;

  realmName?: string;

  groupId?: string;
  oldGroupId?: string;
  newGroupId?: string;

  oldQueueId?: string;
  newQueueId?: string;
  newQueueName?: string;
  isTransferQueueBo?: number;
  transferTime?: number;
  refId?: string;
  sourceCode?: string;
  customerId?: string;
  assignType?: number;

  reportPhone?: string;
  ticketCategories?: TicketTypeLevel[];
  ticketTags?: TicketTag[];

  version?: number;
  ticketParamValues?:any[];
  reasonDetail?: string;

  bccsIsdn?: string;
  isBccsSource?: boolean;
  isdnRequest?: string;  //BCCS: sdt goi len
  bccsCustomerContact?: string; // BCCS: SDT lien he
}
