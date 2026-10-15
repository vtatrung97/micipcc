export class QueueDigitalFilterForm {
    queueId?: string;
    queueName?: string
    channelList?: [];
    channelName?: string;
    createByList?: [];
    updateByList?: [];
    createTimeRange?: object;
    updateTimeRange?: object;
    groupId?: any
}

export class AgentQueueFilterForm {
    agentId?: string;
    agentName?: string
    priority?: string;
    createTimeRange?: object;
}

export class QueueAgentValidationResponse {
    validQueueAgents: ServiceQueueAgent[];
    invalidCount: number;
    linkUrl: string;
    linkUrlPublic: string;
    filePath: string;
    fileName: string;
    fileSize: number;
}

export class ServiceQueues {
    queueId?: string;
    queueManagerId?: string
    description?: string;
    channelName?: string;
    queueParams: QueueParam[];
    valueAlgorithm?: string;
    valuePriority?: string;
    valueTime?: string;
}

export class QueueParam {
    paramId: string;
    queueId?: string;
    value?: string;
    description?: string;
    paramName: string;
    paramCode: string;
    createBy?: string;
    createTime?: any;
    updateBy?: string;
    updateTime?: any;
    type?: number;
    dataSelect?: any
}

export class ServiceQueueAgent {
    queueId?: string;
    agentId?: string;
    agentName?: string;
    priority?: number;
    createTime?: any;
    updateBy?: string;
    updateTime?: any;
    createBy?: string;
}
