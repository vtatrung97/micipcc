import {CallflowAction} from "./callflow/abstract-callflow-module.model";

export const CALLFLOW = {
    ACCOUNT_MAIN_CALLFLOW_NAME: 'MainCallflow',

    MAIN_CALLFLOWS: ['MainOpenHours', 'MainLunchHours', 'MainAfterHours', 'MainHolidays'], //'MainOpenHoursMenu', 'MainLunchHoursMenu', 'MainAfterHoursMenu', 'MainHolidaysMenu'],
    MAIN_OPEN_HOURS: 'MainOpenHours',
    MAIN_LUNCH_HOURS: 'MainLunchHours',
    MAIN_AFTER_HOURS: 'MainAfterHours',
    MAIN_HOLIDAYS: 'MainHolidays',
    // MAIN_OPEN_HOURS_MENU: 'MainOpenHoursMenu', MAIN_LUNCH_HOURS_MENU: 'MainLunchHoursMenu', MAIN_AFTER_HOURS_MENU: 'MainAfterHoursMenu', MAIN_HOLIDAYS_MENU: 'MainHolidaysMenu',

    USER_CALLFLOW_TYPE: 'mainUserCallflow',

    TEMPORAL_RULE_TYPE: {
        MAIN_WEEKDAYS: 'main_weekdays',
        MAIN_LUNCHBREAK: 'main_lunchbreak',
        MAIN_HOLIDAYS: 'main_holidays'
    },
    MAIN_WEEKDAYS_TEMPORAL_RULE_NAME: {
        MAIN_MONDAY: 'MainMonday',
        MAIN_TUESDAY: 'MainTuesday',
        MAIN_WEDNESDAY: 'MainWednesday',
        MAIN_THURSDAY: 'MainThursday',
        MAIN_FRIDAY: 'MainFriday',
        MAIN_SATURDAY: 'MainSaturday',
        MAIN_SUNDAY: 'MainSunday'
    },
    MODULE_TYPE: {
        ACDC_MEMBER: 'acdc_member',
        COLLECT_DTMF: 'collect_dtmf',
        RING_GROUP: 'ring_group',
        CALLFLOW: 'callflow',
        DEVICE: 'device',
        MENU: 'menu',
        LANGUAGE: 'language',
        PLAY: 'play',
        PIVOT: 'pivot',
        PIVOT_VARIABLE: 'pivot_variable',
        PIVOT_VIP_CHECK: 'pivot_vip_check',
        TEMPORAL_ROUTE: 'temporal_route',
        USER: 'user',
        VOICEMAIL: 'voicemail',
        BRANCH_VARIABLE: 'branch_variable',
    }
};

export class CallflowSummary {
    id: string;
    name: string;
    type: string;
    numbers: string[];
    patterns: string[];
    featurecode: any;
}

export class CallflowDetail extends CallflowSummary {
    owner_id: string;
    flow: CallflowAction;
    contact_list: any;
    metadata: any;

    constructor(numbers: string[], flow?: CallflowAction, metadata?: any, owner_id?: any, type?: string) {
        super();
        this.numbers = numbers;
        if (flow) {
            this.flow = flow;
        }
        if (metadata) {
            this.metadata = metadata;
        }
        if (owner_id) {
            this.owner_id = owner_id;
        }
        if (type) {
            this.type = type;
        }
    }
}
