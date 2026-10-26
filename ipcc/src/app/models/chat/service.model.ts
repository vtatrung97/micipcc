import {ChannelId} from "@core/constant/ticket.enum";

export class Service {
  serviceId: string;
  serviceName: string = '';
  description: string = '';
  serviceCode: string;
  domainId: string;
  status: number;
  createBy: string;
  createTime: number;
  updateBy: string;
  updateTime: number;
  realmName: string;
  channelId?: ChannelId
}

export class ServiceFilterForm {
  searchTerm?: string;
}
