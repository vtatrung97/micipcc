export class ServiceTicketTemplate {
    ticketTemplateId?: string;
    templateName?: any;
    templateContent?: any;
    textareaContent?: any;
    realmName?: string;
    agentId?: string;
    createTime?: number;
    updateTime?: number;
    createBy?: string;
    updateBy?: string;
    status?: string;
    channelId?: string;
    templateSubjectId?: string;
    ticketTemplateChannelId?: string;
    ticketTemplateSubjectId?: string;
    channelName?: string;
    subjectName?: string;
    type?: any;
    typeName?: string;
}

export class TicketTemplateFilterForm {
    templateName?: string;
    channelIds: [];
    templateSubjectIds: [];
    createTimeRange?: object;
    updateTimeRange?: object;
}
