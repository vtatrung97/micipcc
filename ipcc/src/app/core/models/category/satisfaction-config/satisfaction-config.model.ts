export class ServiceSatisfactionConfig {
    surveyChannelWebId?: string | null;
    surveyId?: string | null; // id của kịch bản
    surveyChannelId?: number | null;
    sourceIds?: string[] | null;
    frequency?: number | null;
    frequencyUnit?: number | null;
    timeout?: number | null;
    timeoutUnit?: number | null;
    fromHour?: number | null;
    fromMinute?: number | null;
    toHour?: number | null;
    toMinute?: number | null;
    timeSurveyType?: number | null;
    timeSurveySend?: number | null;
    surveyHours?: any[] | null;
    surveyTimes?: any[] | null;
    createTime?: number | null;
    createBy?: string | null;
    updateTime?: number | null;
    updateBy?: string | null;
    status?: string | null;
    surveyType?: number | null;
    language?: string | null;
    buttonSurveyMail?: string | null;
    surveyInvitation?: string | null;
}
