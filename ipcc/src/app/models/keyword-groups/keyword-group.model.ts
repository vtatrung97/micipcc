export class KeywordGroupsFilterForm {
  keywordGroupName?: string;
  keyword?: string
  channelIds?: number[];
  sourceIds?: string[];
  creators?: string[];
  updaters?: string[];
  createdTimeRange?: {from: number | null, to: number | null};
  updatedTimeRange?: {from: number | null, to: number | null};
}

export class KeywordGroup {
  keywordGroupId: string;
  keywordGroupName: string;
  keywords: string;
  channelName: string;
  channelId: number;
  sourceName: string;
  sourceId: number;
  createBy: string;
  createTime: number;
  updateBy: string;
  updateTime: number;
}
