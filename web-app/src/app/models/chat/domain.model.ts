export class Domain {
  domainId!: string;
  domainCode!: string;
  description: string = '';
  requireInfo: number | undefined;
  status: number | undefined;
  realmName: string | undefined;
  createBy!: string;
  createTime!: number;
  updateBy: string | undefined;
  updateTime: number | undefined;
  color: string = '#32787e';
  autoChat: number = 0;
  timeWarningChat: number | undefined;
  timeEndChat: number | undefined;
  chatBotSupport: number | undefined;
  chatBotUrl: string | undefined;
  chatBotSecretKey: string | undefined;
  avatarImg: any = 'assets/images/users/user-dummy-img.png';
  requireMobile: number | undefined;
  allowMobile: number | undefined;
  domainName: string = '';
  surveySend: number | undefined;
  surveyBussinessid: number | undefined;
  surveyType: number | undefined;
  botRealmId: string | undefined;
  botSiteType: string | undefined;
  enableCustomerInfo: number = 0;
  enableWarningEnd: number | undefined = 0;
  enableLoadHistory: number | undefined;
  channelId: number | string | undefined;
  language: string | undefined;
  chatTitle: string = '';
  agentInfo: string | undefined;
  agentDesc: string | undefined;
  messageTitle: string | undefined;
  messageOffline: string | undefined;
  chatName: string = '';
  offlineTitle: string | undefined;
  onlineTitle: string | undefined;
  serviceTitle: string | undefined;
  domainTitle: string | undefined;
  groupId: string | undefined | null;
  colorAgent: string = '#32787e';
  colorCust: string = '#6024fd';
  borderRadius?: number;
  messageOnline: string = '';
  chatInfo: string = '';
  minimumTitle: string = '';
  domainThemeId: string | undefined | null;
  state: boolean | undefined;
}


export class DomainsFilterForm {
  domainName?: string;
  channelIds?: any;
  createByList?: [];
  createTimeRange?: object;
  updateByList?: [];
  updateTimeRange?: object;
  groupId: string | null;
}
