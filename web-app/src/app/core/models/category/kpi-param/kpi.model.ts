export class KpiFilterForm {
    paramNames?: [];
    value?: string;
    channelIds?: [];
    sourceIds?: [];
}

export class ServiceKpiConFigParam {
    kpiCfpId?: string | null;
    kpiParamId?: string | null;
    channelId?: number | null;
    sourceId?: string | null;
    value?: string | null;
    createTime?: number | null;
    createBy?: string | null;
    updateTime?: number | null;
    updateBy?: string | null;
    status?: string | null;
    repeatTime?: string | null;
    repeatInterval?: string | null;
    paramName?: string | null;
    paramCode?: string | null;
    statusKpiParam?: string | null;
    description?: string | null;
    kpiParamDisId?: string | null;
    language?: string | null;
    name?: string | null;
    realName?: string | null;
    channelName?: string | null;
    sourceName?: string | null;
    strValue?: string | null;
    validateExpression?: string | null;
}

export class KpiParam {
    kpiParamId?: string | null;
    kpiParamDisId?: string | null;
    paramName?: string | null;
    description?: string | null;
    language?: string | null;
    status?: string | null;
    paramCode?: string | null;
    channelId?: string | null;
    validateExpression?: string | null;
}
