export class QueueParamModel {
    columnWidth: number;
    defaultValue: any;
    defaultValues: defaultValueModel[];
    description: string;
    display: string;
    displayConditionParam: string;
    displayConditionValue: string;
    displayable: number;
    editable: number;
    isCreate: number;
    isRequire: number;
    maxLength: number;
    maxValue: number;
    minLength: number;
    minValue: number;
    order: number;
    paramCode: string;
    paramId: string;
    paramType: number;
    parentId: string;
    queueTabId: string;
    unit: string;
    validateExpression: string;
    tabIndex: number | null;
    tableParams: QueueParamModel[]
}


export class QueueTabModel {
    id: string;
    value: string;
    code?: string;
}
export class defaultValueModel {
    paramId: string;
    value: string;
    display: string;
}

export class QueueTabResponseModel {
    data: QueueTabModel[];
    status: string;
    timestamp: number;
    timestampISO8601: string;
}
export class QueueParamResponseModel {
    data: QueueParamModel[];
    status: string;
    timestamp: number;
    timestampISO8601: string;
}
export class QueueParamDetailModel {
    data: QueueSearchData;
    status: string;
    timestamp: number;
    timestampISO8601: string;
}
export class QueueSearchData {
    columns: string
    createBy: string
    createByList: string
    createTime: number
    createTimeRange: string
    description: string
    draw: string
    groupId: string
    kzAccountId: string
    length: string
    loadParams: any[]
    order: string
    queueCode: string
    queueId: string
    queueName: string
    realmName: string
    search: string
    sort: string
    start: string
    status: string
    updateBy: string
    updateByList: string
    updateTime: number
    updateTimeRange: string
    voiceChannelId: string
    voiceChannelIds: string
}
