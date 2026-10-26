import { CustomerTypeId } from "@core/constant/ticket.enum";
import {CustomerContact} from "@models/ticket/customer-contact.model";

export class Customer {
  customerId?: string;
  customerName?: string;
  code?: string;
  name?: string;
  description?: string;
  companyName?: string;
  customerImg?: string;
  createTime?: number;
  updateTime?: number;
  status?: number;
  createBy?: string;
  updateBy?: string;
  realmName?: string;
  gender?: number;
  genderStr?: string;
  currentAddress?: string;
  placeOfBirth?: string;
  dateOfBirth?: number;
  dateOfBirthStr?: string | null;
  customerType?: CustomerTypeId;
  customerTypeStr?: string;
  validated?: number;
  identifyCard?: string;
  nationality?: string;
  rank?: number;
  customerContact?: CustomerContact[];
  identifyCardDate?: number;
  customerContacts?: CustomerContact[]
}

export class CustomerFilterForm {
  customerName?: string;
  createTime?: any;
  updateTime?: any;
  customerContact?: string;
  identifyCard: string | null
}

export interface CustomerType {
  customerTypeId: number,
  description: string,
  groupId?: string,
  createBy?: string,
  createTime?: number
}

export interface CustomerRank {
  customerRankId: number,
  description: string,
  groupId?: string
}