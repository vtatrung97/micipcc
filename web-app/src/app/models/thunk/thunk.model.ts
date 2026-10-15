export class ThunkFormSearch {
  trunkId: string | null;
  trunkRules: string | null;
  trunkName: string | null;
  numberWeight: number | null;
  calloutDisplayType: number | null;
  calloutDisplayPhone: string | null;
  calloutRegex: string | null;
  calloutPrefixAdded: string | null;
  isActive: number | null;
}

export class PayloadCreateAndUpdate {
  trunkGatewayId: string | null;
  trunkId: string;
  server: string;
  authenticationRealm: string;
  port: number;
  inviteFormat: string;
  sipUsername: string;
  sipPassword: string;
  prefixAdded: string;
  isActive: number;
  status: number;
  realmName?: string;
  groupId?: string;
  createTime?: number;
  createBy?: string;
  updateTime?: number;
  updateBy?: string;
}

export interface IGateway {
  trunkGatewayId: string
  trunkId: string
  server: string
  authenticationRealm: string
  port: number
  inviteFormat: string
  sipUsername: string
  sipPassword: string
  prefixAdded: string
  customSipInterface: string
  isActive: number
  status: number
}

export interface IPayloadAddOrEditThreshold {
  kzQueueId: string
  thresholdName: string
  thresholdFrom: number
  thresholdTo: number
  mediaId: any
  smsBrandNameId: any
  smsTemplateId: any
  routeInfos: IPayloadAddOrEditThresholdInfo[]
}

export interface IPayloadAddOrEditThresholdInfo {
  temporalRuleIds: string[]
  routeType: number
  number: string
  thresholdLevel: number
  priority: number | null
  queueThresholdSetupId: number | null
}

export class ThresholdFormSearch {
  kzQueueId: string | null | undefined;
  thresholdName: string | null;
  createByList: null;
  updateByList: null;
  createTimeRange: { from: null, to: null }
  updateTimeRange: { from: null, to: null }
}

export interface IDataThreshold {
  draw: any
  start: any
  length: any
  search: any
  columns: any
  order: any
  sort: any
  queueThresholdId: string
  kzQueueId: any
  smsTemplateId: any
  smsTemplateName: any
  smsBrandNameId: any
  serviceId: any
  mediaId: any
  mediaName: any
  thresholdName: string
  thresholdFrom: any
  thresholdTo: any
  thresholdRange: string
  realmName: any
  groupId: any
  status: any
  createTime: number
  createBy: string
  updateTime: any
  updateBy: any
  routeInfos: any
  createByList: any
  updateByList: any
  createTimeRange: any
  updateTimeRange: any
  exceptionBlockRuleDTOList: any[]
}
