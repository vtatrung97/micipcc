import { StringLiteralLike } from "typescript";

export class AutoAnwserFilterForm {
  name: string;
  code: string;
  channelIds: any;
  messageType: string | null;
  status: number | null;
  createTimeRange?: object;
  groupId?: string | null;
  createByList: any;
  updateByList: any
}

export class AutoAnwser {
  autoAnswerCfgId?: string | undefined;
  id?: string | undefined;
  code: string;
  name: string;
  messageType: string;
  messageContent: number;
  groupId?: string;
  realmName?: string;
  ruleApply: string;
  status: number;
  channelIds?: any;
  createBy: string;
  updateBy?: string;
  createByList?: [];
  createTime: number;
  updateTime: number;
  channelNames: string;
  createTimeRange?: object;
  updateByList?: [];
  updateTimeRange?: object;
  sourceIds?: [];
  sourceNames?: string;
}