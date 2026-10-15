import {CustomerBlacklist} from "@core/models/customer/customer-blacklist.model";

export class BlockValidationResponse {
  validContacts: CustomerBlacklist[];
  validCustomerIds: string[];
  invalidCount: number;
  linkUrl: string;
  linkUrlPublic: string;
  filePath: string;
  fileName: string;
  fileSize: number;
}
