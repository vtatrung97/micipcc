export class TemporalRule {
    temporalRuleCode: string;
    temporalRuleId: string;
    temporalRuleName: string;
    cycle: string;
    timeWindowStart: number;
    timeWindowStop: number;
    month: number;
    days: number[];
    wdays: string[];
    intervalValue: number;
    ordinal: string;
    groupId?: string;
    kzAccountId: string;
    realmName: string;
    status: number;
    createBy: string;
    createTime: number;
    updateBy: string;
    updateTime: number;
    startDate: number;
}

export class TemporalFilterForm {
    temporalRuleName: string;
    createByList?: [];
    createTimeRange?: object;
    updateByList?: [];
    updateTimeRange?: object;
    groupId: string | null;
}

export class InitTemporalForm {
    value: number;
    label: string;
}

export class InitDayOfWeeksTemporalForm {
    value: string;
    label: string;
}

export class DatePicker {
    from: number;
    to: number;
}
