export class CustomerBlacklist {
  customerBlacklistId?: string;
  customerId?: string;
  customerType?: number;
  blockRange?: number;
  blockId?: string;
  blockStartDate?: number;
  blockEndDate?: number;
  applyStatus?: number;
  blockReasonId?: string;
  createType?: number;
  searchCustomer?: string;
  realmName?: string;
  listBlockRange?: number[];
  blockIds?: string[];
  customerName?: string;
  channelIds?: number[];
  sourceIds?: string[];
  parentSourceIds?: string[];
  listCreateType?: number[];
  listBlockType?: number[];
  groupId: string;
}
