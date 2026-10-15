export class CalendarFilterForm {
    name?: string;
    channelIds?: [];
    sourceIds?: [];
    startDate?: string;
    endDate?: string;
    calendarTypes?: [];
    calendarName?: string;
}

export class RadioButton {
    workingDay?: string | null;
    fromHour?: number;
    toHour?: number;
}

export class WorkingDayFilterForm {
    day?: number | null;
    fromHour?: number | null;
    fromMinute?: number | null;
    fromSecond?: number | null;
    toHour?: number | null;
    toMinute?: number | null;
    toSecond?: number | null;
}

export class ServiceHoliday {
    calendarHolidayId?: number;
    calendarId?: number;
    day?: any;
    month?: any;
    year?: any;
    name?: string = '';
    status?: number;
    toDay?: any;
    toMonth?: any;
    toYear?: any;
    holidayType?: number;
    createTime?: number;
    createBy?: string = '';
    updateTime?: number;
    updateBy?: string;
    realmName?: string;
    sourceId?: number;
    channelId?: number;
    sourceName?: string = '';
    channelName?: string = '';
    dayMonth?: any;
}

export class ServiceCalendar {
    calendarId?: string;
    calendarName?: string = '';
    description?: string = '';
    createTime?: number;
    createBy?: string = '';
    status?: number;
    realmName?: string;
    calendarType?: number;
    sourceId?: string;
    sourceName?: string = '';
    channelId?: string;
    channelName?: string = '';
    listCalendarTime?: any;
    createTimeHour?: number;
    createByHour?: string = '';
    statusHour?: number;
    type?: number;
}

export class ListCalendarTime {
    id?: number;
    calendarTimeId?: number;
    calendarId?: number;
    day?: number;
    fromHour?: number;
    toHour?: number;
    fromMinute?: number;
    toMinute?: number;
    fromSecond?: number;
    toSecond?: number;
    status?: number;
    fromStart?: any;
    fromEnd?: any;
}
