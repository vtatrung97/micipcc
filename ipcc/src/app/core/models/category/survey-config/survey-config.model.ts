export class SurveyConfigModel {
    surveyName?: string | null;
    channelId?: string | null;
    description?: string | null;
    name?: string | null;
    createBy?: string | null;
    createTime?: number | null;
    updateTime?: number | null;
    updateBy?: string | null;
    isReply?: number | null;
}

export class ServiceSurveyConfig {
    surveyChannelWebId?: string | null;
    surveyConfigId?: number | null;
    surveyId?: number | null;
    channelId?: number | null;
    sourceId?: string | null;
    frequency?: number | null;
    frequencyUnit?: number | null;
    timeout?: number | null;
    timeoutUnit?: number | null;
    timeoutMessage?: string | null;
    fromHour?: number | null;
    fromMinute?: number | null;
    toHour?: number | null;
    toMinute?: number | null;
    listSurveyTimeType?: any[] | null;
    listSurveyHour?: any[] | null;
    value?: string | null;
    channelIds?: number[] | null;
    sourceIds?: string[] | null;
    createTime?: number | null;
    createBy?: string | null;
    updateTime?: number | null;
    updateBy?: string | null;
    status?: string | null;
    description?: string | null;
    language?: string | null;
    name?: string | null;
    channelName?: string | null;
    sourceName?: string | null;
}

export class SurveyHour {
    surveyHourId?: string;
    fromHour?: number;
    toHour?: number;
    fromMinute?: number;
    toMinute?: number;
    fromTime?:number;
    toTime?: number;
    status?: number;
}

export class SurveyConfigFilterForm {
    surveyCode?: string;
    surveyName?: string;
    channelIds?: [];
    sourceIds?: [];
    groupId?: string | null;
    createdByUsers?: string[];
    updatedByUsers?: string[];
    createTimeRange?: object;
    updateTimeRange?: object;
}
